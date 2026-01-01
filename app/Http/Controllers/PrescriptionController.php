<?php

namespace App\Http\Controllers;

use App\Http\Requests\Prescription as RequestsPrescription;
use App\Http\Resources\PrescriptionResource;
use App\Models\Diagnose;
use App\Models\Medicine;
use App\Models\Prescription;
use App\Models\TotalPatientBills;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class PrescriptionController extends Controller
{
    public function index(): Response
    {
        $perPage = request()->query('perPage', 25);
        $search = request()->query('search', '');
        $query = Prescription::query()
            ->with([
                'diagnosis:id,patient_id,doctor_id,diagnose_code,diagnosis',
                'diagnosis.patient:id,patient_name,patient_number',
                'diagnosis.doctor:id,name',
                'medicine:id,inventory_id,form,strength,strength_units',
                'medicine.inventory:id,name,supplier_id,quantity',
                'medicine.inventory.supplier:id,name',
                'prescriptionBill:id,prescription_id,total_patient_bill_id',
                'prescriptionBill.totalPatientBill:id,status'
            ])
            ->filter($search);

        $query->orderBy('created_at', 'ASC');

        if($perPage == -1 || $perPage > 100) {
            $perPage = 100;
        }
        $prescriptions = PrescriptionResource::collection($query->paginate($perPage));

        return Inertia::render('medicine/prescription', [
            'prescriptions' => $prescriptions
        ]);
    }

    public function store(RequestsPrescription $request): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request) {
                $this->createPrescriptionWithBill($request->validated());
            });

            return redirect()->back()->with('success', 'Prescription has been added successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to add prescription. ' . $e->getMessage());
        }
    }

    public function update(RequestsPrescription $request, int $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request, $id) {
                $prescription = Prescription::findOrFail($id);
                $this->updatePrescriptionWithBill($prescription, $request->validated());
            });

            return redirect()->back()->with('success', 'Prescription has been updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update prescription. ' . $e->getMessage());
        }
    }

    public function destroy($id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($id) {
                $prescription = Prescription::with('prescriptionBill.totalPatientBill')->findOrFail($id);
                $totalPatientBill = $prescription->prescriptionBill?->totalPatientBill;

                $prescription->prescriptionBill?->delete();
                $totalPatientBill?->recalculateTotal();
                $prescription->delete();
            });

            return redirect()->back()->with('success', 'Prescription has been deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete prescription. ' . $e->getMessage());
        }
    }

    public function getJson(Request $request): JsonResponse
    {
        $search = $request->query('search', '');
        $query = Prescription::query()
            ->where('status', 'on_process')
            ->with(['diagnosis.patient:id,patient_name,patient_number', 'diagnosis.doctor:id,name', 'medicine.inventory:id,name,supplier_id'])
            ->select('id', 'prescription_code', 'diagnosis_id', 'medicines_id', 'created_at', 'medicine.sell_price_per_unit');

        $query->when($search, function ($q) use ($search) {
            $q->where(function ($subQ) use ($search) {
                $subQ->whereHas('diagnosis', function ($diagnoseQuery) use ($search) {
                    $diagnoseQuery->where('diagnose_code', 'LIKE', "%{$search}%");
                })->orWhereHas('diagnosis.patient', function ($patientQuery) use ($search) {
                    $patientQuery->where('patient_number', 'LIKE', "%{$search}%")
                                 ->orWhere('patient_name', 'LIKE', "%{$search}%");
                })->orWhereHas('diagnosis.doctor', function ($doctorQuery) use ($search) {
                    $doctorQuery->where('name', 'LIKE', "%{$search}%");
                })->orWhereHas('medicine.inventory', function ($inventoryQuery) use ($search) {
                    $inventoryQuery->where('name', 'LIKE', "%{$search}%");
                })
                ->orWhere('prescription_code', 'LIKE', "%{$search}%")
                ->orWhere('instructions', 'LIKE', "%{$search}%");
            });
        });

        $query->orderBy('created_at', 'DESC');

        $prescriptions = $query->limit(20)->get()->map(function ($prescription){
            return [
                'label' => $prescription->prescription_code . ' - ' . ($prescription->medicine->inventory->name ?? 'N/A') . ' - ' . $prescription->diagnosis->patient->patient_name,
                'value' => $prescription->id,
                'medicine_name' => $prescription->medicine->inventory->name ?? '',
                'medicine_price' => $prescription->medicine->sell_price_per_unit ?? 0
            ];
        });

        return response()->json($prescriptions);
    }

    private function createPrescriptionWithBill(array $data): void
    {
        $medicine = Medicine::findOrFail($data['medicines_id']);
        $diagnosis = Diagnose::findOrFail($data['diagnosis_id']);

        $patientId = $diagnosis->patient->id;
        $doctorId = $diagnosis->doctor->id;

        $prescription = $diagnosis->prescription()->create([
            'prescription_code' => 'TEMP',
            'medicines_id' => $medicine->id,
            'diagnosis_id' => $diagnosis->id,
            'dosage' => $data['dosage'],
            'quantity' => $data['quantity'],
            'instructions' => $data['instructions']
        ]);

        $prescription->update([
            'prescription_code' => Prescription::generatePrescriptionNumber($doctorId, $patientId, $prescription->id)
        ]);

        // Try to find existing bill associated with the diagnosis
        $totalPatientBill = $diagnosis->diagnoseBill->totalPatientBill ?? null;

        if (!$totalPatientBill) {
            $patientBillCode = TotalPatientBills::generateBillCode($diagnosis->patient->patient_name);
            $totalPatientBill = $diagnosis->patient->totalPatientBill()->create([
                'bill_code' => $patientBillCode,
                'administrative_fee' => 0
            ]);
        }

        if ($prescription && $totalPatientBill) {
            $totalPatientBill->prescriptionBill()->create([
                'item_name' => $medicine->inventory->name ?? 'N/A',
                'prescription_id' => $prescription->id,
                'amount' => $medicine->sell_price_per_unit * $data['quantity']
            ]);

            // Recalculate bill total
            $totalPatientBill->recalculateTotal();
        }
    }

    private function updatePrescriptionWithBill(Prescription $prescription, array $data): void
    {
        $medicine = Medicine::findOrFail($data['medicines_id']);
        $diagnosis = Diagnose::findOrFail($data['diagnosis_id']);

        $prescription->update([
            'medicines_id' => $medicine->id,
            'diagnosis_id' => $diagnosis->id,
            'dosage' => $data['dosage'],
            'quantity' => $data['quantity'],
            'status' => $data['status'] ?? $prescription->status,
            'instructions' => $data['instructions']
        ]);

        $prescriptionBill = $prescription->prescriptionBill;
        $totalPatientBill = $prescriptionBill ? $prescriptionBill->totalPatientBill : null;

        if ($prescriptionBill) {
            $prescriptionBill->update([
                'item_name' => $medicine->inventory->name ?? 'N/A',
                'amount' => $medicine->sell_price_per_unit * $data['quantity']
            ]);
        }

        if ($totalPatientBill) {
            $totalPatientBill->recalculateTotal();
        }
    }
}
