<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('biobank_samples', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('barcode', 50)->unique();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->string('sample_type', 50); // blood, tissue, urine, csf, saliva, dna, rna, ffpe
            $table->string('collection_method', 50)->nullable();
            $table->timestamp('collected_at');
            $table->foreignUuid('collected_by')->constrained('users')->cascadeOnDelete();
            $table->decimal('volume_ml', 8, 3)->nullable();
            $table->string('storage_location', 100)->nullable(); // freezer/rack/box
            $table->decimal('storage_temperature', 5, 1)->nullable(); // -80, -20, 4, RT
            $table->string('status', 20)->default('available'); // available, in_use, depleted, disposed
            $table->date('expiry_date')->nullable();
            $table->jsonb('metadata')->default('{}');
            $table->timestamps();

            $table->index(['patient_id', 'sample_type']);
            $table->index(['facility_id', 'status']);
        });

        Schema::create('biobank_withdrawals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('biobank_sample_id')->constrained('biobank_samples')->cascadeOnDelete();
            $table->foreignUuid('clinical_trial_id')->nullable()->constrained('clinical_trials')->nullOnDelete();
            $table->foreignUuid('withdrawn_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('withdrawn_at');
            $table->decimal('volume_used_ml', 8, 3)->nullable();
            $table->string('purpose', 200);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('biobank_withdrawals');
        Schema::dropIfExists('biobank_samples');
    }
};
