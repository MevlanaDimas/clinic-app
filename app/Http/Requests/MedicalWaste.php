<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MedicalWaste extends FormRequest
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
            'bill_id' => 'nullable|exists:bills,id',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:1000'
        ];
    }

    /**
     * Get validation messages that apply to the request.
     * 
     * @return array<string, string>
     */
    public function messages()
    {
        return [
            'name.required' => 'Name is required.',
            'name.string' => 'Name must be a string.',
            'name.max' => 'Name must be less than 255 characters.',
            'bill_id.exists' => 'Bill does not exist.',
            'amount.required' => 'Price is required.',
            'amount.numeric' => 'Price must be a numeric value.',
            'amount.min' => 'Price must be at least 0.01',
            'description.string' => 'Description must be a string.',
            'description.max' => 'Description must be less than 1000 characters.'
        ];
    }
}
