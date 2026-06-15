<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('care_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('encounter_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();

            $table->string('plan_title');
            $table->string('care_type', 30)->default('general'); // general/oncology/chronic/palliative/rehabilitation/maternity
            $table->string('status', 20)->default('active'); // draft/active/on_hold/completed/revoked

            $table->jsonb('goals')->default('[]'); // [{goal, target_date, status, achieved_at}]
            $table->jsonb('interventions')->default('[]'); // [{action, frequency, responsible_role, completed}]
            $table->jsonb('barriers')->default('[]'); // [{barrier, mitigation}]

            $table->foreignUuid('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('review_date')->nullable();

            $table->text('patient_education_notes')->nullable();
            $table->text('discharge_criteria')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['patient_id', 'status']);
            $table->index(['encounter_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('care_plans');
    }
};
