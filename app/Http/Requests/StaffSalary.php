<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StaffSalary extends FormRequest
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
            'name' => 'required|string|max:255',
            'position' => 'required|string|in:director,manager,head of medical staff,doctor,nurse,pharmacist,medical record staff,head of administration and support staff, admin,cleaning staff,security staff',
            'user_id' => 'nullable|exists:users,id',
            'monthly_salary' => 'required|numeric|min:0.01'
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
            'name.required' => 'Name is required.',
            'name.string' => 'Name must be a string.',
            'name.max' => 'Name may not be greater than 255 characters.',
            'position.required' => 'Position is required.',
            'position.string' => 'Position must be a string.',
            'position.in' => 'Position must be one of the predefined roles.',
            'user_id.nullable' => 'User ID is optional.',
            'user_id.exists' => 'User member does not exist.',
            'monthly_salary.required' => 'Monthly salary is required.',
            'monthly_salary.numeric' => 'Monthly salary must be a number.',
            'monthly_salary.min' => 'Monthly salary must be at least 0.01.',
        ];
    }
}
