<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Video call session logs (extends existing teleconsult_sessions)
        Schema::create('video_call_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('session_id')->constrained('teleconsult_sessions')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('event_type', 30); // joined, left, muted, unmuted, screen_share_start, screen_share_stop
            $table->string('platform', 20)->nullable(); // web, ios, android
            $table->string('connection_quality', 20)->nullable(); // good, fair, poor
            $table->integer('duration_seconds')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->index(['session_id', 'occurred_at']);
        });

        // Virtual waiting room
        Schema::create('virtual_waiting_room', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('session_id')->constrained('teleconsult_sessions')->cascadeOnDelete();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->timestamp('joined_waiting_at');
            $table->timestamp('admitted_at')->nullable();
            $table->integer('wait_time_seconds')->nullable();
            $table->string('status', 20)->default('waiting'); // waiting, admitted, cancelled
            $table->timestamps();
        });

        // Telemedicine prescriptions
        Schema::create('telemedicine_prescriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('session_id')->constrained('teleconsult_sessions')->cascadeOnDelete();
            $table->foreignUuid('prescriber_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->string('drug_name', 255);
            $table->string('dosage', 100);
            $table->string('frequency', 50);
            $table->integer('duration_days');
            $table->text('instructions')->nullable();
            $table->boolean('is_controlled')->default(false);
            $table->string('status', 20)->default('issued'); // issued, filled, cancelled
            $table->timestamp('issued_at');
            $table->timestamps();

            $table->index(['patient_id', 'issued_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('telemedicine_prescriptions');
        Schema::dropIfExists('virtual_waiting_room');
        Schema::dropIfExists('video_call_logs');
    }
};
