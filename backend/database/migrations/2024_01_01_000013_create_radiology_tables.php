<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('imaging_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('ordered_by')->constrained('users')->cascadeOnDelete();

            $table->string('order_number', 30)->unique();
            $table->string('accession_number', 30)->unique()->nullable();
            $table->timestamp('ordered_at');
            $table->string('priority', 10)->default('routine');

            // Study details
            $table->string('modality', 10); // XR/CT/MRI/US/NM/PET/DEXA/Fluoro/Mammo/Angio
            $table->string('body_part', 50); // SNOMED CT preferred
            $table->string('laterality', 10)->nullable(); // left/right/bilateral/na
            $table->string('procedure_code', 20)->nullable(); // CPT
            $table->string('procedure_name');
            $table->text('clinical_indication');
            $table->boolean('contrast_required')->default(false);
            $table->string('contrast_agent')->nullable();
            $table->boolean('contrast_allergy_checked')->default(false);
            $table->string('pregnancy_status', 20)->nullable(); // unknown/not_pregnant/possibly_pregnant/pregnant
            $table->text('special_instructions')->nullable();

            // Scheduling
            $table->timestamp('scheduled_at')->nullable();
            $table->foreignUuid('modality_room_id')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->foreignUuid('performed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('radiologist_id')->nullable()->constrained('users')->nullOnDelete();

            // Status
            $table->string('worklist_status', 20)->default('scheduled'); // scheduled/arrived/in_progress/completed/reported/cancelled

            // Report
            $table->string('report_status', 20)->nullable(); // draft/preliminary/final/addendum
            $table->text('findings')->nullable();
            $table->text('impression')->nullable();
            $table->text('recommendation')->nullable();
            $table->timestamp('report_signed_at')->nullable();

            // DICOM
            $table->string('dicom_study_uid', 70)->nullable()->unique();
            $table->string('dicom_series_count')->nullable();
            $table->string('dicom_image_count')->nullable();
            $table->string('pacs_url')->nullable();

            $table->jsonb('fhir_imaging_study')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['patient_id', 'worklist_status']);
            $table->index(['encounter_id', 'modality']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('imaging_orders');
    }
};
