<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TotalPatientBillsResource extends JsonResource
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
            'bill_code' => $this->bill_code,
            'patient_id' => $this->whenLoaded('patient', fn() => $this->patient->id),
            'patient_number' => $this->whenLoaded('patient', fn() => $this->patient->patient_number),
            'patient_name' => $this->whenLoaded('patient', fn() => $this->patient->patient_name),
            'patient_age' => $this->whenLoaded('patient', fn() => $this->patient->age),
            'patient_sex' => $this->whenLoaded('patient', fn() => $this->patient->sex),
            'patient_phone_number' => $this->whenLoaded('patient', fn() => $this->patient->phone_number),
            'patient_address' => $this->whenLoaded('patient', fn() => $this->patient->address),
            'diagnose_bill' => DiagnoseBillResource::collection($this->whenLoaded('diagnoseBill')),
            'prescription_bills' => PrescriptionBillResource::collection($this->whenLoaded('prescriptionBill')),
            'admin_fee' => $this->administrative_fee,
            'status' => $this->status,
            'total_amount' => $this->total_cost,
            'created_at' => $this->created_at->format('d-m-Y H:i:s'),
            'updated_at' => $this->updated_at->format('d-m-Y H:i:s')
        ];
    }
}
