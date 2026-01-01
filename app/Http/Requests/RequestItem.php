<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RequestItem extends FormRequest
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
            'item_name' => 'required|string|max:255',
            'supplier_id' => 'required|exists:suppliers,id',
            'type' => 'required|in:medicine,equipment',
            'reason' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'price_per_unit' => 'required|numeric|min:0.01'
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
            'item_name.required' => 'Item name is required.',
            'item_name.string' => 'Item name must be a string.',
            'item_name.max' => 'Item name must be less than 255 characters.',
            'supplier_id.required' => 'Supplier ID is required.',
            'supplier_id.exists' => 'Supplier does not exist.',
            'type.required' => 'Type is required.',
            'type.in' => 'Type must be one of the following: medicine or equipment.',
            'reason.required' => 'Reason is required.',
            'reason.string' => 'Reason must be a string.',
            'reason.max' => 'Reason must be less than 255 characters.',
            'quantity.required' => 'Quantity is required.',
            'quantity.integer' => 'Quantity must be an integer.',
            'quantity.min' => 'Quantity must be at least 1.',
            'price_per_unit.required' => 'Price per unit is required.',
            'price_per_unit.numeric' => 'Price per unit must be a numeric value.',
            'price_per_unit.min' => 'Price per unit must be at least 0.01.'
        ];
    }
}
