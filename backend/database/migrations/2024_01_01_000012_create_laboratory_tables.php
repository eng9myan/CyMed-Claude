<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_panels', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('panel_code', 20)->unique();
            $table->string('panel_name');
            $table->string('panel_category', 30); // chemistry/hematology/microbiology/immunology/etc
            $table->string('specimen_type', 30);
            $table->integer('tat_minutes')->nullable(); // Turnaround time
            $table->decimal('price', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->jsonb('tests')->default('[]'); // [{test_code, test_name, loinc_code}]
            $table->timestamps();
        });

        Schema::create('lab_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('ordered_by')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('department_id')->nullable()->constrained()->nullOnDelete();

            $table->string('order_number', 30)->unique();
            $table->timestamp('ordered_at');
            $table->string('priority', 10)->default('routine'); // stat/urgent/asap/routine
            $table->string('specimen_type', 30)->nullable();
            $table->string('collection_method', 30)->nullable();
            $table->timestamp('collection_requested_at')->nullable();
            $table->timestamp('collected_at')->nullable();
            $table->foreignUuid('collected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('received_at_lab')->nullable();
            $table->text('clinical_history')->nullable();
            $table->string('status', 20)->default('ordered'); // ordered/collected/received/processing/resulted/verified/cancelled

            $table->timestamps();
            $table->softDeletes();

            $table->index(['patient_id', 'status']);
            $table->index(['encounter_id', 'ordered_at']);
        });

        Schema::create('lab_specimens', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('lab_order_id')->constrained()->cascadeOnDelete();
            $table->string('accession_number', 30)->unique();
            $table->string('specimen_type', 30);
            $table->string('container_type', 30)->nullable(); // EDTA/SST/Heparin/Urine_cup/etc
            $table->string('specimen_source', 30)->nullable(); // left_arm_vein/right_arm/catheter/etc
            $table->timestamp('collected_at');
            $table->string('volume_ml')->nullable();
            $table->string('status', 20)->default('collected'); // collected/in_transit/received/processing/rejected
            $table->string('rejection_reason')->nullable();
            $table->string('storage_location')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->timestamps();
        });

        Schema::create('lab_results', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('lab_order_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('specimen_id')->nullable()->constrained('lab_specimens')->nullOnDelete();

            $table->string('loinc_code', 20)->nullable();
            $table->string('test_code', 30)->nullable();
            $table->string('test_name');
            $table->string('panel_code', 20)->nullable();

            // Result
            $table->string('result_value', 100)->nullable();
            $table->string('result_unit', 30)->nullable();
            $table->string('result_type', 20)->default('numeric'); // numeric/text/coded/range
            $table->decimal('numeric_value', 12, 4)->nullable(); // for querying/trending
            $table->string('reference_range')->nullable(); // e.g. "3.5-5.0"
            $table->decimal('reference_range_low', 12, 4)->nullable();
            $table->decimal('reference_range_high', 12, 4)->nullable();
            $table->string('result_interpretation', 5)->nullable(); // N/H/L/HH/LL/A (normal/high/low/critical_high/critical_low/abnormal)

            // Status
            $table->string('result_status', 20)->default('preliminary'); // preliminary/final/corrected/amended/cancelled
            $table->boolean('is_critical')->default(false);
            $table->boolean('is_delta_check_failed')->default(false);
            $table->timestamp('resulted_at')->nullable();
            $table->foreignUuid('resulted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();

            // Critical value notification
            $table->timestamp('critical_notified_at')->nullable();
            $table->string('critical_notified_to')->nullable();
            $table->string('critical_notification_method')->nullable();
            $table->text('critical_read_back_confirmation')->nullable();

            $table->string('analyzer_id')->nullable();
            $table->string('analyzer_name')->nullable();
            $table->text('comments')->nullable();

            $table->jsonb('fhir_observation')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'loinc_code', 'resulted_at']);
            $table->index(['lab_order_id', 'result_status']);
            $table->index('is_critical');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_results');
        Schema::dropIfExists('lab_specimens');
        Schema::dropIfExists('lab_orders');
        Schema::dropIfExists('lab_panels');
    }
};
