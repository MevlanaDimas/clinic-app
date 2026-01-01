<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PurchaseRequest extends FormRequest
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
            'user_id' => 'required|exists:users,id',
            'bill_id' => 'nullable|exists:bills,id',
            'request_items' => 'required|array|min:1',
            'request_items.*.item_name' => 'required|string|max:255',
            'request_items.*.supplier_id' => 'required|exists:suppliers,id',
            'request_items.*.type' => 'required|in:medicine,equipment',
            'request_items.*.reason' => 'required|string|max:255',
            'request_items.*.quantity' => 'required|integer|min:1',
            'request_items.*.price_per_unit' => 'required|numeric|min:0.01',
            'required_by_date' => 'required|date|after:today',
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
            'user_id.required' => 'User ID is required.',
            'user_id.exists' => 'User does not exist.',
            'bill_id.exists' => 'Bill does not exist.',
            'request_items.required' => 'Request items are required.',
            'request_items.array' => 'Request items must be an array.',
            'request_items.min' => 'At least one request item is required.',
            'request_items.*.item_name.required' => 'Item name is required.',
            'request_items.*.item_name.string' => 'Item name must be a string.',
            'request_items.*.item_name.max' => 'Item name must be less than 255 characters.',
            'request_items.*.inventory_id.nullable' => 'Inventory ID is optional.',
            'request_items.*.inventory_id.exists' => 'Inventory does not exist.',
            'request_items.*.supplier_id.required' => 'Supplier ID is required.',
            'request_items.*.supplier_id.exists' => 'Supplier does not exist.',
            'request_items.*.type.required' => 'Type is required.',
            'request_items.*.type.in' => 'Type must be one of the following: medicine, equipment.',
            'request_items.*.reason.required' => 'Reason is required.',
            'request_items.*.reason.string' => 'Reason must be a string.',
            'request_items.*.reason.max' => 'Reason must be less than 255 characters.',
            'request_items.*.quantity.required' => 'Quantity is required.',
            'request_items.*.quantity.integer' => 'Quantity must be an integer.',
            'request_items.*.quantity.min' => 'Quantity must be at least 1.',
            'request_items.*.price_per_unit.required' => 'Price per unit is required.',
            'request_items.*.price_per_unit.numeric' => 'Price per unit must be a numeric value.',
            'request_items.*.price_per_unit.min' => 'Price per unit must be at least 0.01.',
            'required_by_date.required' => 'Required by date is required.',
            'required_by_date.date' => 'Required by date must be a date.',
            'required_by_date.after' => 'Required by date must be a future date.',
            'notes.string' => 'Notes must be a string.',
            'notes.max' => 'Notes must be less than 1000 characters.'
        ];
    }
}
