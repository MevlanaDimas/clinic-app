<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TotalStaffSalariesCostsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_payroll_id' => $this->employee_payroll_id,
            'bill_number' => $this->whenLoaded('bills', fn() => $this->bills->bill_number),
            'bill_id' => $this->whenLoaded('bills', fn() => $this->bills->id),
            'salaries' => StaffSalariesResource::collection($this->whenLoaded('staffSalaryCosts')),
            'total_amount' => $this->total_amount,
            'notes' => $this->notes,
            'created_at' => $this->created_at->format('d-m-Y H:i:s'),
            'updated_at' => $this->updated_at->format('d-m-Y H:i:s')
        ];
    }
}
