<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ItemRequestResource extends JsonResource
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
            'request_number' => $this->request_number,
            'requester_name' => $this->whenLoaded('purchaseRequest', fn() => $this->purchaseRequest->requester->name),
            'purchase_request_id' => $this->purchase_request_id,
            'item_name' => $this->item_name,
            'supplier_id' => $this->supplier_id,
            'supplier_name' => $this->whenLoaded('supplier', fn() => $this->supplier->name),
            'supplier_contact_person' => $this->whenLoaded('supplier', fn() => $this->supplier->contact_person),
            'supplier_email' => $this->whenLoaded('supplier', fn() => $this->supplier->email),
            'supplier_phone_number' => $this->whenLoaded('supplier', fn() => $this->supplier->phone_number),
            'supplier_address' => $this->whenLoaded('supplier', fn() => $this->supplier->address),
            'type' => $this->type,
            'reason' => $this->reason,
            'quantity' => $this->quantity,
            'price_per_unit' => $this->price_per_unit,
            'total_price' => $this->total_price,
            'delivery_status' => $this->whenLoaded('purchaseDeliveryStatus', fn() => new DeliveryItemResource($this->purchaseDeliveryStatus)),
            'created_at' => $this->created_at->format('d-m-Y H:i:s'),
            'updated_at' => $this->updated_at->format('d-m-Y H:i:s')
        ];
    }
}
