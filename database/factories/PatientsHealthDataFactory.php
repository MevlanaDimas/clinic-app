<?php

namespace Database\Factories;

use App\Models\Patient;
use App\Models\PatientHealthData;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PatientHealthData>
 */
class PatientHealthDataFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'patient_id' => function () {
                return Patient::inRandomOrder()->first()?->id ?? Patient::factory()->create()->id;
            },
            'systolic_bp' => $this->faker->numberBetween(90, 140),
            'diastolic_bp' => $this->faker->numberBetween(60, 90),
            'heart_rate' => $this->faker->numberBetween(60, 100),
            'oxygen_saturation' => $this->faker->numberBetween(95, 100),
            'temperature' => $this->faker->numberBetween(36, 38),
            'height' => $this->faker->numberBetween(150, 190),
            'weight' => $this->faker->numberBetween(50, 100),
            'complaints' => $this->faker->sentence(),
        ];
    }
}
