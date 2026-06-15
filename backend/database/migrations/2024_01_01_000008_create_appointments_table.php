<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointment_schedules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('department_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('physician_id')->constrained('users')->cascadeOnDelete();
            $table->string('schedule_name');
            $table->string('schedule_type', 30)->default('clinic'); // clinic/procedure/surgery
            $table->string('slot_duration_minutes', 5)->default('15');
            $table->jsonb('working_days')->default('[1,2,3,4,0]'); // 0=Sun ... 6=Sat
            $table->time('start_time')->default('08:00');
            $table->time('end_time')->default('17:00');
            $table->integer('max_daily_patients')->default(20);
            $table->boolean('allow_overbooking')->default(false);
            $table->integer('overbooking_limit')->default(0);
            $table->boolean('is_active')->default(true);
            $table->jsonb('exceptions')->default('[]'); // [{date, is_off, start_time, end_time}]
            $table->timestamps();
        });

        Schema::create('appointments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('department_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('physician_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('schedule_id')->nullable()->constrained('appointment_schedules')->nullOnDelete();
            $table->foreignUuid('encounter_id')->nullable()->constrained()->nullOnDelete();

            $table->string('appointment_number', 30)->unique();
            $table->string('appointment_type', 30)->default('new_visit'); // new_visit/follow_up/procedure/emergency/telemedicine
            $table->string('visit_reason')->nullable();
            $table->string('icd_reason_code', 20)->nullable();

            $table->date('appointment_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('duration_minutes')->default(15);

            $table->string('status', 30)->default('scheduled'); // scheduled/confirmed/arrived/in_progress/completed/cancelled/no_show/rescheduled

            $table->string('booking_source', 30)->default('staff'); // patient_portal/mobile_app/call_center/walk_in/staff
            $table->string('booked_by_type', 20)->nullable(); // user/patient
            $table->uuid('booked_by_id')->nullable();

            $table->boolean('is_new_patient')->default(false);
            $table->boolean('reminder_sent_24h')->default(false);
            $table->boolean('reminder_sent_2h')->default(false);
            $table->timestamp('arrived_at')->nullable();
            $table->timestamp('seen_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancellation_reason')->nullable();
            $table->string('cancellation_by', 20)->nullable(); // patient/staff/physician

            $table->text('notes')->nullable();
            $table->jsonb('pre_visit_questionnaire')->nullable();
            $table->jsonb('fhir_appointment')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['physician_id', 'appointment_date', 'status']);
            $table->index(['patient_id', 'status']);
            $table->index('appointment_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
        Schema::dropIfExists('appointment_schedules');
    }
};
