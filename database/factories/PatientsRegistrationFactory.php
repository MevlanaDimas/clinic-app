<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Patient;
use App\Models\PatientHealthData;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class PatientsRegistrationFactoriesFactory extends Factory
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
            'doctor' => function () {
                return User::find('doctor');
            },
            'patient_health_data_id' => function () {
                return PatientHealthData::inRandomOrder()->first()?->id ?? PatientHealthData::factory()->create()->id;
            },
        ];
    }
}
