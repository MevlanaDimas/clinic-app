<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class Diagnose extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'doctor_id' => ['required', 'integer', 'exists:users,id'],
            'diagnosis' => ['required', 'string'],
            'treatment' => ['required', 'string'],
            'notes' => ['nullable', 'string'],
            'prescriptions' => ['required', 'array', 'min:1'],
            'prescriptions.*.medicines_id' => ['required', 'integer', 'exists:medicines,id'],
            'prescriptions.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'prescriptions.*.medicine_id.required' => 'The medicine field is required.',
            'prescriptions.*.medicines_id.exists' => 'The selected medicine is invalid.',
            'prescriptions.*.quantity.required' => 'The quantity field is required.',
            'prescriptions.*.quantity.min' => 'The quantity must be at least 1.',
        ];
    }
}
