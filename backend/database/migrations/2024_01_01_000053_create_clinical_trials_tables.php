<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clinical_trials', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('trial_number', 30)->unique(); // CT-{year}-{seq}
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->foreignUuid('irb_submission_id')->nullable()->constrained('irb_submissions')->nullOnDelete();
            $table->foreignUuid('principal_investigator_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 500);
            $table->string('phase', 10)->nullable(); // Phase 1, Phase 2, Phase 3, Phase 4
            $table->string('sponsor', 200)->nullable();
            $table->string('clinicaltrials_gov_id', 20)->nullable();
            $table->string('status', 30)->default('recruiting'); // recruiting, active, completed, suspended, withdrawn
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->integer('target_enrollment')->nullable();
            $table->string('intervention_type', 50)->nullable(); // drug, device, behavioral, procedure
            $table->text('inclusion_criteria')->nullable();
            $table->text('exclusion_criteria')->nullable();
            $table->timestamps();

            $table->index(['facility_id', 'status']);
        });

        Schema::create('trial_enrollments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('clinical_trial_id')->constrained('clinical_trials')->cascadeOnDelete();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->date('enrollment_date');
            $table->string('arm', 100)->nullable(); // treatment arm
            $table->string('status', 20)->default('active'); // active, withdrawn, completed
            $table->date('withdrawal_date')->nullable();
            $table->string('withdrawal_reason', 200)->nullable();
            $table->timestamps();

            $table->unique(['clinical_trial_id', 'patient_id']);
            $table->index('clinical_trial_id');
        });

        Schema::create('trial_adverse_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('clinical_trial_id')->constrained('clinical_trials')->cascadeOnDelete();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->date('event_date');
            $table->string('event_description', 500);
            $table->string('severity', 20); // mild, moderate, severe, life_threatening, fatal
            $table->string('relatedness', 20); // unrelated, unlikely, possible, probable, definite
            $table->boolean('is_serious')->default(false);
            $table->boolean('was_reported')->default(false);
            $table->foreignUuid('reported_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['clinical_trial_id', 'event_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trial_adverse_events');
        Schema::dropIfExists('trial_enrollments');
        Schema::dropIfExists('clinical_trials');
    }
};
