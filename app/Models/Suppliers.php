<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Suppliers extends Model
{
    protected $fillable = [
        'name',
        'contact_person',
        'email',
        'phone_number',
        'address'
    ];

    public function inventory(): HasMany
    {
        return $this->hasMany(Inventories::class, 'supplier_id');
    }

    public function requestItems(): HasMany
    {
        return $this->hasMany(RequestItems::class, 'supplier_id');
    }

    public function scopeFilter(Builder $query, string $search = ''): void
    {
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('contact_person', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%")
                  ->orWhere('phone_number', 'LIKE', "%{$search}%")
                  ->orWhere('address', 'LIKE', "%{$search}%");
            });
        }
    }
}
