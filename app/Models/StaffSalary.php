<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class StaffSalary extends Model
{
    protected $fillable = [
        'name',
        'position',
        'staff_id',
        'monthly_salary'
    ];

    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    public function salaryCosts(): HasMany
    {
        return $this->hasMany(StaffSalaryCosts::class, 'staff_salary_id');
    }

    public function scopeFilter(Builder $query, string $search = ''): void
    {
        if ($search) {
            $query->where(function($q) use ($search){
                $q->whereHas('staff', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'LIKE', "%{$search}%")
                              ->orWhere('email', 'LIKE', "%{$search}%");
                })->orWhereHas('staff.roles', function ($userRoleQuery) use ($search) {
                    $userRoleQuery->where('name', 'LIKE', "%{$search}%");
                })->orWhere('name', 'LIKE', "%{$search}%")
                  ->orWhere('position', 'LIKE', "%{$search}%")
                  ->orWhere('monthly_salary', 'LIKE', "%{$search}%");
            });
        }
    }
}
