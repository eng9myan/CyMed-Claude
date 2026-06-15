<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('population_registry', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained()->cascadeOnDelete();
            $table->uuid('patient_id');
            $table->string('condition_code', 20);
            $table->string('condition_name', 255);
            $table->timestamp('enrolled_at')->useCurrent();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['patient_id', 'condition_code']);
            $table->index('facility_id');
            $table->index('condition_code');
        });

        Schema::create('care_gaps', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained()->cascadeOnDelete();
            $table->uuid('patient_id');
            $table->string('gap_type', 100);
            $table->string('description', 500);
            $table->date('due_date')->nullable();
            $table->string('status', 20)->default('open'); // open,resolved,overdue
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index('facility_id');
            $table->index('patient_id');
            $table->index('status');
        });

        Schema::create('risk_scores', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained()->cascadeOnDelete();
            $table->uuid('patient_id');
            $table->string('risk_model', 100);
            $table->decimal('score', 5, 2);
            $table->string('risk_level', 20); // low,moderate,high,critical
            $table->timestamp('scored_at')->useCurrent();
            $table->timestamps();

            $table->index('facility_id');
            $table->index('patient_id');
            $table->index('risk_level');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('risk_scores');
        Schema::dropIfExists('care_gaps');
        Schema::dropIfExists('population_registry');
    }
};
