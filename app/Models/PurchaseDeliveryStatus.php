<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseDeliveryStatus extends Model
{
    protected $fillable = [
        'request_item_id',
        'status',
        'delivery_service',
        'tracking_number',
        'estimated_delivery_time_in_days',
        'rejected_reason',
        'returned_reason'
    ];

    public function requestItem(): BelongsTo
    {
        return $this->belongsTo(RequestItems::class, 'request_item_id');
    }
}
