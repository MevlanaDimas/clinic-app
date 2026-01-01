<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class PatientHealthData extends Model
{
    use HasFactory;

    protected $table = 'patient_health_data';

    protected $fillable = [
        'patient_id',
        'systolic_bp',
        'diastolic_bp',
        'heart_rate',
        'oxygen_saturation',
        'temperature',
        'height',
        'weight',
        'complaints',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function scopeFilter(Builder $query, string $search = ''): void
    {
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('complaints', 'LIKE', "%{$search}%")
                  ->orWhereHas('patient', function ($patientQuery) use ($search) {
                      $patientQuery->where('patient_name', 'LIKE', "%{$search}%");
                  });
            });
        }
    }
}
