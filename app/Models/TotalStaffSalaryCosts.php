<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class TotalStaffSalaryCosts extends Model
{
    protected $fillable = [
        'employee_payroll_id',
        'total_amount',
        'bill_id',
        'notes'
    ];

    public static function staffPayrollId(){
        $maxId = self::max('id');
        $code = sprintf("STAFFPAY%07d", $maxId ? $maxId + 1 : 1);

        return $code . ' - ' . date('dmY');
    }

    protected static function booted(){
        static::creating(function ($totalStaffSalary){
            $totalStaffSalary->employee_payroll_id = self::staffPayrollId();
        });
    }

    public function staffSalaryCosts(): HasMany
    {
        return $this->hasMany(StaffSalaryCosts::class, 'total_salary_cost_id');
    }

    public function bills(): BelongsTo
    {
        return $this->belongsTo(Bills::class, 'bill_id');
    }

    public function recalculateTotal(): void
    {
        if ($this->relationLoaded('staffSalaryCosts')) {
            $this->staffSalaryCosts->loadMissing('staffSalary');
            $total = $this->staffSalaryCosts->sum(fn($cost) => $cost->staffSalary->monthly_salary ?? 0);
        } else {
            $total = $this->staffSalaryCosts()
                ->join('staff_salaries', 'staff_salary_costs.staff_salary_id', '=', 'staff_salaries.id')
                ->sum('staff_salaries.monthly_salary');
        }

        $this->update(['total_amount' => $total]);
    }

    public function scopeFilter(Builder $query, string $search = ''): void
    {
        $query->when($search, function ($q) use ($search) {
            $q->where(function ($subQ) use ($search) {
                $subQ->whereHas('staffSalaryCosts.staffSalary', function ($staffSalaryCostsQuery) use ($search) {
                    $staffSalaryCostsQuery->where('name', 'LIKE', "%{$search}%")
                                          ->orWhere('position', 'LIKE', "%{$search}%");
                })->orWhereHas('staffSalaryCosts.staffSalary.staff', function ($staffQuery) use ($search) {
                    $staffQuery->where('name', 'LIKE', "%{$search}%")
                               ->orWhere('email', 'LIKE', "%{$search}%");
                })->orWhereHas('bills', function ($billQuery) use ($search) {
                    $billQuery->where('bill_number', 'LIKE', "%{$search}%");
                })->orWhere('employee_payroll_id', 'LIKE', "%{$search}%")
                  ->orWhere('notes', 'LIKE', "%{$search}%");
            });
        });
    }
}
