<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_analyzers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('device_id', 50)->unique();
            $table->string('device_name', 200);
            $table->string('manufacturer', 150)->nullable();
            $table->string('model', 100)->nullable();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->string('department', 100)->nullable();
            $table->string('analyzer_type', 50); // hematology, chemistry, immunoassay, coagulation, urinalysis, microbiology, poct
            $table->string('connection_type', 20)->default('hl7'); // hl7, astm, serial, tcp_ip
            $table->string('ip_address', 45)->nullable();
            $table->integer('port')->nullable();
            $table->string('status', 20)->default('active'); // active, maintenance, offline
            $table->timestamp('last_calibration_at')->nullable();
            $table->timestamp('last_qc_at')->nullable();
            $table->timestamps();

            $table->index(['facility_id', 'analyzer_type']);
        });

        Schema::create('poct_results', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('lab_analyzer_id')->constrained('lab_analyzers')->cascadeOnDelete();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('ordered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('test_name', 100);
            $table->string('test_code', 30)->nullable();
            $table->string('result_value', 100);
            $table->string('unit', 30)->nullable();
            $table->string('reference_range', 100)->nullable();
            $table->string('interpretation', 20)->nullable(); // normal, low, high, critical_low, critical_high
            $table->boolean('is_critical')->default(false);
            $table->boolean('critical_acknowledged')->default(false);
            $table->foreignUuid('acknowledged_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('result_at');
            $table->timestamps();

            $table->index(['patient_id', 'test_code', 'result_at']);
            $table->index(['lab_analyzer_id', 'result_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('poct_results');
        Schema::dropIfExists('lab_analyzers');
    }
};
