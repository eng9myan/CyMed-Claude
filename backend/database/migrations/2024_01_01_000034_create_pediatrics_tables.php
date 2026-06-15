<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('growth_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('recorded_by')->constrained('users')->cascadeOnDelete();
            $table->date('recorded_at');
            $table->integer('age_months')->nullable();
            $table->decimal('weight_kg', 5, 3)->nullable();
            $table->decimal('height_cm', 5, 1)->nullable();
            $table->decimal('head_circumference_cm', 5, 1)->nullable();
            $table->decimal('bmi', 5, 2)->nullable();
            $table->decimal('weight_percentile', 5, 2)->nullable();
            $table->decimal('height_percentile', 5, 2)->nullable();
            $table->decimal('hc_percentile', 5, 2)->nullable();
            $table->string('nutritional_status', 20)->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'recorded_at']);
        });

        Schema::create('immunization_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->foreignUuid('administered_by')->constrained('users')->cascadeOnDelete();
            $table->string('vaccine_name', 100);
            $table->string('vaccine_code', 20)->nullable();
            $table->tinyInteger('dose_number');
            $table->string('lot_number', 50)->nullable();
            $table->string('manufacturer', 100)->nullable();
            $table->date('administered_at');
            $table->string('site', 20)->nullable();
            $table->string('route', 20)->nullable();
            $table->date('next_due_date')->nullable();
            $table->text('adverse_reaction')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'vaccine_name']);
        });

        Schema::create('developmental_assessments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('assessed_by')->constrained('users')->cascadeOnDelete();
            $table->date('assessment_date');
            $table->integer('age_months')->nullable();
            $table->string('gross_motor', 20)->default('not_assessed');
            $table->string('fine_motor', 20)->default('not_assessed');
            $table->string('language', 20)->default('not_assessed');
            $table->string('social_emotional', 20)->default('not_assessed');
            $table->string('cognitive', 20)->default('not_assessed');
            $table->text('concerns')->nullable();
            $table->boolean('referral_needed')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('developmental_assessments');
        Schema::dropIfExists('immunization_records');
        Schema::dropIfExists('growth_records');
    }
};
