<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reportable_diseases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('icd10_code', 20)->unique();
            $table->string('disease_name', 255);
            $table->integer('reporting_hours')->default(24);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('icd10_code');
        });

        Schema::create('disease_notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained()->cascadeOnDelete();
            $table->uuid('patient_id');
            $table->foreignUuid('disease_id')->constrained('reportable_diseases')->cascadeOnDelete();
            $table->date('onset_date')->nullable();
            $table->uuid('reported_by');
            $table->timestamp('reported_at')->useCurrent();
            $table->string('public_health_ref', 100)->nullable();
            $table->string('status', 20)->default('submitted'); // submitted,acknowledged,closed
            $table->timestamps();

            $table->index('facility_id');
            $table->index('patient_id');
            $table->index('status');
            $table->index('disease_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disease_notifications');
        Schema::dropIfExists('reportable_diseases');
    }
};
