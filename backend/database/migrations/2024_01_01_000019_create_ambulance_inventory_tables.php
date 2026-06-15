<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ambulances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained()->cascadeOnDelete();
            $table->string('vehicle_number', 20)->unique();
            $table->string('vehicle_type', 20)->default('BLS'); // BLS/ALS/ICU/neonatal
            $table->string('status', 20)->default('available'); // available/dispatched/maintenance/out_of_service
            $table->jsonb('crew_ids')->default('[]'); // [{user_id, role}]
            $table->jsonb('equipment')->default('[]'); // equipment checklist
            $table->string('current_location')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('ambulance_dispatches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('ambulance_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('patient_id')->nullable()->constrained()->nullOnDelete();
            $table->string('incident_number', 30)->unique();
            $table->string('incident_type', 30); // medical/trauma/cardiac/stroke/maternity/transfer/other
            $table->integer('priority')->default(3); // 1=immediate, 2=urgent, 3=routine
            $table->string('pickup_address')->nullable();
            $table->foreignUuid('destination_facility_id')->nullable()->constrained('facilities')->nullOnDelete();
            $table->string('destination_address')->nullable();
            $table->timestamp('dispatch_at')->nullable();
            $table->timestamp('en_route_at')->nullable();
            $table->timestamp('on_scene_at')->nullable();
            $table->timestamp('departed_scene_at')->nullable();
            $table->timestamp('arrived_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->string('status', 20)->default('dispatched'); // dispatched/en_route/on_scene/transporting/completed/cancelled
            $table->text('dispatch_notes')->nullable();
            $table->string('outcome', 30)->nullable(); // transported/refused/treated_on_scene/deceased/cancelled
            $table->foreignUuid('dispatched_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->index(['ambulance_id', 'status']);
            $table->index(['dispatch_at']);
        });

        Schema::create('inventory_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained()->cascadeOnDelete();
            $table->string('item_code', 30)->unique();
            $table->string('item_name');
            $table->string('category', 30); // medication/medical_supply/equipment/consumable/lab_reagent/linen/other
            $table->string('unit', 20)->default('unit'); // unit/box/pack/bottle/vial/bag
            $table->decimal('quantity_on_hand', 10, 2)->default(0);
            $table->decimal('reorder_level', 10, 2)->default(0);
            $table->decimal('max_stock_level', 10, 2)->default(0);
            $table->decimal('unit_cost', 10, 2)->default(0);
            $table->string('location')->nullable(); // warehouse shelf/bin location
            $table->date('expiry_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['facility_id', 'category']);
        });

        Schema::create('stock_movements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('inventory_item_id')->constrained()->cascadeOnDelete();
            $table->string('movement_type', 20); // receipt/issue/transfer/adjustment/return/expired/damage
            $table->decimal('quantity', 10, 2);
            $table->decimal('before_qty', 10, 2);
            $table->decimal('after_qty', 10, 2);
            $table->decimal('unit_cost', 10, 2)->nullable();
            $table->string('reference_type', 30)->nullable(); // encounter/purchase_order/transfer/adjustment
            $table->string('reference_id')->nullable();
            $table->foreignUuid('performed_by')->constrained('users')->cascadeOnDelete();
            $table->text('notes')->nullable();
            $table->timestamp('performed_at');
            $table->timestamps();

            $table->index(['inventory_item_id', 'performed_at']);
            $table->index(['movement_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('inventory_items');
        Schema::dropIfExists('ambulance_dispatches');
        Schema::dropIfExists('ambulances');
    }
};
