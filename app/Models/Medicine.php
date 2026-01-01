<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Medicine extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_id',
        'form',
        'delivery_systems',
        'strength',
        'strength_units',
        'batch_number',
        'expiry_date',
        'sell_price_per_unit'
    ];

    public function prescription(): HasMany
    {
        return $this->hasMany(Prescription::class, 'medicines_id');
    }

    public function inventory() : BelongsTo 
    {
        return $this->belongsTo(Inventories::class, 'inventory_id');    
    }

    public function scopeFilter(Builder $query, string $search = ''): void
    {
        $query->when($search, function ($q) use ($search) {
            $q->where(function ($subQ) use ($search) {
                $subQ->whereHas('inventory', function ($inventoryQuery) use ($search) {
                    $inventoryQuery->where('type', 'medicine')->where(function($iq) use ($search) {
                        $iq->where('name', 'LIKE', "%{$search}%");
                    });
                })->orWhereHas('inventory.supplier', function ($supplierQuery) use ($search) {
                    $supplierQuery->where('name', 'LIKE', "%{$search}%")
                                  ->orWhere('contact_person', 'LIKE', "%{$search}%");
                })->orWhere('form', 'LIKE', "%{$search}%")
                  ->orWhere('delivery_systems', 'LIKE', "%{$search}%")
                  ->orWhere('strength', 'LIKE', "%{$search}%")
                  ->orWhere('strength_units', 'LIKE', "%{$search}%")
                  ->orWhere('batch_number', 'LIKE', "%{$search}%");
            });
        });
    }
}
