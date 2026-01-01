<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SupplierData extends FormRequest
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
            'contact_person' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'phone_number' => 'required|string|max:14',
            'address' => 'required|string|max:255'
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
            'name.required' => 'Supplier name is required.',
            'name.string' => 'Supplier name must be a string.',
            'name.max' => 'Supplier name may not be greater than 255 characters.',
            'contact_person.required' => 'Contact person name is required.',
            'contact_person.string' => 'Contact person name must be a string.',
            'contact_person.max' => 'Contact person name may not be greater than 255 characters.',
            'email.required' => 'Supplier email is required.',
            'email.string' => 'Supplier email must be a string.',
            'email.email' => 'Supplier email must be a valid email address.',
            'email.max' => 'Supplier email may not be greater than 255 characters.',
            'phone_number.required' => 'Phone number is required.',
            'phone_number.string' => 'Phone number must be a string',
            'phone_number.max' => 'Phone number may not be greater than 14 characters.',
            'address.required' => 'Address is required.',
            'address.string' => 'Address must be a string',
            'address.max' => 'Address may not be greater than 255 characters.',
        ];
    }
}
