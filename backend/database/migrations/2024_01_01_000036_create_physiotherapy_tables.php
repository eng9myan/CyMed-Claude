<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('physio_assessments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->nullable()->constrained('encounters')->nullOnDelete();
            $table->foreignUuid('therapist_id')->constrained('users')->cascadeOnDelete();
            $table->date('assessment_date');
            $table->string('referral_diagnosis')->nullable();
            $table->text('chief_complaint')->nullable();
            $table->tinyInteger('pain_score')->nullable();
            $table->jsonb('range_of_motion')->default('{}');
            $table->jsonb('muscle_strength')->default('{}');
            $table->text('functional_limitations')->nullable();
            $table->text('treatment_goals')->nullable();
            $table->text('discharge_criteria')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'assessment_date']);
        });

        Schema::create('physio_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('assessment_id')->nullable()->constrained('physio_assessments')->nullOnDelete();
            $table->foreignUuid('therapist_id')->constrained('users')->cascadeOnDelete();
            $table->date('session_date');
            $table->integer('session_number');
            $table->integer('duration_minutes')->nullable();
            $table->jsonb('interventions')->default('[]');
            $table->tinyInteger('pain_score_pre')->nullable();
            $table->tinyInteger('pain_score_post')->nullable();
            $table->string('patient_response', 20)->nullable();
            $table->boolean('home_exercise_given')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'session_date']);
        });

        Schema::create('physio_outcome_scores', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('assessment_id')->nullable()->constrained('physio_assessments')->nullOnDelete();
            $table->foreignUuid('scored_by')->constrained('users')->cascadeOnDelete();
            $table->date('scoring_date');
            $table->string('tool', 30);
            $table->decimal('total_score', 6, 2);
            $table->decimal('max_score', 6, 2)->nullable();
            $table->jsonb('subscores')->default('{}');
            $table->string('interpretation', 100)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('physio_outcome_scores');
        Schema::dropIfExists('physio_sessions');
        Schema::dropIfExists('physio_assessments');
    }
};
