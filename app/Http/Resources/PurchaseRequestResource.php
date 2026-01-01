<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseRequestResource extends JsonResource
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
            'bill_number' => $this->whenLoaded('bill', fn() => $this->bill->bill_number),
            'bill_id' => $this->whenLoaded('bill', fn() => $this->bill->id),
            'user_id' => $this->user_id,
            'purchase_request_id' => $this->purchase_request_id,
            'requester_id' => $this->whenLoaded('requester', fn() => $this->requester->id),
            'requester_name' => $this->whenLoaded('requester', fn() => $this->requester->name),
            'requester_email' => $this->whenLoaded('requester', fn() => $this->requester->email),
            'request_items' => ItemRequestResource::collection($this->whenLoaded('items')),
            'required_by_date' => $this->required_by_date,
            'status' => $this->status,
            'total_amount' => $this->total_amount,
            'notes' => $this->notes,
            'created_at' => $this->created_at->format('d-m-Y H:i:s'),
            'updated_at' => $this->updated_at->format('d-m-Y H:i:s')
        ];
    }
}
