<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class Prescription extends FormRequest
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
            'diagnosis_id' => 'required|exists:diagnoses,id',
            'medicines_id' => 'required|exists:medicines,id',
            'dosage' => 'required|string|max:750',
            'quantity' => 'required|integer|min:1',
            'instructions' => 'required|string|max:1000'
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
            'diagnosis_id.required' => 'Diagnosis is required.',
            'diagnosis_id.exists' => 'Diagnosis does not exist.',
            'medicines_id.required' => 'Medicine is required.',
            'medicines_id.exists' => 'Medicine does not exist.',
            'dosage.required' => 'Dosage is required.',
            'dosage.string' => 'Dosage must be a string.',
            'dosage.max' => 'Dosage must be less than 750 characters.',
            'quantity.required' => 'Quantity is required.',
            'quantity.integer' => 'Quantity must be an integer.',
            'quantity.min' => 'Quantity must be at least 1.',
            'instructions.required' => 'Instructions are required.',
            'instructions.string' => 'Instructions must be a string.',
            'instructions.max' => 'Instructions must be less than 1000 characters.'
        ];
    }
}
