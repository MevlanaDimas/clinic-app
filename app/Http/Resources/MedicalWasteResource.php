<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MedicalWasteResource extends JsonResource
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
            'medical_waste_id' => $this->medical_waste_id,
            'bill_id' => $this->bill_id,
            'bill_number' => $this->whenLoaded('bills', fn() => $this->bills->bill_number),
            'name' => $this->name,
            'amount' => $this->amount,
            'description' => $this->description,
            'updated_at' => $this->updated_at->format('d-m-Y H:i:s'),
            'created_at' => $this->created_at->format('d-m-Y H:i:s')
        ];
    }
}
