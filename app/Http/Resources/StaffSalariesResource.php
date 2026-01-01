<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\StaffSalaryCosts;
use App\Http\Resources\UserResource;

class StaffSalariesResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $isCost = $this->resource instanceof StaffSalaryCosts;

        return [
            'id' => $this->id,
            'name' => $isCost ? $this->whenLoaded('staffSalary', fn() => $this->staffSalary->name) : $this->name,
            'position' => $isCost ? $this->whenLoaded('staffSalary', fn() => $this->staffSalary->position) : $this->position,
            'staff_monthly_salary' => $isCost ? $this->whenLoaded('staffSalary', fn() => $this->staffSalary->monthly_salary) : $this->monthly_salary,
            'staff_salary_id' => $this->whenLoaded('staffSalary', fn() => $this->staffSalary->id),
            'staff_name' => $this->whenLoaded('staffSalary', fn() => $this->staffSalary->name),
            'staff_position' => $this->whenLoaded('staffSalary', fn() => $this->staffSalary->position),
            'staff_in_user' => new UserResource(
                $isCost 
                    ? $this->whenLoaded('staffSalary', fn() => $this->staffSalary->staff) 
                    : $this->whenLoaded('staff')
            ),
            'monthly_salary' => $this->whenLoaded('staffSalary', fn() => $this->staffSalary->monthly_salary),
            'updated_at' => $this->updated_at->format('d-m-Y H:i:s'),
        ];
    }
}
