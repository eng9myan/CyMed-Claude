<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Schedule templates for recurring availability patterns
        Schema::create('schedule_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->foreignUuid('provider_id')->constrained('users')->cascadeOnDelete();
            $table->string('template_name', 100);
            $table->string('specialty', 50)->nullable();
            $table->integer('slot_duration_minutes')->default(15);
            $table->jsonb('weekly_pattern')->default('{}'); // {mon: [{start:'08:00', end:'12:00'}], ...}
            $table->integer('max_patients_per_slot')->default(1);
            $table->boolean('allow_double_booking')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Appointment waitlist
        Schema::create('appointment_waitlists', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('provider_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('specialty', 50)->nullable();
            $table->string('appointment_type', 30)->default('outpatient');
            $table->date('earliest_date')->nullable();
            $table->date('latest_date')->nullable();
            $table->string('priority', 20)->default('routine'); // urgent, soon, routine
            $table->string('status', 20)->default('waiting'); // waiting, scheduled, expired, cancelled
            $table->foreignUuid('booked_appointment_id')->nullable()->constrained('appointments')->nullOnDelete();
            $table->timestamp('notified_at')->nullable();
            $table->timestamps();

            $table->index(['facility_id', 'status', 'priority']);
        });

        // Appointment reminders
        Schema::create('appointment_reminders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('appointment_id')->constrained('appointments')->cascadeOnDelete();
            $table->string('channel', 20); // sms, email, push
            $table->integer('hours_before')->default(24);
            $table->string('status', 20)->default('pending'); // pending, sent, failed
            $table->timestamp('scheduled_at');
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointment_reminders');
        Schema::dropIfExists('appointment_waitlists');
        Schema::dropIfExists('schedule_templates');
    }
};
