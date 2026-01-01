<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffSalaryCosts extends Model
{
    protected $fillable = [
        'staff_salary_id',
        'total_salary_cost_id'
    ];

    public function staffSalary(): BelongsTo
    {
        return $this->belongsTo(StaffSalary::class, 'staff_salary_id');
    }

    public function totalStaffSalaryCost(): BelongsTo
    {
        return $this->belongsTo(TotalStaffSalaryCosts::class, 'total_salary_cost_id');
    }
}
