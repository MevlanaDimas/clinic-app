<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientDiagnoseBills extends Model
{
    protected $fillable = [
        'total_patient_bill_id',
        'item_name',
        'diagnose_id',
        'amount'
    ];

    public function totalPatientBill(): BelongsTo
    {
        return $this->belongsTo(TotalPatientBills::class, 'total_patient_bill_id');
    }

    public function diagnose(): BelongsTo
    {
        return $this->belongsTo(Diagnose::class, 'diagnose_id');
    }
}
