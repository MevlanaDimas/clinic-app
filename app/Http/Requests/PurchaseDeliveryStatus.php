<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PurchaseDeliveryStatus extends FormRequest
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
            'status' => 'required|in:pending,on_delivery,delivered,rejected,returned',
            'delivery_service' => 'nullable|string',
            'tracking_number' => 'nullable|string',
            'estimated_delivery_time_in_days' => 'nullable|integer',
            'rejected_reason' => 'nullable|string',
            'returned_reason' => 'nullable|string'
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
                'status.required' => 'Status is required.',
                'status.in' => 'Status must be one of the following: pending, on_delivery, delivered, rejected, returned.',
                'delivery_service.string' => 'Delivery service must be a string.',
                'tracking_number.string' => 'Tracking number must be a string.',
                'estimated_delivery_time_in_days.integer' => 'Estimated delivery time in days must be an integer.',
                'rejected_reason.string' => 'Rejected reason must be a string.',
                'returned_reason.string' => 'Returned reason must be a string.'
            ];
        }
}
