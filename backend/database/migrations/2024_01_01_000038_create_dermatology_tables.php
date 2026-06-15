<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('skin_lesions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->nullable()->constrained('encounters')->nullOnDelete();
            $table->foreignUuid('documented_by')->constrained('users')->cascadeOnDelete();
            $table->date('documented_at');
            $table->tinyInteger('lesion_number')->default(1);
            $table->string('body_location', 100);
            $table->string('lesion_type', 50);
            $table->decimal('size_mm', 6, 1)->nullable();
            $table->string('color', 50)->nullable();
            $table->string('border', 30)->nullable();
            $table->string('surface', 30)->nullable();
            $table->string('distribution', 30)->nullable();
            $table->text('associated_symptoms')->nullable();
            $table->string('clinical_diagnosis', 255)->nullable();
            $table->boolean('biopsy_taken')->default(false);
            $table->text('biopsy_result')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'documented_at']);
        });

        Schema::create('phototherapy_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->foreignUuid('administered_by')->constrained('users')->cascadeOnDelete();
            $table->date('session_date');
            $table->integer('session_number');
            $table->string('therapy_type', 20);
            $table->decimal('dose_mj_cm2', 8, 2)->nullable();
            $table->integer('exposure_seconds')->nullable();
            $table->string('affected_area', 50)->nullable();
            $table->string('response', 20)->nullable();
            $table->text('side_effects')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'session_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phototherapy_sessions');
        Schema::dropIfExists('skin_lesions');
    }
};
