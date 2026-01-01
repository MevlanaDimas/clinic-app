<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Builder;

class Prescription extends Model
{
    use HasFactory;

    protected $fillable = [
        'prescription_code',
        'medicines_id',
        'diagnosis_id',
        'dosage',
        'quantity',
        'status',
        'instructions'
    ];

    public static function generatePrescriptionNumber(int $doctorId, int $patientId, int $id): string
    {
        // Use the ID directly for the sequence to ensure uniqueness and thread safety
        $code = sprintf("P%d%d%03d", $doctorId, $patientId, $id);
        return "PR-" . $code;
    }

    protected static function booted()
    {
        static::updated(function ($prescription) {
            if ($prescription->isDirty('status') && $prescription->status === 'done') {
                if ($prescription->medicine && $prescription->medicine->inventory) {
                    $prescription->medicine->inventory->decrement('quantity', $prescription->quantity);
                }
            }
        });
    }

    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class, 'medicines_id');
    }

    public function diagnosis(): BelongsTo
    {
        return $this->belongsTo(Diagnose::class);
    }

    public function prescriptionBill(): HasOne
    {
        return $this->hasOne(PatientPrescriptionBills::class, 'prescription_id');
    }

    public function scopeFilter(Builder $query, string $search = ''): void
    {
        if ($search) {
            $query->where(function($q) use ($search){
                $q->whereHas('diagnosis', function($diagnosisQuery) use ($search) {
                    $diagnosisQuery->where('diagnosis_code', 'LIKE', "%{$search}%")
                                  ->orWhere('diagnosis', 'LIKE', "%{$search}%");
                })->orWhereHas('diagnosis.patient', function($patientQuery) use ($search) {
                    $patientQuery->where('patient_name', 'LIKE', "%{$search}%")
                                 ->orWhere('patient_number', 'LIKE', "%{$search}%");
                })->orWhereHas('diagnosis.doctor', function($doctorQuery) use ($search) {
                    $doctorQuery->where('name', 'LIKE', "%{$search}%");
                })->orWhereHas('medicine', function($medicineQuery) use ($search) {
                    $medicineQuery->where('name', 'LIKE', "%{$search}%")
                                  ->orWhere('manufacturer', 'LIKE', "%{$search}%")
                                  ->orWhere('form', 'LIKE', "%{$search}%")
                                  ->orWhere('delivery_systems', 'LIKE', "%{$search}%")
                                  ->orWhere('strength', 'LIKE', "%{$search}%")
                                  ->orWhere('strength_units', 'LIKE', "%{$search}%");
                })->orWhereHas('prescriptionBill.totalPatientBill', function ($patientBillQuery) use ($search) {
                    $patientBillQuery->where('bill_code', 'LIKE', "%{$search}%");
                })->orWhere('prescription_code', 'LIKE', "%{$search}%")
                  ->orWhere('instructions', 'LIKE', "%{$search}%");
            });
        }
    }
}
