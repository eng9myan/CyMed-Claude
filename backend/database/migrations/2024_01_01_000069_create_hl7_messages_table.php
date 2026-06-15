<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hl7_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('message_id', 100)->unique(); // MSH-10 control ID
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->string('message_type', 20); // ADT^A01, ORM^O01, ORU^R01, etc
            $table->string('trigger_event', 10); // A01, A03, O01, R01
            $table->string('direction', 10); // inbound, outbound
            $table->string('source_system', 100)->nullable();
            $table->string('destination_system', 100)->nullable();
            $table->text('raw_message'); // full HL7 v2 message
            $table->string('processing_status', 20)->default('received'); // received, processed, acknowledged, failed, rejected
            $table->text('error_message')->nullable();
            $table->uuid('patient_id')->nullable(); // mapped patient if identified
            $table->timestamp('message_datetime');
            $table->timestamps();

            $table->index(['facility_id', 'message_type', 'direction']);
            $table->index(['processing_status', 'direction']);
        });

        Schema::create('integration_endpoints', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->string('endpoint_name', 100);
            $table->string('system_type', 30); // lis, ris, pharmacy, emr, erp, pms
            $table->string('protocol', 20); // hl7_v2, fhir_r4, rest, soap, sftp
            $table->string('host', 255)->nullable();
            $table->integer('port')->nullable();
            $table->string('path', 500)->nullable();
            $table->jsonb('auth_config')->default('{}'); // encrypted auth details
            $table->string('status', 20)->default('active'); // active, inactive, testing
            $table->timestamp('last_successful_at')->nullable();
            $table->timestamps();

            $table->index(['facility_id', 'system_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('integration_endpoints');
        Schema::dropIfExists('hl7_messages');
    }
};
