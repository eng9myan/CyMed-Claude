<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('psychiatric_assessments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->nullable()->constrained('encounters')->nullOnDelete();
            $table->foreignUuid('clinician_id')->constrained('users')->cascadeOnDelete();
            $table->date('assessment_date');
            $table->string('assessment_type', 30);
            $table->text('chief_complaint')->nullable();
            $table->text('presenting_history')->nullable();
            $table->jsonb('mental_status')->default('{}');
            $table->jsonb('risk_assessment')->default('{}');
            $table->string('diagnosis_primary', 100)->nullable();
            $table->string('diagnosis_secondary', 255)->nullable();
            $table->text('formulation')->nullable();
            $table->text('treatment_plan')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'assessment_date']);
        });

        Schema::create('psychiatric_scale_scores', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('assessed_by')->constrained('users')->cascadeOnDelete();
            $table->date('scored_at');
            $table->string('scale', 30);
            $table->decimal('total_score', 6, 2);
            $table->string('severity', 20)->nullable();
            $table->jsonb('item_scores')->default('{}');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'scale', 'scored_at']);
        });

        Schema::create('therapy_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('therapist_id')->constrained('users')->cascadeOnDelete();
            $table->date('session_date');
            $table->string('session_type', 30);
            $table->integer('duration_minutes')->default(50);
            $table->integer('session_number')->nullable();
            $table->tinyInteger('mood_rating')->nullable();
            $table->text('progress_notes')->nullable();
            $table->text('homework_assigned')->nullable();
            $table->string('risk_update', 20)->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'session_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('therapy_sessions');
        Schema::dropIfExists('psychiatric_scale_scores');
        Schema::dropIfExists('psychiatric_assessments');
    }
};
