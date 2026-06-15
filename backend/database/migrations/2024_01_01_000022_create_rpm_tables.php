<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rpm_devices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('enrolled_by')->constrained('users')->cascadeOnDelete();
            $table->string('device_type', 30); // pulse_oximeter/bp_monitor/glucometer/ecg/weight_scale/thermometer
            $table->string('device_id', 50)->unique(); // serial number / MAC
            $table->string('manufacturer')->nullable();
            $table->string('model')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('enrolled_at');
            $table->timestamp('last_reading_at')->nullable();
            $table->jsonb('alert_thresholds')->default('{}'); // {metric: {min, max}}
            $table->timestamps();

            $table->index(['patient_id', 'is_active']);
        });

        Schema::create('rpm_readings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('device_id')->constrained('rpm_devices')->cascadeOnDelete();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();
            $table->timestamp('reading_at');
            $table->string('metric', 30); // spo2/heart_rate/bp_systolic/bp_diastolic/blood_glucose/weight/temperature/ecg_hr
            $table->decimal('value', 10, 2);
            $table->string('unit', 10);
            $table->boolean('is_alert', false)->default(false);
            $table->string('alert_severity', 10)->nullable(); // low/medium/high/critical
            $table->timestamps();

            $table->index(['patient_id', 'reading_at']);
            $table->index(['device_id', 'reading_at']);
            $table->index(['is_alert', 'reading_at']);
        });

        Schema::create('rpm_alerts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('reading_id')->constrained('rpm_readings')->cascadeOnDelete();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('device_id')->constrained('rpm_devices')->cascadeOnDelete();
            $table->string('metric', 30);
            $table->decimal('value', 10, 2);
            $table->string('severity', 10); // low/medium/high/critical
            $table->string('message', 255);
            $table->boolean('acknowledged')->default(false);
            $table->foreignUuid('acknowledged_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('acknowledged_at')->nullable();
            $table->string('action_taken')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'acknowledged']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rpm_alerts');
        Schema::dropIfExists('rpm_readings');
        Schema::dropIfExists('rpm_devices');
    }
};
