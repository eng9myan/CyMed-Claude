<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vital_signs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('recorded_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('recorded_at');

            // Temperature
            $table->decimal('temperature', 5, 2)->nullable();
            $table->string('temperature_unit', 1)->default('C');
            $table->string('temperature_route', 20)->nullable(); // oral/axillary/rectal/tympanic/forehead

            // Cardiovascular
            $table->integer('heart_rate')->nullable();
            $table->integer('blood_pressure_systolic')->nullable();
            $table->integer('blood_pressure_diastolic')->nullable();
            $table->string('bp_position', 20)->nullable(); // sitting/standing/supine
            $table->string('bp_arm', 10)->nullable(); // left/right
            $table->integer('mean_arterial_pressure')->nullable();

            // Respiratory
            $table->integer('respiratory_rate')->nullable();
            $table->decimal('oxygen_saturation', 5, 2)->nullable();
            $table->boolean('on_oxygen')->default(false);
            $table->decimal('oxygen_flow_rate', 5, 2)->nullable(); // L/min
            $table->string('oxygen_delivery_device')->nullable();

            // Neurological
            $table->integer('gcs_total')->nullable(); // 3-15
            $table->integer('gcs_eye')->nullable(); // 1-4
            $table->integer('gcs_verbal')->nullable(); // 1-5
            $table->integer('gcs_motor')->nullable(); // 1-6
            $table->string('pupil_right', 20)->nullable();
            $table->string('pupil_left', 20)->nullable();

            // Metabolic
            $table->decimal('blood_glucose', 6, 2)->nullable();
            $table->string('glucose_timing', 20)->nullable(); // fasting/random/post_meal
            $table->decimal('weight_kg', 6, 2)->nullable();
            $table->decimal('height_cm', 5, 1)->nullable();
            $table->decimal('bmi', 5, 2)->nullable();
            $table->decimal('head_circumference_cm', 5, 1)->nullable(); // pediatrics/neonatal
            $table->decimal('waist_cm', 5, 1)->nullable();

            // Pain
            $table->integer('pain_score')->nullable(); // 0-10
            $table->string('pain_scale', 20)->nullable(); // NRS/VAS/FLACC/FACES
            $table->string('pain_location')->nullable();

            // Other
            $table->decimal('urine_output_ml', 8, 2)->nullable();
            $table->integer('capillary_refill_seconds')->nullable();
            $table->string('skin_condition')->nullable();

            $table->string('device_id')->nullable(); // if auto-captured
            $table->text('notes')->nullable();
            $table->jsonb('fhir_observations')->nullable();

            $table->index(['patient_id', 'recorded_at']);
            $table->index(['encounter_id', 'recorded_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vital_signs');
    }
};
