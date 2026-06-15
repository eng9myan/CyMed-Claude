<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('antenatal_visits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->nullable()->constrained('encounters')->nullOnDelete();
            $table->foreignUuid('provider_id')->constrained('users')->cascadeOnDelete();
            $table->date('visit_date');
            $table->integer('gestational_age_weeks')->nullable();
            $table->integer('gestational_age_days')->nullable();
            $table->tinyInteger('gravida')->nullable();
            $table->tinyInteger('para')->nullable();
            $table->decimal('fundal_height_cm', 5, 1)->nullable();
            $table->integer('fetal_heart_rate')->nullable();
            $table->string('fetal_presentation', 20)->nullable();
            $table->integer('blood_pressure_systolic')->nullable();
            $table->integer('blood_pressure_diastolic')->nullable();
            $table->decimal('weight_kg', 5, 2)->nullable();
            $table->string('urine_protein', 10)->nullable();
            $table->string('urine_glucose', 10)->nullable();
            $table->boolean('edema')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'visit_date']);
        });

        Schema::create('labor_deliveries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->nullable()->constrained('encounters')->nullOnDelete();
            $table->foreignUuid('provider_id')->constrained('users')->cascadeOnDelete();
            $table->date('delivery_date');
            $table->time('delivery_time')->nullable();
            $table->integer('gestational_age_weeks')->nullable();
            $table->string('delivery_mode', 20);
            $table->string('labor_onset', 20);
            $table->decimal('duration_labor_hours', 5, 2)->nullable();
            $table->integer('blood_loss_ml')->nullable();
            $table->text('complications')->nullable();
            $table->string('anesthesia_type', 20)->nullable();
            $table->tinyInteger('apgar_1min')->nullable();
            $table->tinyInteger('apgar_5min')->nullable();
            $table->integer('birth_weight_grams')->nullable();
            $table->string('baby_gender', 10)->nullable();
            $table->string('neonatal_outcome', 20);
            $table->string('mother_outcome', 20)->default('stable');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('labor_deliveries');
        Schema::dropIfExists('antenatal_visits');
    }
};
