<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class Bill extends FormRequest
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
            'status' => 'nullable|in:paid,unpaid',
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
            'status.in' => 'Status must be either paid or unpaid.',
            'notes.string' => 'Notes must be a string.',
            'notes.max' => 'Notes must be less than 1000 characters.'
        ];
    }
}
