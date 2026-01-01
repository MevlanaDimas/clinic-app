<?php

namespace App\Http\Controllers;

use App\Http\Requests\PatientBill;
use App\Http\Resources\TotalPatientBillsResource;
use App\Models\Diagnose;
use App\Models\Patient;
use App\Models\PatientPrescriptionBills;
use App\Models\TotalPatientBills;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PatientBillsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $perPage = request()->query('perPage', 25);
        $search = request()->query('search', '');
        $query = TotalPatientBills::query()
            ->with(['patient', 'diagnoseBill.diagnose.doctor', 'prescriptionBill.prescription.medicine.inventory'])
            ->filter($search);

        $query->orderByRaw('status = "unpaid" DESC')->orderBy('created_at', 'DESC');

        if ($perPage === -1 || $perPage > 100) {
            $perPage = 100;
        }
        $patientBills = TotalPatientBillsResource::collection($query->paginate($perPage));

        return Inertia::render('patient/total-patient-bills', [
            'patientBills' => $patientBills
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PatientBill $request): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request) {
                // Lock to prevent duplicate bill codes
                TotalPatientBills::lockForUpdate()->latest('id')->first();

                $patient = Patient::findOrFail($request->patient_id);
                $billCode = TotalPatientBills::generateBillCode($patient->patient_name);

                $patientBill = TotalPatientBills::create([
                    'bill_code' => $billCode,
                    'patient_id' => $patient->id,
                    'administrative_fee' => $request->administrative_fee
                ]);

                $this->handleDiagnosisBill($patientBill, $request->input('diagnosis'));
                $this->handlePrescriptionBills($patientBill, $request->input('prescriptions'));

                $patientBill->recalculateTotal();
            });

            return redirect()->back()->with('success', 'Patient bill added successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to add patient bill. ' . $e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PatientBill $request, int $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request, $id) {
                $patientBill = TotalPatientBills::findOrFail($id);
                $patient = Patient::findOrFail($request->patient_id);
                $billCode = $patientBill->bill_code;

                if ($patientBill->patient_id !== $patient->id) {
                    $billCode = TotalPatientBills::generateBillCode($patient->patient_name);
                }

                $patientBill->update([
                    'bill_code' => $billCode,
                    'patient_id' => $patient->id,
                    'administrative_fee' => $request->administrative_fee
                ]);

                $this->handleDiagnosisBill($patientBill, $request->input('diagnosis'));
                $this->syncPrescriptionBills($patientBill, $request->input('prescriptions'));

                $patientBill->update(['status' => $request->status]);
                $patientBill->recalculateTotal();
            });

            return redirect()->back()->with('success', 'Patient bill updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update patient bill. ' . $e->getMessage());
        }
    }

    /**
     * Print the specified resource.
     */
    public function print(int $id): Response
    {
        $bill = TotalPatientBills::with([
            'patient',
            'diagnoseBill.diagnose.doctor',
            'prescriptionBill.prescription.medicine.inventory'
        ])->findOrFail($id);

        return Inertia::render('patient/print-invoice', [
            'bill' => new TotalPatientBillsResource($bill)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($id) {
                $patientBill = TotalPatientBills::findOrFail($id);
                $patientBill->diagnoseBill()->delete();
                $patientBill->prescriptionBill()->delete();
                $patientBill->delete();
            });

            return redirect()->back()->with('success', 'Patient bill deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete patient bill. ' . $e->getMessage());
        }
    }

    private function handleDiagnosisBill(TotalPatientBills $patientBill, ?array $diagnosisData): void
    {
        if (!$diagnosisData) {
            return;
        }

        $diagnose = Diagnose::findOrFail($diagnosisData['diagnose_id']);
        $patientBill->diagnoseBill()->updateOrCreate(
            [],
            [
                'item_name' => $diagnosisData['item_name'],
                'diagnose_id' => $diagnose->id,
                'amount' => $diagnosisData['amount']
            ]
        );
    }

    private function handlePrescriptionBills(TotalPatientBills $patientBill, ?array $prescriptions): void
    {
        if (!$prescriptions) {
            return;
        }

        foreach ($prescriptions as $item) {
            $patientBill->prescriptionBill()->create([
                'item_name' => $item['item_name'],
                'prescription_id' => $item['prescription_id'],
                'amount' => $item['amount']
            ]);
        }
    }

    private function syncPrescriptionBills(TotalPatientBills $patientBill, ?array $prescriptions): void
    {
        if (!$prescriptions) {
            return;
        }

        $existingIds = $patientBill->prescriptionBill()->pluck('id')->toArray();
        $incomingIds = collect($prescriptions)->pluck('id')->filter()->toArray();

        $this->handlePrescriptionBills($patientBill, array_filter($prescriptions, fn($p) => !isset($p['id'])));
        
        PatientPrescriptionBills::destroy(array_diff($existingIds, $incomingIds));
    }
}
