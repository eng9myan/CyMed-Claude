<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dicom_studies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('study_instance_uid', 100)->unique();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->foreignUuid('ordered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('accession_number', 50)->nullable();
            $table->string('modality', 20); // CR, CT, MR, US, MG, NM, PT, XA, DX, RF
            $table->string('body_part', 100)->nullable();
            $table->timestamp('study_date');
            $table->string('description', 300)->nullable();
            $table->integer('series_count')->default(0);
            $table->integer('instance_count')->default(0);
            $table->string('status', 20)->default('received'); // received, reported, verified
            $table->string('storage_path', 500)->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'modality']);
            $table->index(['facility_id', 'study_date']);
        });

        Schema::create('dicom_series', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('dicom_study_id')->constrained('dicom_studies')->cascadeOnDelete();
            $table->string('series_instance_uid', 100)->unique();
            $table->integer('series_number')->nullable();
            $table->string('series_description', 200)->nullable();
            $table->string('modality', 20);
            $table->integer('instance_count')->default(0);
            $table->string('body_part', 100)->nullable();
            $table->timestamps();

            $table->index('dicom_study_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dicom_series');
        Schema::dropIfExists('dicom_studies');
    }
};
