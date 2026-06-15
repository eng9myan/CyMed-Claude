<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('asset_tag', 30)->unique();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->string('asset_name', 200);
            $table->string('asset_type', 30); // medical_equipment|furniture|it_equipment|vehicle|building_fixture|other
            $table->string('manufacturer', 100)->nullable();
            $table->string('model', 100)->nullable();
            $table->string('serial_number', 100)->nullable();
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_price', 12, 2)->nullable();
            $table->date('warranty_expiry')->nullable();
            $table->string('location', 200)->nullable();
            $table->foreignUuid('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 20)->default('active'); // active|under_maintenance|decommissioned|lost
            $table->timestamp('last_maintenance_at')->nullable();
            $table->date('next_maintenance_due')->nullable();
            $table->timestamps();

            $table->index(['facility_id', 'status']);
            $table->index(['asset_type', 'status']);
        });

        Schema::create('maintenance_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->foreignUuid('performed_by')->constrained('users')->cascadeOnDelete();
            $table->string('maintenance_type', 20); // preventive|corrective|calibration|inspection
            $table->text('description');
            $table->decimal('cost', 10, 2)->nullable();
            $table->timestamp('performed_at');
            $table->date('next_due_date')->nullable();
            $table->jsonb('parts_replaced')->default('[]');
            $table->timestamps();
        });

        Schema::create('cssd_cycles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('cycle_number', 30)->unique();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->foreignUuid('performed_by')->constrained('users')->cascadeOnDelete();
            $table->string('sterilization_method', 30); // autoclave|ethylene_oxide|hydrogen_peroxide|dry_heat|chemical
            $table->string('load_number', 50);
            $table->integer('items_count')->default(0);
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->string('status', 20)->default('in_progress'); // in_progress|passed|failed|quarantined
            $table->boolean('biological_indicator')->default(false);
            $table->string('bi_result', 10)->nullable(); // pass|fail
            $table->text('operator_notes')->nullable();
            $table->timestamps();

            $table->index(['facility_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cssd_cycles');
        Schema::dropIfExists('maintenance_logs');
        Schema::dropIfExists('assets');
    }
};
