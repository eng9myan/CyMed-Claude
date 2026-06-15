<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clinical_documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('document_number', 30)->unique();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->foreignUuid('patient_id')->nullable()->constrained('patients')->nullOnDelete();
            $table->foreignUuid('encounter_id')->nullable()->constrained('encounters')->nullOnDelete();
            $table->foreignUuid('uploaded_by')->constrained('users')->cascadeOnDelete();
            $table->string('document_type', 30); // consent_form|discharge_summary|referral_letter|lab_report|imaging_report|prescription|operative_note|advance_directive|insurance_auth|other
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->string('file_path', 500);
            $table->string('file_name', 255);
            $table->integer('file_size')->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->boolean('is_signed')->default(false);
            $table->foreignUuid('signed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('signed_at')->nullable();
            $table->boolean('is_confidential')->default(false);
            $table->jsonb('tags')->default('[]');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['patient_id', 'document_type']);
            $table->index(['encounter_id', 'document_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clinical_documents');
    }
};
