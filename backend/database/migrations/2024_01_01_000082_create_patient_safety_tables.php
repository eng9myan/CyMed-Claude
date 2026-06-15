<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('safety_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('event_number', 30)->unique(); // SF-{year}-{seq}
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->foreignUuid('patient_id')->nullable()->constrained('patients')->nullOnDelete();
            $table->foreignUuid('reported_by')->constrained('users')->cascadeOnDelete();
            $table->string('event_type', 50);
            $table->string('severity', 20)->default('low'); // low, moderate, serious, sentinel
            $table->text('description');
            $table->timestamp('event_occurred_at');
            $table->string('location', 255)->nullable();
            $table->string('status', 30)->default('open'); // open, under_review, closed
            $table->timestamps();
        });

        Schema::create('root_cause_analyses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('event_id')->constrained('safety_events')->cascadeOnDelete();
            $table->string('rca_type', 50); // fishbone, 5_why, barrier_analysis
            $table->jsonb('contributing_factors')->default('[]');
            $table->jsonb('corrective_actions')->default('[]');
            $table->foreignUuid('conducted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('completed_at')->nullable();
            $table->string('status', 30)->default('in_progress'); // in_progress, completed, approved
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('root_cause_analyses');
        Schema::dropIfExists('safety_events');
    }
};
