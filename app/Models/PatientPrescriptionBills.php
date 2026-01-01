<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientPrescriptionBills extends Model
{
    protected $fillable = [
        'total_patient_bill_id',
        'item_name',
        'prescription_id',
        'amount'
    ];

    public function totalPatientBill(): BelongsTo
    {
        return $this->belongsTo(TotalPatientBills::class, 'total_patient_bill_id');
    }

    public function prescription(): BelongsTo
    {
        return $this->belongsTo(Prescription::class, 'prescription_id');
    }
}
