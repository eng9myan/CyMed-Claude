<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('encounter_facts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained()->cascadeOnDelete();
            $table->uuid('patient_id');
            $table->uuid('encounter_id')->nullable();
            $table->date('encounter_date');
            $table->string('encounter_type', 50);
            $table->string('primary_diagnosis_code', 20)->nullable();
            $table->integer('los_days')->nullable();
            $table->decimal('total_charges', 12, 2)->nullable();
            $table->timestamps();

            $table->index('facility_id');
            $table->index('encounter_date');
            $table->index('encounter_type');
        });

        Schema::create('lab_facts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained()->cascadeOnDelete();
            $table->uuid('patient_id');
            $table->date('order_date');
            $table->string('test_category', 100);
            $table->decimal('turnaround_hours', 6, 1)->nullable();
            $table->boolean('is_abnormal')->default(false);
            $table->timestamps();

            $table->index('facility_id');
            $table->index('order_date');
            $table->index('test_category');
        });

        Schema::create('financial_facts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained()->cascadeOnDelete();
            $table->smallInteger('period_year');
            $table->unsignedTinyInteger('period_month'); // 1-12
            $table->string('revenue_type', 50);
            $table->decimal('amount', 14, 2);
            $table->timestamps();

            $table->index(['facility_id', 'period_year', 'period_month']);
            $table->index('revenue_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_facts');
        Schema::dropIfExists('lab_facts');
        Schema::dropIfExists('encounter_facts');
    }
};
