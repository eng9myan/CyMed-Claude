<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Core\Models\Facility;
use Modules\Patient\Models\Patient;

class PatientFactory extends Factory
{
    protected $model = Patient::class;

    public function definition(): array
    {
        return [
            'facility_id' => fn () => Facility::create([
                'code' => 'FAC-' . strtoupper(substr(uniqid(), -6)),
                'name' => $this->faker->company() . ' Hospital',
                'facility_type' => 'hospital',
            ])->id,
            'mrn' => 'CYM-' . now()->year . '-' . str_pad((string) $this->faker->unique()->numberBetween(1, 999999), 6, '0', STR_PAD_LEFT),
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'date_of_birth' => $this->faker->dateTimeBetween('-80 years', '-1 year')->format('Y-m-d'),
            'gender' => $this->faker->randomElement(['M', 'F']),
            'nationality' => 'SA',
            'is_deceased' => false,
            'is_vip' => false,
            'is_staff' => false,
            'is_newborn' => false,
        ];
    }
}
