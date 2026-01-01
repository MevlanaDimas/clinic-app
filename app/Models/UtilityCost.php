<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class UtilityCost extends Model
{
    protected $fillable = [
        'total_utility_cost_id',
        'name',
        'amount',
        'description'
    ];

    public function totalUtilityCost(): BelongsTo
    {
        return $this->belongsTo(TotalUtilityCosts::class, 'total_utility_cost_id');
    }

    public function scopeFilter(Builder $query, string $search = ''): void
    {
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }
    }
}
