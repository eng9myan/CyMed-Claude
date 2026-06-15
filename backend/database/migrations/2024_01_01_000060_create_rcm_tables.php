<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rcm_claims', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained()->cascadeOnDelete();
            $table->uuid('patient_id')->nullable();
            $table->uuid('encounter_id')->nullable();
            $table->string('claim_number', 50)->unique();
            $table->uuid('insurer_id');
            $table->jsonb('diagnosis_codes')->default('[]');
            $table->jsonb('procedure_codes')->default('[]');
            $table->decimal('billed_amount', 12, 2)->default(0);
            $table->decimal('allowed_amount', 12, 2)->nullable();
            $table->decimal('paid_amount', 12, 2)->nullable();
            $table->string('status', 20)->default('pending'); // pending,submitted,adjudicated,denied,appealed
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('adjudicated_at')->nullable();
            $table->timestamps();

            $table->index('facility_id');
            $table->index('patient_id');
            $table->index('status');
            $table->index('insurer_id');
        });

        Schema::create('claim_line_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('claim_id')->constrained('rcm_claims')->cascadeOnDelete();
            $table->string('cpt_code', 10);
            $table->string('description', 255)->nullable();
            $table->decimal('billed_units', 8, 2)->default(1);
            $table->decimal('billed_amount', 10, 2);
            $table->decimal('allowed_amount', 10, 2)->nullable();
            $table->string('status', 20)->default('pending'); // pending,approved,denied,adjusted
            $table->timestamps();

            $table->index('claim_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('claim_line_items');
        Schema::dropIfExists('rcm_claims');
    }
};
