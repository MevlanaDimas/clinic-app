<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Builder;

class Diagnose extends Model
{
    use HasFactory;

    protected $fillable = [
        'diagnose_code',
        'patient_id',
        'doctor_id',
        'diagnosis',
        'treatment',
        'notes'
    ];

    public static function generateDiagnoseNumber(string $doctorName, string $patientName, ?int $id = null): string
    {
        $doctorCode = !empty($doctorName) ? substr($doctorName, 0, 3) . strtoupper(substr($doctorName, -1)) : 'UNK';
        $patientCode = !empty($patientName) ? substr($patientName, 0, 3) . strtoupper(substr($patientName, -1)) : 'UNK';
        
        if ($id) {
            $code = sprintf("D%03d", $id);
        } else {
            $maxId = self::max('id');
            $code = sprintf("D%03d", $maxId ? $maxId + 1 : 1);
        }
        return "DR-" . $doctorCode . "-" . $patientCode . "-" . $code;
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all of the prescriptions for the Diagnose
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function prescription(): HasMany
    {
        return $this->hasMany(Prescription::class, 'diagnosis_id');
    }

    public function diagnoseBill(): HasOne
    {
        return $this->hasOne(PatientDiagnoseBills::class, 'diagnose_id');
    }

    public function scopeFilter(Builder $query, string $search = ''): void
    {
        $query->when($search, function ($q) use ($search) {
            $q->where(function ($subQ) use ($search) {
                $subQ->whereHas('patient', function ($patientQuery) use ($search) {
                    $patientQuery->where('patient_name', 'LIKE', "%{$search}%")
                                 ->orWhere('patient_number', 'LIKE', "%{$search}%");
                })->orWhere('diagnose_code', 'LIKE', "%{$search}%")
                  ->orWhere('diagnosis', 'LIKE', "%{$search}%")
                  ->orWhere('treatment', 'LIKE', "%{$search}%");
            });
        });
    }
}
