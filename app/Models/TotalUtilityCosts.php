<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class TotalUtilityCosts extends Model
{
    protected $fillable = [
        'utility_id',
        'total_amount',
        'bill_id',
        'notes'
    ];

    public static function utilityId(){
        $maxId = self::max('id');
        $code = sprintf("UTILITY%07d", $maxId ? $maxId + 1 : 1);

        return $code . ' - ' . date('dmY');
    }

    protected static function booted(){
        static::creating(function ($totalUtility){
            $totalUtility->utility_id = self::utilityId();
        });
    }

    public function utilityCost(): HasMany
    {
        return $this->hasMany(UtilityCost::class, 'total_utility_cost_id');
    }

    public function bills(): BelongsTo
    {
        return $this->belongsTo(Bills::class, 'bill_id');
    }

    public function recalculateTotal(): void
    {
        $amount = $this->relationLoaded('utilityCost')
            ? $this->utilityCost->sum('amount')
            : $this->utilityCost()->sum('amount');

        $this->update([
            'total_amount' => $amount
        ]);
    }

    public function scopeFilter(Builder $query, string $search = ''): void
    {
        $query->when($search, function ($q) use ($search) {
            $q->where(function ($subQ) use ($search) {
                $subQ->whereHas('utilityCost', function ($utilityCostQuery) use ($search) {
                    $utilityCostQuery->where('name', 'LIKE', "%{$search}%")
                                     ->orWhere('description', 'LIKE', "%{$search}%");
                })->orWhereHas('bills', function ($billQuery) use ($search) {
                    $billQuery->where('bill_number', 'LIKE', "%{$search}%");
                })->orWhere('utility_id', 'LIKE', "%{$search}%")
                  ->orWhere('notes', 'LIKE', "%{$search}%");
            });
        });
    }
}
