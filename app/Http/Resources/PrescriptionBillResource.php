<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PrescriptionBillResource extends JsonResource
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
            'total_patient_bill_id' => $this->total_patient_bill_id,
            'item_name' => $this->item_name,
            'prescription' => new PrescriptionResource($this->whenLoaded('prescription')),
            'prescription_id' => $this->prescription_id,
            'amount' => $this->amount,
            'created_at' => $this->created_at->format('d-m-Y H:i:s'),
            'updated_at' => $this->updated_at->format('d-m-Y H:i:s')
        ];
    }
}
