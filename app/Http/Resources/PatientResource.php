<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PatientResource extends JsonResource
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
            'patient_number' => $this->patient_number,
            'patient_name' => $this->patient_name,
            'sex' => $this->sex,
            'blood_type' => $this->blood_type,
            'date_of_birth' => $this->birth_date,
            'age' => $this->age,
            'phone_number' => $this->phone_number,
            'address' => $this->address
        ];
    }
}
