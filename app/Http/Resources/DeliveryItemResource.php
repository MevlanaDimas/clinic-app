<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeliveryItemResource extends JsonResource
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
            'request_item_id' => $this->request_item_id,
            'status' => $this->status,
            'delivery_service' => $this->delivery_service,
            'tracking_number' => $this->tracking_number,
            'estimated_delivery_time_in_days' => $this->estimated_delivery_time_in_days,
            'rejected_reason' => $this->rejected_reason,
            'returned_reason' => $this->returned_reason,
            'created_at' => $this->created_at->format('d-m-Y H:i:s'),
            'updated_at' => $this->updated_at->format('d-m-Y H:i:s')
        ];
    }
}
