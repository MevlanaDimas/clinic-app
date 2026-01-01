<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PatientData extends FormRequest
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
            'patient_name' => 'required|string',
            'sex' => 'required|in:Male,Female',
            'blood_type' => 'required|in:A,B,AB,O',
            'date_of_birth' => 'required|date|before:today',
            'phone_number' => 'nullable|string',
            'address' => 'nullable|string',
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
            'patient_name.required' => 'Patient name is required.',
            'patient_name.string' => 'Patient name must be a string.',
            'sex.required' => 'Sex is required.',
            'sex.in' => 'Sex must be either Male or Female.',
            'blood_type.required' => 'Blood type is required.',
            'blood_type.in' => 'Blood type must be one of the following: A, B, AB, O.',
            'date_of_birth.required' => 'Date of birth is required.',
            'date_of_birth.date' => 'Date of birth must be a valid date.',
            'date_of_birth.before' => 'Date of birth must be a date before today.',
            'phone_number.string' => 'Phone number must be a string.',
            'address.string' => 'Address must be a string.',
        ];
    }
}
