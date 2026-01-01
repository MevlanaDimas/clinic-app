<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PrescriptionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'prescription_code' => $this->prescription_code,
            'diagnosis_id' => $this->diagnosis_id,
            'diagnosis_code' => $this->whenLoaded('diagnosis', fn() => $this->diagnosis->diagnose_code),
            'diagnosis' => $this->whenLoaded('diagnosis', fn() => $this->diagnosis->diagnosis),
            'medicines_id' => $this->medicines_id,
            'medicine_name' => $this->whenLoaded('medicine', fn() => $this->medicine->inventory->name),
            'medicine_manufacturer' => $this->whenLoaded('medicine', fn() => $this->medicine->inventory->supplier->name),
            'medicine_form' => $this->whenLoaded('medicine', fn() => $this->medicine->form),
            'medicine_strength' => $this->whenLoaded('medicine', fn() => $this->medicine->strength),
            'medicine_strength_unit' => $this->whenLoaded('medicine', fn() => $this->medicine->strength_units),
            'patient_name' => $this->whenLoaded('diagnosis', fn() => $this->diagnosis?->patient?->patient_name),
            'doctor_name' => $this->whenLoaded('diagnosis', fn() => $this->diagnosis?->doctor?->name),
            'dosage' => $this->dosage,
            'quantity' => $this->quantity,
            'status' => $this->status,
            'paid_status' => $this->whenLoaded('prescriptionBill', function () {
                return $this->prescriptionBill?->totalPatientBill?->status;
            }),
            'instructions' => $this->instructions,
            'created_at' => $this->created_at->format('d-m-Y H:i:s'),
            'updated_at' => $this->updated_at->format('d-m-Y H:i:s')
        ];
    }
}
