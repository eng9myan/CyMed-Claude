<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ecg_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->nullable()->constrained('encounters')->nullOnDelete();
            $table->foreignUuid('performed_by')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('interpreted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('performed_at');
            $table->integer('heart_rate')->nullable();
            $table->string('rhythm', 50)->nullable();
            $table->integer('pr_interval_ms')->nullable();
            $table->integer('qrs_duration_ms')->nullable();
            $table->integer('qt_interval_ms')->nullable();
            $table->integer('qtc_interval_ms')->nullable();
            $table->string('axis', 20)->nullable();
            $table->boolean('st_changes')->default(false);
            $table->text('st_notes')->nullable();
            $table->text('interpretation')->nullable();
            $table->boolean('is_abnormal')->default(false);
            $table->timestamps();

            $table->index(['patient_id', 'performed_at']);
        });

        Schema::create('echo_reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->nullable()->constrained('encounters')->nullOnDelete();
            $table->foreignUuid('performed_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('performed_at');
            $table->string('echo_type', 20);
            $table->decimal('ef_percent', 5, 2)->nullable();
            $table->string('lv_function', 20)->nullable();
            $table->string('wall_motion', 20)->nullable();
            $table->text('valvular_findings')->nullable();
            $table->boolean('pericardial_effusion')->default(false);
            $table->text('impression')->nullable();
            $table->timestamps();
        });

        Schema::create('cath_lab_cases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('case_number', 30)->unique();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->nullable()->constrained('encounters')->nullOnDelete();
            $table->foreignUuid('cardiologist_id')->constrained('users')->cascadeOnDelete();
            $table->string('procedure_type', 30);
            $table->timestamp('scheduled_at');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->string('access_site', 20)->nullable();
            $table->integer('contrast_volume_ml')->nullable();
            $table->decimal('fluoroscopy_time_min', 5, 2)->nullable();
            $table->text('findings')->nullable();
            $table->text('intervention_performed')->nullable();
            $table->text('complications')->nullable();
            $table->string('status', 20)->default('scheduled');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cath_lab_cases');
        Schema::dropIfExists('echo_reports');
        Schema::dropIfExists('ecg_records');
    }
};
