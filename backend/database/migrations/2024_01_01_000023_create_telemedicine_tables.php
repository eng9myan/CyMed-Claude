<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teleconsult_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('session_number', 30)->unique();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('provider_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('appointment_id')->nullable()->constrained('appointments')->nullOnDelete();
            $table->foreignUuid('encounter_id')->nullable()->constrained('encounters')->nullOnDelete();
            $table->string('session_type', 20); // video|audio|chat
            $table->string('status', 20)->default('scheduled'); // scheduled|waiting|in_progress|completed|cancelled|no_show
            $table->timestamp('scheduled_at');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->string('platform_session_id', 100)->nullable();
            $table->text('chief_complaint')->nullable();
            $table->text('session_notes')->nullable();
            $table->boolean('prescription_issued')->default(false);
            $table->boolean('follow_up_required')->default(false);
            $table->text('follow_up_notes')->nullable();
            $table->text('technical_issues')->nullable();
            $table->tinyInteger('patient_rating')->nullable();
            $table->foreignUuid('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('cancellation_reason')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'status']);
            $table->index(['provider_id', 'scheduled_at']);
        });

        Schema::create('teleconsult_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('session_id')->constrained('teleconsult_sessions')->cascadeOnDelete();
            $table->foreignUuid('sender_id')->constrained('users')->cascadeOnDelete();
            $table->string('sender_type', 10); // patient|provider
            $table->string('message_type', 10); // text|file|image
            $table->text('content');
            $table->string('attachment_url', 255)->nullable();
            $table->timestamps();

            $table->index(['session_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teleconsult_messages');
        Schema::dropIfExists('teleconsult_sessions');
    }
};
