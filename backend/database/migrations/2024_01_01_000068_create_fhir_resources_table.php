<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fhir_resources', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('resource_type', 50); // Patient, Observation, DiagnosticReport, MedicationRequest, Condition, Procedure, AllergyIntolerance
            $table->string('fhir_id', 100)->unique(); // FHIR logical ID
            $table->string('fhir_version', 10)->default('R4');
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->uuid('internal_entity_id')->nullable(); // maps to local patient/encounter/etc id
            $table->string('internal_entity_type', 50)->nullable(); // 'patient', 'encounter', etc
            $table->jsonb('resource_json'); // full FHIR JSON resource
            $table->string('status', 20)->default('active');
            $table->timestamps();

            $table->index(['resource_type', 'facility_id']);
            $table->index(['internal_entity_id', 'resource_type']);
        });

        Schema::create('fhir_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('transaction_id', 100)->unique(); // correlation ID
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->string('direction', 10); // inbound, outbound
            $table->string('resource_type', 50);
            $table->string('operation', 20); // create, read, update, delete, search
            $table->integer('http_status')->nullable();
            $table->text('request_payload')->nullable();
            $table->text('response_payload')->nullable();
            $table->string('source_system', 100)->nullable();
            $table->timestamp('transacted_at');
            $table->timestamps();

            $table->index(['facility_id', 'transacted_at']);
            $table->index(['resource_type', 'direction']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fhir_transactions');
        Schema::dropIfExists('fhir_resources');
    }
};
