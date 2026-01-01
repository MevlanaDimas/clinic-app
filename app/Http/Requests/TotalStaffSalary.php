<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TotalStaffSalary extends FormRequest
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
            'bill_id' => 'nullable|exists:bills,id',
            'salaries' => 'required|array|min:1',
            'salaries.*.staff_id' => 'required|exists:staff_salaries,id',
            'notes' => 'nullable|string|max:1000'
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
            'bill_id.exists' => 'Bill does not exist.',
            'salaries.required' => 'Staff salaries are required.',
            'salaries.array' => 'Staff salaries must be an array.',
            'salaries.min' => 'At least one staff salary is required.',
            'salaries.*.staff_id.required' => 'Staff salary is required',
            'salaries.*.staff_id.exists' => 'Staff salary does not exist.',
            'notes.string' => 'Notes must be a string',
            'notes.max' => 'Notes must be less than 1000 characters.'
        ];
    }
}
