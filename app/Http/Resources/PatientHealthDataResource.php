<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PatientHealthDataResource extends JsonResource
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
            'created_at' => $this->created_at->format('d-m-Y H:i:s'),
            'updated_at' => $this->updated_at->format('d-m-Y H:i:s'),
            'patient_id' => $this->patient_id,
            'systolic_bp' => $this->systolic_bp,
            'diastolic_bp' => $this->diastolic_bp,
            'heart_rate' => $this->heart_rate,
            'oxygen_saturation' => $this->oxygen_saturation,
            'temperature' => $this->temperature,
            'height' => $this->height,
            'weight' => $this->weight,
            'complaints' => $this->complaints
        ];
    }
}
