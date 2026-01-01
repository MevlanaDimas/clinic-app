<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Inventories extends Model
{
    protected $fillable = [
        'name',
        'manufacturer',
        'supplier_id',
        'type',
        'quantity'
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Suppliers::class, 'supplier_id');
    }

    public function medicines() : HasMany 
    {
        return $this->hasMany(Medicine::class, 'inventory_id');    
    }

    public function scopeFilter(Builder $query, string $search = ''): void
    {
        $query->when($search, function ($q) use ($search) {
            $q->where(function ($subQ) use ($search) {
                $subQ->whereHas('supplier', function ($supplierQuery) use ($search) {
                    $supplierQuery->where('name', 'LIKE', "%{$search}%")
                                  ->orWhere('contact_person', 'LIKE', "%{$search}%")
                                  ->orWhere('email', 'LIKE', "%{$search}%")
                                  ->orWhere('phone_number', 'LIKE', "%{$search}%")
                                  ->orWhere('address', 'LIKE', "%{$search}%");
                })->orWhere('name', 'LIKE', "%{$search}%")
                  ->orWhere('type', 'LIKE', "%{$search}%")
                  ->orWhere('quantity', 'LIKE', "%{$search}%");
            });
        });
    }
}
