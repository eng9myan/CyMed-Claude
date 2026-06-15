<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wards', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('department_id')->constrained()->cascadeOnDelete();
            $table->string('ward_code', 20)->unique();
            $table->string('ward_name');
            $table->string('ward_type', 30); // general/icu/nicu/maternity/pediatrics/surgery/isolation/er
            $table->integer('total_beds')->default(0);
            $table->string('floor')->nullable();
            $table->string('wing')->nullable();
            $table->string('phone_extension')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('beds', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('ward_id')->constrained()->cascadeOnDelete();
            $table->string('bed_number', 20);
            $table->string('room_number', 20)->nullable();
            $table->string('bed_type', 30)->default('standard'); // standard/icu/isolation/bariatric/pediatric/neonatal
            $table->string('status', 20)->default('available'); // available/occupied/cleaning/maintenance/reserved/blocked
            $table->boolean('is_isolation_capable')->default(false);
            $table->boolean('is_monitoring_capable')->default(false);
            $table->boolean('has_ventilator_outlet')->default(false);
            $table->string('current_patient_id')->nullable(); // quick reference
            $table->timestamp('occupied_since')->nullable();
            $table->timestamp('expected_discharge')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['ward_id', 'bed_number']);
        });

        Schema::create('bed_assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('bed_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->constrained()->cascadeOnDelete();
            $table->timestamp('assigned_at');
            $table->timestamp('vacated_at')->nullable();
            $table->string('assignment_reason', 30)->default('admission'); // admission/transfer/upgrade/downgrade
            $table->foreignUuid('assigned_by')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('vacated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('vacate_reason', 30)->nullable(); // discharge/transfer/deceased/ama
            $table->boolean('is_current')->default(true);
            $table->timestamps();

            $table->index(['bed_id', 'is_current']);
            $table->index(['encounter_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bed_assignments');
        Schema::dropIfExists('beds');
        Schema::dropIfExists('wards');
    }
};
