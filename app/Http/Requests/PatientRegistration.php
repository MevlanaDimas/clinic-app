<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PatientRegistration extends FormRequest
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
    public function rules(): array
    {
        return [
            'patient_id' => ['required', 'exists:patients,id'],
            'doctor_id' => ['required', 'exists:users,id'],
            'systolic_bp' => ['required', 'integer'],
            'diastolic_bp' => ['required', 'integer'],
            'heart_rate' => ['required', 'integer'],
            'oxygen_saturation' => ['required', 'integer'],
            'temperature' => ['required', 'integer'],
            'height' => ['required', 'integer'],
            'weight' => ['required', 'integer'],
            'complaints' => ['nullable', 'string']
        ];
    }

    /**
     * Get the validation messages that apply to the request.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'patient_id.required' => 'The patient ID field is required.',
            'patient_id.exists' => 'The selected patient does not exist.',
            'doctor_id.required' => 'The doctor ID field is required.',
            'doctor_id.exists' => 'The selected doctor does not exist.',
            'systolic_bp.required' => 'The systolic blood pressure field is required.',
            'systolic_bp.integer' => 'The systolic blood pressure must be an integer.',
            'diastolic_bp.required' => 'The diastolic blood pressure field is required.',
            'diastolic_bp.integer' => 'The diastolic blood pressure must be an integer.',
            'heart_rate.required' => 'The heart rate field is required.',
            'heart_rate.integer' => 'The heart rate must be an integer.',
            'oxygen_saturation.required' => 'The oxygen saturation field is required.',
            'oxygen_saturation.integer' => 'The oxygen saturation must be an integer.',
            'temperature.required' => 'The temperature field is required.',
            'temperature.integer' => 'The temperature must be an integer.',
            'height.required' => 'The height field is required.',
            'height.integer' => 'The height must be an integer.',
            'weight.required' => 'The weight field is required.',
            'weight.integer' => 'The weight must be an integer.',
            'complaints.nullable' => 'The complaints field is optional.'
        ];
    }
}
