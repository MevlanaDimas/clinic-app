<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class PatientRegistration extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'doctor_id', // Changed from 'doctor' to 'doctor_id'
        'queue_number',
        'status'
    ];

    // This method now expects a Doctor's name (string) to derive the code
    public static function generateQueueNumber(string $doctorName, ?int $id = null): string
    {
        // Ensure doctorName is not empty to avoid errors with substr
        $doctorCode = !empty($doctorName) ? substr($doctorName, 0, 3) . strtoupper(substr($doctorName, -1)) : 'UNK'; // 'UNK' for unknown
        
        if ($id) {
            $code = sprintf("Q%03d", $id);
        } else {
            $maxId = self::max('id');
            $code = sprintf("Q%03d", $maxId ? $maxId + 1 : 1);
        }
        return  "DR-" . $doctorCode . "-" . $code;
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id'); // Assuming doctors are users
    }

    public function patientHealthData(): HasMany
    {
        // Directly link via patient_id on both models
        return $this->hasMany(PatientHealthData::class, 'patient_id', 'patient_id');
    }

    public function scopeFilter(Builder $query, string $search = ''): void
    {
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->whereHas('patient', function ($patientQuery) use ($search) {
                    $patientQuery->where('patient_name', 'LIKE', "%{$search}%")
                                 ->orWhere('patient_number', 'LIKE', "%{$search}%");
                })->orWhereHas('doctor', function ($doctorQuery) use ($search) {
                    $doctorQuery->where('name', 'LIKE', "%{$search}%");
                })->orWhere('queue_number', 'LIKE', "%{$search}%")
                  ->orWhere('status', 'LIKE', "%{$search}%");
            });
        }
    }
}
