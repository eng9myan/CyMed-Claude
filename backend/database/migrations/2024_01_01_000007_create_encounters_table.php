<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('encounters', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('department_id')->nullable()->constrained()->nullOnDelete();

            // Encounter Identification
            $table->string('encounter_number', 30)->unique(); // e.g. ENC-2024-000001
            $table->string('encounter_type', 30); // outpatient/inpatient/emergency/observation/day_surgery/telemedicine
            $table->string('admission_type', 30)->nullable(); // emergency/urgent/elective/newborn/trauma

            // Timestamps
            $table->timestamp('arrived_at')->nullable();
            $table->timestamp('registered_at')->nullable();
            $table->timestamp('triaged_at')->nullable();
            $table->timestamp('seen_at')->nullable(); // first physician contact
            $table->timestamp('admitted_at')->nullable();
            $table->timestamp('discharged_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            // Status
            $table->string('status', 30)->default('active'); // active/finished/cancelled/entered_in_error/on_hold
            $table->string('discharge_disposition', 30)->nullable(); // home/transfer/deceased/ama/skilled_nursing/hospice

            // Clinical
            $table->text('chief_complaint')->nullable();
            $table->string('referral_source')->nullable(); // self/gp/specialist/er/transfer/other
            $table->string('referral_from_facility')->nullable();
            $table->string('referral_physician_name')->nullable();
            $table->string('transport_mode')->nullable(); // ambulance/private/walk_in

            // Care Team
            $table->foreignUuid('attending_physician_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('admitting_physician_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('primary_nurse_id')->nullable()->constrained('users')->nullOnDelete();
            $table->jsonb('consulting_physicians')->default('[]'); // [{user_id, specialty, consult_date}]
            $table->jsonb('care_team')->default('[]');

            // Diagnosis
            $table->string('primary_diagnosis_code', 20)->nullable(); // ICD-11
            $table->string('primary_diagnosis_name')->nullable();
            $table->jsonb('secondary_diagnoses')->default('[]'); // [{code, name, type}]
            $table->string('drg_code', 10)->nullable();
            $table->decimal('drg_weight', 5, 3)->nullable();

            // Financial
            $table->foreignUuid('primary_insurance_id')->nullable()->constrained('patient_insurances')->nullOnDelete();
            $table->string('payment_method', 30)->default('insurance'); // insurance/cash/government/charity
            $table->string('pre_auth_number', 50)->nullable();
            $table->boolean('pre_auth_approved')->default(false);
            $table->decimal('estimated_cost', 12, 2)->nullable();
            $table->decimal('deposit_paid', 12, 2)->default(0);

            // Computed
            $table->integer('length_of_stay')->nullable(); // days, computed for inpatient

            // FHIR
            $table->jsonb('fhir_encounter')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['patient_id', 'status']);
            $table->index(['facility_id', 'encounter_type']);
            $table->index('admitted_at');
            $table->index('attending_physician_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('encounters');
    }
};
