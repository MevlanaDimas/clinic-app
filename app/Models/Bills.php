<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Bills extends Model
{
    protected $fillable = [
        'bill_number',
        'total_amount',
        'status',
        'notes'
    ];

    public static function billNumber(){
        $maxId = self::max('id');
        $code = sprintf("BILL%07d", $maxId ? $maxId + 1 : 1);

        return $code . ' - ' . date('dmY');
    }

    protected static function booted(){
        static::creating(function ($bill){
            $bill->bill_number = self::billNumber();
        });
    }

    public function totalStaffSalaryCost(): HasMany
    {
        return $this->hasMany(TotalStaffSalaryCosts::class, 'bill_id');
    }

    public function utilityCosts(): HasMany
    {
        return $this->hasMany(TotalUtilityCosts::class, 'bill_id');
    }

    public function marketingCosts(): HasMany
    {
        return $this->hasMany(MarketingCosts::class, 'bill_id');
    }

    public function medicalWasteManagementCosts(): HasMany
    {
        return $this->hasMany(MedicalWasteManagementCosts::class, 'bill_id');
    }

    public function purchaseRequests(): HasMany
    {
        return $this->hasMany(PurchaseRequests::class, 'bill_id');
    }

    public function recalculateTotal(): void
    {
        $marketing = $this->relationLoaded('marketingCosts') ? $this->marketingCosts->sum('amount') : $this->marketingCosts()->sum('amount');
        $waste = $this->relationLoaded('medicalWasteManagementCosts') ? $this->medicalWasteManagementCosts->sum('amount') : $this->medicalWasteManagementCosts()->sum('amount');
        
        // Note: These relations use 'total_amount'
        $purchase = $this->relationLoaded('purchaseRequests') ? $this->purchaseRequests->sum('total_amount') : $this->purchaseRequests()->sum('total_amount');
        $utility = $this->relationLoaded('utilityCosts') ? $this->utilityCosts->sum('total_amount') : $this->utilityCosts()->sum('total_amount');
        $salary = $this->relationLoaded('totalStaffSalaryCost') ? $this->totalStaffSalaryCost->sum('total_amount') : $this->totalStaffSalaryCost()->sum('total_amount');

        $total = $marketing + $waste + $purchase + $utility + $salary;

        $this->update(['total_amount' => $total]);
    }

    public function scopeFilter(Builder $query, string $search = ''): void
    {
        $query->when($search, function ($q) use ($search) {
            $q->where(function ($subQ) use ($search) {
                $subQ->where('bill_number', 'LIKE', "%{$search}%")
                  ->orWhere('status', 'LIKE', "%{$search}%")
                  ->orWhere('notes', 'LIKE', "%{$search}%");
            });
        });
    }
}
