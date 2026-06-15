<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('genomic_tests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('test_number', 30)->unique(); // GEN-{year}-{seq}
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('ordered_by')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->string('test_type', 50); // wgs, wes, panel, snp_array, cytogenetics, fish, pcr
            $table->string('panel_name', 200)->nullable();
            $table->date('ordered_date');
            $table->date('sample_collected_date')->nullable();
            $table->date('result_date')->nullable();
            $table->string('status', 20)->default('ordered'); // ordered, in_progress, resulted
            $table->string('lab_name', 200)->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'test_type']);
        });

        Schema::create('genomic_variants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('genomic_test_id')->constrained('genomic_tests')->cascadeOnDelete();
            $table->string('gene', 50);
            $table->string('variant', 200); // HGVS notation
            $table->string('transcript', 100)->nullable();
            $table->string('zygosity', 20)->nullable(); // heterozygous, homozygous, hemizygous
            $table->string('classification', 30); // pathogenic, likely_pathogenic, vus, likely_benign, benign
            $table->string('inheritance', 30)->nullable(); // AD, AR, XL, mitochondrial
            $table->text('clinical_significance')->nullable();
            $table->timestamps();

            $table->index(['genomic_test_id', 'classification']);
            $table->index('gene');
        });

        Schema::create('pharmacogenomics_reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('genomic_test_id')->nullable()->constrained('genomic_tests')->nullOnDelete();
            $table->string('gene', 50);
            $table->string('diplotype', 50)->nullable(); // e.g., *1/*3
            $table->string('phenotype', 50)->nullable(); // poor, intermediate, normal, rapid metabolizer
            $table->string('drug', 150);
            $table->string('recommendation', 50); // normal_dose, reduced_dose, increased_dose, avoid, use_alternative
            $table->text('clinical_notes')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'gene']);
            $table->index(['patient_id', 'drug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pharmacogenomics_reports');
        Schema::dropIfExists('genomic_variants');
        Schema::dropIfExists('genomic_tests');
    }
};
