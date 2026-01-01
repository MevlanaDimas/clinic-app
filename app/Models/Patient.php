<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Patient extends Model
{
    /** @use HasFactory<\Database\Factories\PatientFactory> */
    use HasFactory;

    protected $appends = ['age'];

    protected $fillable = [
        'patient_number',
        'patient_name',
        'sex',
        'blood_type',
        'birth_date',
        'phone_number',
        'address'
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
        ];
    }

    public static function patientNumber(){
        $maxId = self::max('id');
        $code = sprintf("P%07d", $maxId ? $maxId + 1 : 1);
        return "PTN-" . date('Y') . $code;
    }

    public function getAgeAttribute(): ?int
    {
        return $this->birth_date ? $this->birth_date->age : null;
    }

    protected static function booted(){
        static::creating(function ($patient){
            $patient->patient_number = self::patientNumber();
        });
    }

    public function healthData(): HasMany
    {
        return $this->hasMany(PatientHealthData::class, 'patient_id');
    }

    public function registration(): HasOne
    {
        return $this->hasOne(PatientRegistration::class, 'patient_id');
    }

    public function diagnose(): HasMany
    {
        return $this->hasMany(Diagnose::class, 'patient_id');
    }

    public function prescription(): HasMany
    {
        return $this->hasMany(Prescription::class, 'patient_id');
    }

    public function totalPatientBill(): HasMany
    {
        return $this->hasMany(TotalPatientBills::class, 'patient_id');
    }

    public function scopeFilter(Builder $query, string $search = ''): void
    {
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('patient_name', 'LIKE', "%{$search}%")
                  ->orWhere('patient_number', 'LIKE', "%{$search}%")
                  ->orWhere('address', 'LIKE', "%{$search}%")
                  ->orWhere('phone_number', 'LIKE', "%{$search}%")
                  ->orWhere('sex', 'LIKE', "%{$search}%")
                  ->orWhere('blood_type', 'LIKE', "%{$search}%");
            });
        }
    }
}
