<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PatientBill extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules()
    {
        return [
            'patient_id' => 'required|exists:patients,id',
            'diagnosis.diagnose_id' => 'required|exists:diagnoses,id',
            'diagnosis.item_name' => 'required|string|max:255',
            'diagnosis.amount' => 'required|numeric|min:0.01',
            'prescriptions' => 'required|array|min:1',
            'prescriptions.*.prescription_id' => 'required|exists:prescriptions,id',
            'prescriptions.*.item_name' => 'required|string|max:255',
            'prescriptions.*.amount' => 'required|numeric|min:0.01',
            'administrative_fee' => 'required|numeric|min:0.01',
            'status' => 'required|in:paid,unpaid,cancelled'
        ];
    }

    /**
     * Get the validation messages that apply to the request.
     * 
     * @return array<string, string>
     */
    public function messages()
    {
        return [
            'patient_id.required' => 'Patient is required.',
            'patient_id.exists' => 'Patient does not exist.',
            'diagnosis.diagnose_id.required' => 'Diagnosis is required.',
            'diagnosis.diagnose_id.exists' => 'Diagnosis does not exist.',
            'diagnosis.item_name.required' => 'Item name is required.',
            'diagnosis.item_name.string' => 'Item name must be a string.',
            'diagnosis.item_name.max' => 'Item name must be less than 255 characters.',
            'diagnosis.amount.required' => 'Amount is required.',
            'diagnosis.amount.numeric' => 'Amount must be a numeric value.',
            'diagnosis.amount.min' => 'Amount must be at least 0.01.',
            'prescriptions.required' => 'Prescriptions are required.',
            'prescriptions.array' => 'Prescriptions must be an array.',
            'prescriptions.min' => 'At least one prescription is required.',
            'prescriptions.*.prescription_id.required' => 'Prescription is required.',
            'prescriptions.*.prescription_id.exists' => 'Prescription does not exist.',
            'prescriptions.*.item_name.required' => 'Item name is required.',
            'prescriptions.*.item_name.string' => 'Item name must be a string.',
            'prescriptions.*.item_name.max' => 'Item name must be less than 255 characters.',
            'prescriptions.*.amount.required' => 'Amount is required.',
            'prescriptions.*.amount.numeric' => 'Amount must be a numeric value.',
            'prescriptions.*.amount.min' => 'Amount must be at least 0.01.',
            'administrative_fee.required' => 'Administrative fee is required.',
            'administrative_fee.numeric' => 'Administrative fee must be a numeric value.',
            'administrative_fee.min' => 'Administrative fee must be at least 0.01.',
            'status.required' => 'Status is required.',
            'status.in' => 'Status must be one of the following: paid, unpaid, cancelled.'
        ];
    }
}
