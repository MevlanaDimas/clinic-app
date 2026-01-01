<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInventoryRequest extends FormRequest
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
            'supplier_id' => 'required|exists:suppliers,id',
            'type' => 'required|in:medicine,equipment',
            'quantity' => 'required|integer|min:1'
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
            'name.required' => 'Item name is required.',
            'name.string' => 'Item name must be a sting.',
            'name.max' => 'Item name must be less than 255 characters.',
            'supplier_id.required' => 'Supplier is required.',
            'supplier_id.exists' => 'Supplier does not exist.',
            'type.required' => 'Item type is required.',
            'type.in' => 'Item type must be one of the following: medicine or equipment.',
            'quantity.required' => 'Item quantity is required.',
            'quantity.integer' => 'Item quantity must be an integer.',
            'quantity.min' => 'Item quantity must be at least 1.'
        ];
    }
}
