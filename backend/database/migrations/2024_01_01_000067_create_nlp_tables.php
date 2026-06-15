<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('note_summaries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('patient_id');
            $table->uuid('encounter_id')->nullable();
            $table->string('source_type', 50)->default('clinical_note');
            $table->text('original_text');
            $table->text('summary_text');
            $table->jsonb('key_findings')->default('[]');
            $table->uuid('summarized_by');
            $table->string('model_used', 100)->default('gpt-4');
            $table->timestamps();

            $table->index('patient_id');
            $table->index('encounter_id');
        });

        Schema::create('coding_suggestions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('patient_id');
            $table->uuid('encounter_id')->nullable();
            $table->string('code_type', 20)->default('icd10'); // icd10,cpt,drg
            $table->string('suggested_code', 20);
            $table->string('description', 255);
            $table->decimal('confidence_score', 5, 4);
            $table->text('rationale')->nullable();
            $table->string('status', 20)->default('pending'); // pending,accepted,rejected
            $table->uuid('accepted_by')->nullable();
            $table->timestamps();

            $table->index('patient_id');
            $table->index('encounter_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coding_suggestions');
        Schema::dropIfExists('note_summaries');
    }
};
