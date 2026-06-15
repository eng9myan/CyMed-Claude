<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('icu_flowsheets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('encounter_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('bed_id')->nullable()->constrained()->nullOnDelete();

            $table->timestamp('recorded_at');
            $table->foreignUuid('recorded_by')->constrained('users')->cascadeOnDelete();

            // Neuro
            $table->integer('gcs')->nullable();
            $table->integer('gcs_eye')->nullable();
            $table->integer('gcs_verbal')->nullable();
            $table->integer('gcs_motor')->nullable();
            $table->string('pupil_left', 10)->nullable(); // reactive/sluggish/fixed
            $table->string('pupil_right', 10)->nullable();

            // Respiratory
            $table->boolean('on_ventilator')->default(false);
            $table->string('ventilator_mode', 20)->nullable(); // CMV/SIMV/PSV/CPAP/BiPAP
            $table->decimal('peep', 4, 1)->nullable();
            $table->decimal('fio2', 4, 1)->nullable();
            $table->integer('tidal_volume')->nullable();
            $table->integer('rr_set')->nullable();
            $table->integer('rr_actual')->nullable();
            $table->decimal('spo2', 5, 2)->nullable();
            $table->integer('etco2')->nullable();

            // Cardiovascular
            $table->integer('heart_rate')->nullable();
            $table->integer('bp_systolic')->nullable();
            $table->integer('bp_diastolic')->nullable();
            $table->integer('map')->nullable();
            $table->integer('cvp')->nullable();
            $table->decimal('temperature', 5, 2)->nullable();

            // Renal / Fluids
            $table->integer('urine_output_ml')->nullable();
            $table->decimal('fluid_balance', 8, 2)->nullable();

            // Vasoactive drips
            $table->jsonb('drips')->default('[]'); // [{name, rate, units}]

            // Nursing interventions
            $table->boolean('repositioned')->default(false);
            $table->boolean('suctioned')->default(false);
            $table->boolean('oral_care_done')->default(false);
            $table->boolean('eye_care_done')->default(false);
            $table->boolean('restraints_applied')->default(false);

            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['encounter_id', 'recorded_at']);
        });

        Schema::create('ot_cases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();

            $table->string('case_number', 30)->unique();
            $table->string('procedure_name');
            $table->jsonb('procedure_codes')->default('[]'); // [{code, description}]
            $table->string('theater_room', 20)->nullable();

            $table->timestamp('scheduled_start')->nullable();
            $table->integer('scheduled_duration_minutes')->nullable();
            $table->timestamp('actual_start')->nullable();
            $table->timestamp('actual_end')->nullable();

            $table->string('anesthesia_type', 20)->default('general'); // general/regional/local/sedation
            $table->foreignUuid('surgeon_id')->constrained('users')->cascadeOnDelete();
            $table->jsonb('assistant_surgeon_ids')->default('[]');
            $table->foreignUuid('anesthesiologist_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('scrub_nurse_id')->nullable()->constrained('users')->nullOnDelete();

            $table->string('case_status', 20)->default('scheduled'); // scheduled/in_progress/completed/cancelled/postponed
            $table->boolean('pre_op_checklist_done')->default(false);
            $table->string('post_op_diagnosis')->nullable();
            $table->jsonb('implants_used')->default('[]');
            $table->jsonb('specimens_collected')->default('[]');
            $table->integer('estimated_blood_loss_ml')->nullable();
            $table->text('complications')->nullable();
            $table->text('intraop_notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['facility_id', 'scheduled_start']);
            $table->index(['surgeon_id', 'scheduled_start']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ot_cases');
        Schema::dropIfExists('icu_flowsheets');
    }
};
