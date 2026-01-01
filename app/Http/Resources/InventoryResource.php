<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryResource extends JsonResource
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
            'name' => $this->name,
            'supplier_id' => $this->whenLoaded('supplier', fn() => $this->supplier->id),
            'supplier_name' => $this->whenLoaded('supplier', fn() => $this->supplier->name),
            'supplier_contact_person' => $this->whenLoaded('supplier', fn() => $this->supplier->contact_person),
            'supplier_email' => $this->whenLoaded('supplier', fn() => $this->supplier->email),
            'supplier_phone_number' => $this->whenLoaded('supplier', fn() => $this->supplier->phone_number),
            'supplier_address' => $this->whenLoaded('supplier', fn() => $this->supplier->address),
            'type' => $this->type,
            'quantity' => $this->quantity,
            'created_at' => $this->created_at->format('d-m-Y H:i:s'),
            'updated_at' => $this->updated_at->format('d-m-Y H:i:s')
        ];
    }
}
