<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class MarketingCosts extends Model
{
    protected $fillable = [
        'marketing_id',
        'name',
        'amount',
        'description',
        'bill_id'
    ];

    public static function marketingId(){
        $maxId = self::max('id');
        $code = sprintf("MARK%07d", $maxId ? $maxId + 1 : 1);

        return $code . ' - ' . date('dmY');
    }

    protected static function booted(){
        static::creating(function ($marketing){
            $marketing->marketing_id = self::marketingId();
        });
    }

    public function bills(): BelongsTo
    {
        return $this->belongsTo(Bills::class, 'bill_id');
    }

    public function scopeFilter(Builder $query, string $search = ''): void
    {
        if ($search) {
            $query->where(function($q) use ($search){
                $q->whereHas('bills', function ($billQuery) use ($search) {
                    $billQuery->where('bill_number', 'LIKE', "%{$search}%");
                })->orWhere('marketing_id', 'LIKE', "%{$search}%")
                  ->orWhere('name', 'LIKE', "%{$search}%")
                  ->orWhere('amount', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}");
            });
        }
    }
}
