<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class Medicine extends FormRequest
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
            'inventory_id' => 'required|exists:inventories,id',
            'form' => 'required|in:Tablets,Capsules,Powders and Granules,Lozenges,Suppositories,Solutions,Elixirs,Suspensions,Drops,Ointments,Creams,Gels,Pastes,Inhalers,Aerosols,Nebulizers,Implants,Transdemal Patches,Oral Films,Other',
            'delivery_system' => 'required|in:Oral,Parenteral,Topical,Inhalation,Transdermal',
            'strength' => 'required|integer',
            'strength_unit' => 'required|in:mg,ml,µg,g',
            'batch_number' => 'required|string',
            'quantity_in_stock' => 'nullable|integer|min:1',
            'expiry_date' => 'required|date|after:today',
            'sell_price_per_unit' => 'required|numeric|min:0.01'
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
            'inventory_id.required' => 'Item from inventory is required.',
            'inventory_id.exists' => 'Item does not exist in inventory.',
            'form.required' => 'Form is required.',
            'form.in' => 'Form must be one of the following: Tablets, Capsules, Powders and Granules, Lozenges, Suppositories, Solutions, Elixirs, Suspensions, Drops, Ointments, Creams, Gels, Pastes, Inhalers, Aerosols, Nebulizers, Implants, Transdemal Patches, Oral Films, Other.',
            'delivery_system.required' => 'Delivery system is required.',
            'delivery_system.in' => 'Delivery system must be one of the following: Oral, Parenteral, Topical,Inhalation, Transdermal.',
            'strength.required' => 'Strength is required.',
            'strength.integer' => 'Strength must be an integer.',
            'strength_unit.required' => 'Strength unit is required.',
            'strength_unit.in' => 'Strength unit must be one of the following: mg, ml, µg, g.',
            'batch_number.required' => 'Batch number is required.',
            'batch_number.string' => 'Batch number must be a string.',
            'quantity_in_stock.integer' => 'Quantity in stock must be an integer.',
            'quantity_in_stock.min' => 'Quantity in stock must be at least 1.',
            'expiry_date.required' => 'Expiry date is required.',
            'expiry_date.date' => 'Expiry date must be a date.',
            'expiry_date.after' => 'Expiry date must be a future date.',
            'sell_price_per_unit.required' => 'Sell price per unit is required.',
            'sell_price_per_unit.numeric' => 'Sell price per unit must be a numeric value.',
            'sell_price_per_unit.min' => 'Sell price per unit must be at least 0.01.'
        ];
    }
}
