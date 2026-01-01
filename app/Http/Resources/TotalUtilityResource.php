<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TotalUtilityResource extends JsonResource
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
            'utility_id' => $this->utility_id,
            'bill_number' => $this->whenLoaded('bills', fn() => $this->bills->bill_number),
            'bill_id' => $this->whenLoaded('bills', fn() => $this->bills->id),
            'request_items' => UtilityResource::collection($this->whenLoaded('utilityCost')),
            'total_amount' => $this->total_amount,
            'notes' => $this->notes,
            'created_at' => $this->created_at->format('d-m-Y H:i:s'),
            'updated_at' => $this->updated_at->format('d-m-Y H:i:s')
        ];
    }
}
