<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('oncology_cases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('case_number', 30)->unique();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->foreignUuid('primary_oncologist_id')->constrained('users')->cascadeOnDelete();
            $table->string('cancer_type', 100);
            $table->string('icd10_code', 10)->nullable();
            $table->string('histology', 100)->nullable();
            $table->string('stage', 20)->nullable();
            $table->string('grade', 10)->nullable();
            $table->date('diagnosis_date');
            $table->string('status', 20)->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['patient_id']);
            $table->index(['facility_id', 'status']);
        });

        Schema::create('chemotherapy_cycles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('oncology_case_id')->constrained('oncology_cases')->cascadeOnDelete();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->string('protocol_name', 100);
            $table->integer('cycle_number');
            $table->integer('total_cycles')->nullable();
            $table->date('scheduled_date');
            $table->date('administered_date')->nullable();
            $table->foreignUuid('administered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 20)->default('scheduled');
            $table->text('delay_reason')->nullable();
            $table->jsonb('pre_medications')->default('[]');
            $table->jsonb('drugs')->default('[]');
            $table->tinyInteger('toxicity_grade')->nullable();
            $table->text('toxicity_notes')->nullable();
            $table->date('next_cycle_date')->nullable();
            $table->timestamps();

            $table->index(['oncology_case_id', 'cycle_number']);
        });

        Schema::create('tumor_board_meetings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->foreignUuid('oncology_case_id')->constrained('oncology_cases')->cascadeOnDelete();
            $table->date('meeting_date');
            $table->jsonb('attendees')->default('[]');
            $table->text('recommendation')->nullable();
            $table->text('treatment_plan')->nullable();
            $table->date('follow_up_date')->nullable();
            $table->foreignUuid('recorded_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tumor_board_meetings');
        Schema::dropIfExists('chemotherapy_cycles');
        Schema::dropIfExists('oncology_cases');
    }
};
