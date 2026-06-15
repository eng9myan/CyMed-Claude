<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('triage_assessments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('encounter_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('triaged_by')->constrained('users')->cascadeOnDelete();

            $table->timestamp('triaged_at');
            $table->string('triage_system', 10)->default('MTS'); // MTS/ESI/CTAS
            $table->integer('triage_level'); // 1-5
            $table->string('triage_category', 30); // immediate/very_urgent/urgent/standard/non_urgent
            $table->string('chief_complaint');
            $table->string('arrival_mode', 20); // ambulance/walk_in/wheelchair/stretcher/police
            $table->string('referred_from')->nullable();

            // Vital Signs at Triage
            $table->decimal('temperature', 5, 2)->nullable();
            $table->integer('heart_rate')->nullable();
            $table->integer('respiratory_rate')->nullable();
            $table->integer('bp_systolic')->nullable();
            $table->integer('bp_diastolic')->nullable();
            $table->decimal('oxygen_saturation', 5, 2)->nullable();
            $table->integer('gcs')->nullable();
            $table->integer('pain_score')->nullable();
            $table->decimal('weight_kg', 6, 2)->nullable();

            // Screening
            $table->boolean('trauma_mechanism')->default(false);
            $table->string('trauma_type')->nullable();
            $table->boolean('sepsis_suspected')->default(false);
            $table->boolean('stroke_suspected')->default(false);
            $table->boolean('stemi_suspected')->default(false);
            $table->boolean('pregnancy_status')->nullable();
            $table->boolean('allergies_reviewed')->default(false);
            $table->boolean('medications_reviewed')->default(false);

            // NEWS2 Score
            $table->integer('news2_score')->nullable();
            $table->string('news2_risk', 10)->nullable(); // low/medium/high

            $table->text('assessment_notes')->nullable();
            $table->string('immediate_action_taken')->nullable();
            $table->string('disposition', 30)->nullable(); // treatment_room/waiting/resus_bay/fast_track

            $table->timestamps();

            $table->index(['encounter_id']);
            $table->index(['triaged_at', 'triage_level']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('triage_assessments');
    }
};
