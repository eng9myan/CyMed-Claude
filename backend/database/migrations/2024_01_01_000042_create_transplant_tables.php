<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transplant_waitlists', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->foreignUuid('registered_by')->constrained('users')->cascadeOnDelete();
            $table->string('organ_type', 30);
            $table->string('blood_group', 5);
            $table->timestamp('registered_at');
            $table->string('status', 20);
            $table->decimal('urgency_score', 6, 2)->nullable();
            $table->jsonb('hla_typing')->default('{}');
            $table->decimal('pra_percent', 5, 2)->nullable();
            $table->string('medical_urgency', 10);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['organ_type', 'status']);
            $table->index(['facility_id', 'status']);
        });

        Schema::create('transplant_cases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('case_number', 30)->unique();
            $table->foreignUuid('recipient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->foreignUuid('waitlist_id')->nullable()->constrained('transplant_waitlists')->nullOnDelete();
            $table->foreignUuid('surgeon_id')->constrained('users')->cascadeOnDelete();
            $table->string('organ_type', 30);
            $table->string('donor_type', 20);
            $table->date('transplant_date');
            $table->decimal('cold_ischemia_time_hours', 5, 2)->nullable();
            $table->integer('warm_ischemia_time_minutes')->nullable();
            $table->tinyInteger('hla_match_score')->nullable();
            $table->text('immunosuppression_protocol')->nullable();
            $table->string('outcome', 20);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('transplant_followups', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('transplant_case_id')->constrained('transplant_cases')->cascadeOnDelete();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('clinician_id')->constrained('users')->cascadeOnDelete();
            $table->date('followup_date');
            $table->integer('days_post_transplant')->nullable();
            $table->string('graft_function', 20);
            $table->boolean('rejection_episode')->default(false);
            $table->string('rejection_type', 20)->nullable();
            $table->boolean('biopsy_done')->default(false);
            $table->text('biopsy_result')->nullable();
            $table->text('immunosuppression_adjustment')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['transplant_case_id', 'followup_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transplant_followups');
        Schema::dropIfExists('transplant_cases');
        Schema::dropIfExists('transplant_waitlists');
    }
};
