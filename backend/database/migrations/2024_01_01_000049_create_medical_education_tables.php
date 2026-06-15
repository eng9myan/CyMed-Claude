<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('competency_assessments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('trainee_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('assessor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('rotation_id')->nullable()->constrained('medical_rotations')->nullOnDelete();
            $table->date('assessment_date');
            $table->string('assessment_tool', 30);
            $table->string('competency_domain', 50);
            $table->tinyInteger('performance_level');
            $table->text('feedback')->nullable();
            $table->boolean('is_shared_with_trainee')->default(true);
            $table->timestamps();

            $table->index(['trainee_id', 'assessment_date']);
        });

        Schema::create('case_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('trainee_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('supervisor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('logged_date');
            $table->string('patient_age_group', 20);
            $table->string('encounter_type', 20);
            $table->string('primary_diagnosis', 255);
            $table->jsonb('procedures_performed')->default('[]');
            $table->string('role', 20);
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            $table->index(['trainee_id', 'logged_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('case_logs');
        Schema::dropIfExists('competency_assessments');
    }
};
