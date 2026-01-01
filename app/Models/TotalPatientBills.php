<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class TotalPatientBills extends Model
{
    protected $fillable = [
        'bill_code',
        'patient_id',
        'administrative_fee',
        'total_cost',
        'status'
    ];

    public static function generateBillCode(string $patientName): string
    {
        $patientCode = !empty($patientName) ? substr($patientName, 0, 3) . strtoupper(substr($patientName, -1)) : 'UNK';
        $maxId = self::max('id');
        $code = sprintf("%07d", $maxId ? $maxId + 1 : 1);

        return "BILL-" . $patientCode . "-" . $code;
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function diagnoseBill(): HasMany
    {
        return $this->hasMany(PatientDiagnoseBills::class, 'total_patient_bill_id');
    }

    public function prescriptionBill(): HasMany
    {
        return $this->hasMany(PatientPrescriptionBills::class, 'total_patient_bill_id');
    }

    public function recalculateTotal(): void
    {
        $diagnoseAmount = $this->relationLoaded('diagnoseBill')
            ? $this->diagnoseBill->sum('amount')
            : $this->diagnoseBill()->sum('amount');

        $prescriptionAmount = $this->relationLoaded('prescriptionBill')
            ? $this->prescriptionBill->sum('amount')
            : $this->prescriptionBill()->sum('amount');

        $this->update([
            'total_cost' => $diagnoseAmount + $prescriptionAmount + $this->administrative_fee
        ]);
    }

    public function scopeFilter(Builder $query, string $search = ''): void
    {
        $query->when($search, function ($q) use ($search) {
            $q->where(function ($subQ) use ($search) {
                $subQ->whereHas('patient', function ($patientQuery) use ($search) {
                    $patientQuery->where('patient_name', 'LIKE', "%{$search}%")
                                 ->orWhere('patient_number', 'LIKE', "%{$search}%");
                })->orWhereHas('diagnoseBill', function ($diagnoseBillQuery) use ($search) {
                    $diagnoseBillQuery->where('item_name', 'LIKE', "%{$search}%")
                                      ->orWhere('amount', 'LIKE', "%{$search}%");
                })->orWhereHas('prescriptionBill', function ($prescriptionBillQuery) use ($search) {
                    $prescriptionBillQuery->where('item_name', 'LIKE', "%{$search}%")
                                          ->orWhere('amount', 'LIKE', "%{$search}%");
                })->orWhereHas('patient.diagnose', function ($diagnoseQuery) use ($search) {
                    $diagnoseQuery->where('diagnose_code', 'LIKE', "%{$search}%")
                                  ->orWhere('diagnosis', 'LIKE', "%{$search}%")
                                  ->orWhere('treatment', 'LIKE', "%{$search}%")
                                  ->orWhere('notes', 'LIKE', "%{$search}%");
                })->orWhereHas('prescriptionBill.prescription', function ($prescriptionQuery) use ($search) {
                    $prescriptionQuery->where('prescription_code', 'LIKE', "%{$search}%");
                })->orWhereHas('patient.diagnose.doctor', function ($doctorQuery) use ($search) {
                    $doctorQuery->where('name', 'LIKE', "%{$search}%");
                })->orWhere('bill_code', 'LIKE', "%{$search}%")
                  ->orWhere('status', 'LIKE', "%{$search}%");
            });
        });
    }
}
