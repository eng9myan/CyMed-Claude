<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ortho_assessments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->nullable()->constrained('encounters')->nullOnDelete();
            $table->foreignUuid('surgeon_id')->constrained('users')->cascadeOnDelete();
            $table->date('assessment_date');
            $table->text('presenting_complaint')->nullable();
            $table->string('fracture_classification', 100)->nullable();
            $table->string('affected_region', 50);
            $table->string('laterality', 10)->nullable();
            $table->text('imaging_findings')->nullable();
            $table->string('neurovascular_status', 20)->nullable();
            $table->jsonb('range_of_motion')->default('{}');
            $table->string('management_plan', 20);
            $table->boolean('surgery_required')->default(false);
            $table->timestamps();

            $table->index(['patient_id', 'assessment_date']);
        });

        Schema::create('ortho_implants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->nullable()->constrained('encounters')->nullOnDelete();
            $table->foreignUuid('surgeon_id')->constrained('users')->cascadeOnDelete();
            $table->date('implant_date');
            $table->string('implant_type', 50);
            $table->string('manufacturer', 100)->nullable();
            $table->string('product_name', 100)->nullable();
            $table->string('lot_number', 50)->nullable();
            $table->string('serial_number', 50)->nullable();
            $table->string('implant_site', 100)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['patient_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ortho_implants');
        Schema::dropIfExists('ortho_assessments');
    }
};
