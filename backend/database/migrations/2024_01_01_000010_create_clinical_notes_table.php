<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('note_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->nullable()->constrained()->nullOnDelete();
            $table->string('template_name');
            $table->string('note_type', 30); // progress/admission/discharge/operative/consult/nursing/er/procedure
            $table->string('specialty')->nullable();
            $table->jsonb('sections')->default('[]'); // [{key, label, type, required, options}]
            $table->boolean('is_active')->default(true);
            $table->boolean('is_system')->default(false); // system template vs custom
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });

        Schema::create('clinical_notes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('template_id')->nullable()->constrained('note_templates')->nullOnDelete();

            $table->string('note_type', 30); // progress/admission/discharge/operative/consult/nursing/er/procedure
            $table->string('specialty')->nullable();
            $table->string('note_title')->nullable();

            // Content (PHI - should be encrypted at application level)
            $table->jsonb('content')->default('{}'); // structured SOAP sections
            $table->text('content_text')->nullable(); // plain text for search

            // Workflow
            $table->string('status', 20)->default('draft'); // draft/signed/amended/cosigned/addendum
            $table->boolean('is_addendum')->default(false);
            $table->uuid('addendum_to')->nullable()->index();

            // Authorship
            $table->foreignUuid('authored_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('authored_at');
            $table->foreignUuid('signed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('signed_at')->nullable();
            $table->foreignUuid('cosigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('cosigned_at')->nullable();
            $table->text('cosign_required_reason')->nullable();

            // Amendment tracking
            $table->jsonb('amendment_history')->default('[]');

            // AI
            $table->boolean('ai_assisted')->default(false);
            $table->string('ai_model_used')->nullable();

            $table->jsonb('fhir_composition')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['encounter_id', 'note_type', 'status']);
            $table->index(['authored_by', 'authored_at']);
        });

        Schema::table('clinical_notes', function (Blueprint $table) {
            $table->foreign('addendum_to')->references('id')->on('clinical_notes')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clinical_notes');
        Schema::dropIfExists('note_templates');
    }
};
