<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DiagnoseResource extends JsonResource
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
            'diagnose_code' => $this->diagnose_code,
            'patient_id' => $this->patient_id,
            'patient_number' => $this->whenLoaded('patient', fn() => $this->patient->patient_number),
            'patient_name' => $this->whenLoaded('patient', fn() => $this->patient->patient_name),
            'doctor_id' => $this->doctor_id,
            'doctor' => $this->whenLoaded('doctor', fn() => $this->doctor->name),
            'diagnosis' => $this->diagnosis,
            'treatment' => $this->treatment,
            'prescription' => PrescriptionResource::collection($this->whenLoaded('prescription')),
            'notes' => $this->notes,
            'created_at' => $this->created_at->format('d-m-Y H:i:s'),
            'updated_at' => $this->updated_at->format('d-m-Y H:i:s')
        ];
    }
}
