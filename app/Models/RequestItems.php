<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Builder;

class RequestItems extends Model
{
    protected $fillable = [
        'request_number',
        'purchase_request_id',
        'item_name',
        'supplier_id',
        'type',
        'reason',
        'quantity',
        'price_per_unit',
        'total_price'
    ];

    public static function generateRequestNumber(int $userId, int $supplierId, string $itemName, int $id): string
    {
        $itemCode = !empty($itemName) ? substr($itemName, 0, 3) . strtoupper(substr($itemName, -1)) : 'UNK';
        return sprintf("RI-%s%d%d-%07d", $itemCode, $userId, $supplierId, $id);
    }

    protected static function booted()
    {
        static::saving(function ($item) {
            $item->total_price = (int) $item->quantity * (float) $item->price_per_unit;
        });
    }

    public function purchaseRequest(): BelongsTo
    {
        return $this->belongsTo(PurchaseRequests::class, 'purchase_request_id');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Suppliers::class, 'supplier_id');
    }

    public function purchaseDeliveryStatus(): HasOne
    {
        return $this->hasOne(PurchaseDeliveryStatus::class, 'request_item_id');
    }

    public function scopeFilter(Builder $query, string $search = ''): void
    {
        if ($search) {
            $query->where(function($q) use ($search){
                $q->whereHas('supplier', function ($supplierQuery) use ($search) {
                    $supplierQuery->where('name', 'LIKE', "%{$search}%")
                                  ->orWhere('contact_person', 'LIKE', "%{$search}%")
                                  ->orWhere('email', 'LIKE', "%{$search}%")
                                  ->orWhere('phone_number', 'LIKE', "%{$search}%")
                                  ->orWhere('address', 'LIKE', "%{$search}%");
                })->orWhereHas('purchaseDeliveryStatus', function($deliveryStatusQuery) use ($search) {
                    $deliveryStatusQuery->where('status', 'LIKE', "%{$search}%")
                                        ->orWhere('delivery_service', 'LIKE', "%{$search}%")
                                        ->orWhere('tracking_number', 'LIKE', "%{$search}%")
                                        ->orWhere('estimated_delivery_time_in_days', 'LIKE', "%{$search}%");
                })->orWhere('request_number', 'LIKE', "%{$search}%")
                  ->orWhere('item_name', 'LIKE', "%{$search}%")
                  ->orWhere('type', 'LIKE', "%{$search}%")
                  ->orWhere('reason', 'LIKE', "%{$search}%");
            });
        }
    }
}
