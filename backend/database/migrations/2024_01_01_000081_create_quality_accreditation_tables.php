<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Quality indicators (KPI definitions)
        Schema::create('quality_indicators', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->string('indicator_code', 30)->unique();
            $table->string('indicator_name', 255);
            $table->string('category', 50); // patient_safety, clinical_effectiveness, patient_experience, efficiency
            $table->string('measurement_type', 20)->default('rate'); // rate, ratio, count, mean
            $table->string('numerator_desc', 500)->nullable();
            $table->string('denominator_desc', 500)->nullable();
            $table->decimal('target_value', 10, 4)->nullable();
            $table->string('reporting_period', 20)->default('monthly'); // daily, weekly, monthly, quarterly
            $table->string('data_source', 100)->nullable();
            $table->boolean('is_joint_commission')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Quality indicator measurements
        Schema::create('quality_measurements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('indicator_id')->constrained('quality_indicators')->cascadeOnDelete();
            $table->string('period', 20); // e.g. "2026-Q1", "2026-06"
            $table->decimal('numerator', 10, 2)->nullable();
            $table->decimal('denominator', 10, 2)->nullable();
            $table->decimal('result_value', 10, 4);
            $table->decimal('target_value', 10, 4)->nullable();
            $table->boolean('target_met')->default(false);
            $table->text('notes')->nullable();
            $table->foreignUuid('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['indicator_id', 'period']);
        });

        // Accreditation cycles (JCIA, CBAHI, etc.)
        Schema::create('accreditation_cycles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->string('accreditation_body', 100); // JCIA, CBAHI, CCHSA, JCI
            $table->string('cycle_name', 100);
            $table->date('survey_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('status', 30)->default('in_preparation'); // in_preparation, surveyed, accredited, conditional, denied
            $table->integer('score')->nullable();
            $table->text('findings')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accreditation_cycles');
        Schema::dropIfExists('quality_measurements');
        Schema::dropIfExists('quality_indicators');
    }
};
