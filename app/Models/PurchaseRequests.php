<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class PurchaseRequests extends Model
{
    protected $fillable = [
        'purchase_request_id',
        'user_id',
        'status',
        'required_by_date',
        'bill_id',
        'total_amount',
        'notes'
    ];

    public static function generatePurchaseRequestId(string $userName, ?int $id = null): string
    {
        $userCode = !empty($userName) ? substr($userName, 0, 3) . strtoupper(substr($userName, -1)) : 'UNK';
        
        if ($id) {
            $code = sprintf("%07d", $id);
        } else {
            $maxId = self::max('id');
            $code = sprintf("%07d", $maxId ? $maxId + 1 : 1);
        }

        return "PR-" . $userCode . "-" . $code;
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(RequestItems::class, 'purchase_request_id');
    }

    public function bill(): BelongsTo
    {
        return $this->belongsTo(Bills::class, 'bill_id');
    }

    public function recalculateTotal(): void
    {
        $total = $this->relationLoaded('items')
            ? $this->items->sum('total_price')
            : $this->items()->sum('total_price');

        $this->update(['total_amount' => $total]);
    }

    public function scopeFilter(Builder $query, string $search = ''): void
    {
        $query->when($search, function ($q) use ($search) {
            $q->where(function ($subQ) use ($search) {
                $subQ->whereHas('requester', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'LIKE', "%{$search}%")
                              ->orWhere('email', 'LIKE', "%{$search}%");
                })->orWhereHas('items', function ($itemRequestQuery) use ($search) {
                    $itemRequestQuery->where('request_number', 'LIKE', "%{$search}%")
                                    ->orWhere('item_name', 'LIKE', "%{$search}%")
                                     ->orWhere('reason', 'LIKE', "%{$search}%")
                                     ->orWhere('quantity', 'LIKE', "%{$search}%")
                                     ->orWhere('price_per_unit', 'LIKE', "%{$search}%")
                                     ->orWhere('total_price', 'LIKE', "%{$search}%");
                })->orWhereHas('items.supplier', function ($itemRequestSupplierQuery) use ($search) {
                    $itemRequestSupplierQuery->where('name', 'LIKE', "%{$search}%")
                                             ->orWhere('contact_person', 'LIKE', "%{$search}%")
                                             ->orWhere('email', 'LIKE', "%{$search}%")
                                             ->orWhere('phone_number', 'LIKE', "%{$search}%")
                                             ->orWhere('address', 'LIKE', "%{$search}%");
                })->orWhereHas('bill', function ($billQuery) use ($search) {
                    $billQuery->where('bill_number', 'LIKE', "%{$search}%");
                })->orWhere('purchase_request_id', 'LIKE', "%{$search}%")
                  ->orWhere('status', 'LIKE', "%{$search}%")
                  ->orWhere('required_by_date', 'LIKE', "%{$search}%");
            });
        });
    }
}
