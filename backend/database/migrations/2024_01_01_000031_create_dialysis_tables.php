<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dialysis_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('session_number', 30)->unique();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->nullable()->constrained('encounters')->nullOnDelete();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->foreignUuid('performed_by')->constrained('users')->cascadeOnDelete();
            $table->string('session_type', 10);
            $table->string('machine_id', 50)->nullable();
            $table->string('access_type', 30);
            $table->timestamp('scheduled_at');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->decimal('planned_duration_hours', 4, 2);
            $table->decimal('actual_duration_hours', 4, 2)->nullable();
            $table->decimal('pre_weight_kg', 5, 2)->nullable();
            $table->decimal('post_weight_kg', 5, 2)->nullable();
            $table->decimal('fluid_removed_liters', 5, 3)->nullable();
            $table->integer('blood_flow_rate')->nullable();
            $table->integer('dialysate_flow_rate')->nullable();
            $table->decimal('kt_v', 4, 2)->nullable();
            $table->integer('pre_bp_systolic')->nullable();
            $table->integer('pre_bp_diastolic')->nullable();
            $table->integer('post_bp_systolic')->nullable();
            $table->integer('post_bp_diastolic')->nullable();
            $table->text('complications')->nullable();
            $table->string('status', 20)->default('scheduled');
            $table->timestamps();

            $table->index(['patient_id', 'scheduled_at']);
            $table->index(['facility_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dialysis_sessions');
    }
};
