<?php

namespace App\Http\Controllers;

use App\Http\Requests\Diagnose as RequestsDiagnose;
use App\Http\Resources\DiagnoseResource;
use App\Models\Diagnose;
use App\Models\Prescription;
use App\Models\User;
use App\Models\Patient;
use App\Models\TotalPatientBills;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class DiagnoseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $perPage = $request->query('perPage', 25);
        $search = $request->query('search', '');
        $doctor = $request->user()->id;
        $query = Diagnose::query()
            ->where('doctor_id', $doctor)
            ->with(['patient', 'doctor', 'prescription.medicine', 'prescription.diagnosis'])
            ->filter($search);

        $query->orderBy('created_at', 'ASC');

        // Cap perPage to prevent DoS
        if ($perPage == -1 || $perPage > 100) {
            $perPage = 100;
        }
        $diagnoses = DiagnoseResource::collection($query->paginate($perPage));

        return Inertia::render('doctor/diagnose', [
            'diagnoses' => $diagnoses
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(RequestsDiagnose $request): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request) {
                $data = $request->validated();
                $patient = Patient::findOrFail($data['patient_id']);
                $doctor = User::findOrFail($data['doctor_id']);

                $diagnose = Diagnose::create([
                    'diagnose_code' => 'TEMP-' . uniqid(), // Temporary placeholder
                    'patient_id' => $data['patient_id'],
                    'doctor_id' => $data['doctor_id'],
                    'diagnosis' => $data['diagnosis'],
                    'treatment' => $data['treatment'],
                    'notes' => $data['notes'] ?? null
                ]);

                // Update with actual ID-based code for safety
                $diagnose->update([
                    'diagnose_code' => Diagnose::generateDiagnoseNumber($doctor->name, $patient->patient_name, $diagnose->id)
                ]);

                $patientBillCode = TotalPatientBills::generateBillCode($patient->patient_name);

                // Create or find the total bill for the patient.
                $totalPatientBill = $patient->totalPatientBill()->create([
                    'bill_code' => $patientBillCode,
                    'administrative_fee' => 0
                ]);

                $this->processPrescriptions($diagnose, $data['prescriptions'] ?? [], $doctor, $patient, $totalPatientBill);

                // Create the diagnose bill associated with the total bill.
                $totalPatientBill->diagnoseBill()->create([
                    'diagnose_id' => $diagnose->id,
                ]);

                $totalPatientBill->recalculateTotal();
            });
        
            return redirect()->back()->with('success', 'Diagnose has been added successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to add diagnose. ' . $e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(RequestsDiagnose $request, string $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request, $id) {
                $diagnose = Diagnose::with(['patient', 'diagnoseBill.totalPatientBill'])->findOrFail($id);
                $data = $request->validated();
                $totalPatientBill = $diagnose->diagnoseBill?->totalPatientBill;

                $diagnoseBill = $diagnose->diagnoseBill;

                $diagnose->update([
                    'diagnosis' => $data['diagnosis'],
                    'treatment' => $data['treatment'],
                    'notes' => $data['notes'] ?? null
                ]);

                $this->syncPrescriptions($diagnose, $data['prescriptions'] ?? [], $totalPatientBill);

                if ($diagnoseBill) {
                    $diagnoseBill->update(['diagnose_id' => $diagnose->id]);
                }
            
                if ($totalPatientBill) {
                    $totalPatientBill->recalculateTotal();
                }
            });

            return redirect()->back()->with('success', 'Diagnose has been updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update diagnose. ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($id) {
                $diagnose = Diagnose::with(['prescription.prescriptionBill', 'diagnoseBill.totalPatientBill'])->findOrFail($id);

                // Delete related prescription bills
                if ($diagnose->prescription) {
                    foreach ($diagnose->prescription as $prescription) {
                        $prescription->prescriptionBill?->delete();
                    }
                    // Delete related prescriptions
                    $diagnose->prescription()->delete();
                }

                if ($diagnose->diagnoseBill) {
                    $totalPatientBill = $diagnose->diagnoseBill->totalPatientBill;
                    $diagnose->diagnoseBill()->delete();
                    $totalPatientBill?->delete();
                }
                $diagnose->delete();
            });

            return redirect()->back()->with('success', 'Diagnose has been deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete diagnose. ' . $e->getMessage());
        }
    }

    public function getJson(Request $request): JsonResponse
    {
        $search = $request->query('search', '');
        // Optimize: Select only needed columns for the relationship
        $query = Diagnose::query()
            ->with(['patient:id,patient_name,patient_number', 'doctor:id,name'])
            ->select('id', 'diagnose_code', 'patient_id', 'doctor_id', 'created_at'); // Already selecting specific columns

        $query->when($search, function ($q) use ($search) {
            $q->where(function ($subQ) use ($search) {
                $subQ->whereHas('patient', function ($patientQuery) use ($search) {
                    $patientQuery->where('patient_number', 'LIKE', "%{$search}%")
                                 ->orWhere('patient_name', 'LIKE', "%{$search}%");
                })->orWhereHas('doctor', function ($doctorQuery) use ($search) {
                    $doctorQuery->where('name', 'LIKE', "%{$search}%")
                                ->orWhere('email', 'LIKE', "%{$search}%");
                })->orWhere('diagnose_code', 'LIKE', "%{$search}%");
            });
        });

        $query->orderBy('created_at', 'DESC');

        $diagnoses = $query->limit(20)
            ->get()
            ->map(function ($diagnosis){
            return [
                'label' => $diagnosis->diagnose_code . ' - ' . $diagnosis->patient->patient_name . ' (' . $diagnosis->doctor->name . ')',
                'value' => $diagnosis->id
            ];
        });

        return response()->json($diagnoses);
    }

    private function processPrescriptions(Diagnose $diagnose, array $prescriptions, User $doctor, Patient $patient, TotalPatientBills $totalPatientBill): void
    {
        if (empty($prescriptions)) {
            return;
        }

        foreach ($prescriptions as $prescriptionData) {
            $prescription = $diagnose->prescription()->create([
                'prescription_code' => 'TEMP-' . uniqid(),
                'medicines_id' => (int) $prescriptionData['medicines_id'],
                'dosage' => '',
                'quantity' => $prescriptionData['quantity'],
                'instructions' => ''
            ]);

            $totalPatientBill->prescriptionBill()->create([
                'prescription_id' => $prescription->id,
                'item_name' => $prescription->medicine->inventory->name,
                'amount' => (float) $prescription->medicine->sell_price_per_unit * (int) $prescription->quantity
            ]);

            $prescription->update([
                'prescription_code' => Prescription::generatePrescriptionNumber($doctor->id, $patient->id, $prescription->id)
            ]);
        }
    }

    private function syncPrescriptions(Diagnose $diagnose, array $prescriptions, ?TotalPatientBills $totalPatientBill): void
    {
        if (empty($prescriptions)) {
            return;
        }

        $existingPrescriptionIds = $diagnose->prescription()->pluck('id')->toArray();
        $incomingPrescriptionIds = [];

        foreach ($prescriptions as $prescription) {
            $prescriptionData = [
                'medicines_id' => $prescription['medicines_id'],
                'quantity' => $prescription['quantity'],
                'dosage' => $prescription['dosage'] ?? '',
                'instructions' => $prescription['instructions'] ?? '',
            ];
            $newOrUpdatedPrescription = $diagnose->prescription()->updateOrCreate(['id' => $prescription['id'] ?? null], $prescriptionData);
            $incomingPrescriptionIds[] = $newOrUpdatedPrescription->id;

            if ($newOrUpdatedPrescription->wasRecentlyCreated) {
                $newOrUpdatedPrescription->update([
                    'prescription_code' => Prescription::generatePrescriptionNumber($diagnose->doctor_id, $diagnose->patient_id, $newOrUpdatedPrescription->id)
                ]);
            }

            // Create or update the associated prescription bill
            if ($totalPatientBill) {
                $totalPatientBill->prescriptionBill()->updateOrCreate(
                    ['prescription_id' => $newOrUpdatedPrescription->id],
                    [
                        'item_name' => $newOrUpdatedPrescription->medicine->inventory->name,
                        'amount' => $newOrUpdatedPrescription->medicine->sell_price_per_unit * $newOrUpdatedPrescription->quantity
                    ]
                );
            }
        }
        // Delete prescriptions that were removed on the frontend
        $prescriptionsToDelete = array_diff($existingPrescriptionIds, $incomingPrescriptionIds);
        Prescription::destroy($prescriptionsToDelete);
    }
}
