<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incident_reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('patient_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('encounter_id')->nullable()->constrained()->nullOnDelete();

            $table->string('report_number', 30)->unique();
            $table->timestamp('incident_at');
            $table->string('incident_type', 30); // medication_error/fall/pressure_injury/wrong_patient/near_miss/etc
            $table->string('incident_category', 30); // patient_safety/staff_safety/visitor/environmental
            $table->string('severity', 20); // no_harm/minor/moderate/major/death/near_miss
            $table->string('location')->nullable();
            $table->text('description');
            $table->text('immediate_action');
            $table->boolean('patient_notified')->default(false);
            $table->boolean('physician_notified')->default(false);
            $table->boolean('management_notified')->default(false);
            $table->boolean('external_reporting_required')->default(false);

            $table->string('status', 20)->default('open'); // open/under_investigation/closed/rca_required
            $table->foreignUuid('reported_by')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('closed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('closed_at')->nullable();
            $table->text('root_cause')->nullable();
            $table->text('corrective_actions')->nullable();
            $table->jsonb('rca_data')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incident_reports');
    }
};
