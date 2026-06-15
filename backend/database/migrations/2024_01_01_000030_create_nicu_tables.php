<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nicu_admissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('admission_number', 30)->unique();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('mother_patient_id')->nullable()->constrained('patients')->nullOnDelete();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->foreignUuid('admitted_by')->constrained('users')->cascadeOnDelete();
            $table->integer('birth_weight_grams')->nullable();
            $table->integer('gestational_age_weeks')->nullable();
            $table->tinyInteger('apgar_1min')->nullable();
            $table->tinyInteger('apgar_5min')->nullable();
            $table->string('admission_reason', 255);
            $table->string('incubator_number', 20)->nullable();
            $table->string('status', 20)->default('active');
            $table->timestamp('admitted_at');
            $table->timestamp('discharged_at')->nullable();
            $table->timestamps();

            $table->index(['facility_id', 'status']);
        });

        Schema::create('nicu_flowsheets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('admission_id')->constrained('nicu_admissions')->cascadeOnDelete();
            $table->foreignUuid('recorded_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('recorded_at');
            $table->integer('weight_grams')->nullable();
            $table->decimal('temperature_celsius', 4, 1)->nullable();
            $table->integer('heart_rate')->nullable();
            $table->integer('respiratory_rate')->nullable();
            $table->decimal('spo2_percent', 5, 2)->nullable();
            $table->decimal('blood_glucose', 6, 2)->nullable();
            $table->string('feeding_type', 20)->nullable();
            $table->decimal('feeding_volume_ml', 6, 1)->nullable();
            $table->decimal('urine_output_ml', 6, 1)->nullable();
            $table->boolean('on_ventilator')->default(false);
            $table->boolean('on_phototherapy')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nicu_flowsheets');
        Schema::dropIfExists('nicu_admissions');
    }
};
