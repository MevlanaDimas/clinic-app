<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MedicineResource extends JsonResource
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
            'inventory_id' => $this->inventory_id,
            'name' => $this->whenLoaded('inventory', fn() => $this->inventory->name),
            'manufacturer' => $this->whenLoaded('inventory', fn() => $this->inventory->supplier?->name),
            'form' => $this->form,
            'delivery_systems' => $this->delivery_systems,
            'strength' => $this->strength,
            'strength_units' => $this->strength_units,
            'batch_number' => $this->batch_number,
            'quantity_in_stock' => $this->whenLoaded('inventory', fn() => $this->inventory->quantity),
            'expiry_date' => $this->expiry_date,
            'sell_price_per_unit' => $this->sell_price_per_unit,
            'created_at' => $this->created_at->format('d-m-Y H:i:s'),
            'updated_at' => $this->updated_at->format('d-m-Y H:i:s')
        ];
    }
}
