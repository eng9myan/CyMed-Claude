<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blood_donors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('donor_number', 30)->unique();
            $table->foreignUuid('patient_id')->nullable()->constrained('patients')->nullOnDelete();
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('blood_group', 5);
            $table->string('rh_factor', 10);
            $table->string('phone', 30)->nullable();
            $table->string('email', 150)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->timestamp('last_donation_at')->nullable();
            $table->integer('total_donations')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('blood_units', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('unit_number', 30)->unique();
            $table->foreignUuid('donor_id')->nullable()->constrained('blood_donors')->nullOnDelete();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->string('blood_group', 5);
            $table->string('rh_factor', 10);
            $table->string('component_type', 20);
            $table->integer('volume_ml');
            $table->timestamp('collected_at');
            $table->timestamp('expiry_at');
            $table->string('status', 20)->default('available');
            $table->string('storage_location', 100)->nullable();
            $table->timestamps();

            $table->index(['blood_group', 'rh_factor', 'status']);
            $table->index(['facility_id', 'status']);
        });

        Schema::create('blood_crossmatches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('blood_unit_id')->constrained('blood_units')->cascadeOnDelete();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->nullable()->constrained('encounters')->nullOnDelete();
            $table->foreignUuid('requested_by')->constrained('users')->cascadeOnDelete();
            $table->string('crossmatch_result', 20)->default('pending');
            $table->timestamp('crossmatched_at')->nullable();
            $table->foreignUuid('crossmatched_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reserved_until')->nullable();
            $table->timestamps();
        });

        Schema::create('blood_transfusions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('blood_unit_id')->constrained('blood_units')->cascadeOnDelete();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->nullable()->constrained('encounters')->nullOnDelete();
            $table->foreignUuid('administered_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('started_at');
            $table->timestamp('ended_at')->nullable();
            $table->integer('volume_transfused_ml')->nullable();
            $table->boolean('reaction_observed')->default(false);
            $table->text('reaction_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blood_transfusions');
        Schema::dropIfExists('blood_crossmatches');
        Schema::dropIfExists('blood_units');
        Schema::dropIfExists('blood_donors');
    }
};
