<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PatientRegistrationResource extends JsonResource
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
            'patient_id' => $this->patient_id,
            'patient_number' => $this->whenLoaded('patient', fn() => $this->patient->patient_number),
            'patient_name' => $this->whenLoaded('patient', fn() => $this->patient->patient_name),
            'doctor_id' => $this->doctor_id,
            'doctor' => $this->whenLoaded('doctor', fn() => $this->doctor->name),
            'queue_number' => $this->queue_number,
            'status' => $this->status,
            'patient_health_data' => PatientHealthDataResource::collection($this->whenLoaded('patientHealthData')),
        ];
    }
}
