<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dental_charts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('created_by')->constrained('users')->cascadeOnDelete();
            $table->jsonb('teeth_status')->default('{}');
            $table->timestamps();

            $table->unique(['patient_id']);
        });

        Schema::create('dental_treatments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->nullable()->constrained('encounters')->nullOnDelete();
            $table->foreignUuid('dentist_id')->constrained('users')->cascadeOnDelete();
            $table->jsonb('tooth_numbers')->default('[]');
            $table->string('treatment_type', 50);
            $table->string('procedure_code', 20)->nullable();
            $table->text('diagnosis')->nullable();
            $table->text('treatment_notes')->nullable();
            $table->text('materials_used')->nullable();
            $table->date('treatment_date');
            $table->date('next_appointment_date')->nullable();
            $table->string('status', 20)->default('planned');
            $table->timestamps();

            $table->index(['patient_id', 'treatment_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dental_treatments');
        Schema::dropIfExists('dental_charts');
    }
};
