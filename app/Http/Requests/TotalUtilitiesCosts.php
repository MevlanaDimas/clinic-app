<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TotalUtilitiesCosts extends FormRequest
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
            'request_items' => 'required|array|min:1',
            'request_items.*.name' => 'required|string|max:255',
            'request_items.*.amount' => 'required|numeric|min:0.01',
            'request_items.*.description' => 'nullable|string|max:1000',
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
            'request_items.required' => 'Request items are required.',
            'request_items.array' => 'Request items must be an array.',
            'request_items.min' => 'At least one request item is required.',
            'request_items.*.name.required' => 'Item name is required.',
            'request_items.*.name.string' => 'Item name must be a string.',
            'request_items.*.name.max' => 'Item name must be less than 255 characters.',
            'request_items.*.amount.required' => 'Item price is required.',
            'request_items.*.amount.numeric' => 'Item price must be a numeric value.',
            'request_items.*.amount.min' => 'Item price must be at least 0.01.',
            'request_items.*.description.nullable' => 'Item description is optional.',
            'request_items.*.description.string' => 'Item description must be a string.',
            'request_items.*.description.max' => 'Item description must be less than 1000 characters.',
            'notes.string' => 'Notes must be a string.',
            'notes.max' => 'Notes must be less than 1000 characters.'
        ];
    }
}
