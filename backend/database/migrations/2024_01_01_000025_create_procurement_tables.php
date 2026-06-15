<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('vendor_code', 20)->unique();
            $table->string('name', 200);
            $table->string('name_ar', 200)->nullable();
            $table->string('vendor_type', 20); // supplier|manufacturer|distributor|service_provider
            $table->string('contact_person', 100)->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email', 150)->nullable();
            $table->text('address')->nullable();
            $table->string('country', 2)->default('SA');
            $table->string('tax_number', 50)->nullable();
            $table->string('iban', 34)->nullable();
            $table->integer('payment_terms')->default(30);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('po_number', 30)->unique();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->foreignUuid('vendor_id')->constrained('vendors')->cascadeOnDelete();
            $table->foreignUuid('requested_by')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 20)->default('draft'); // draft|submitted|approved|partially_received|received|cancelled
            $table->date('order_date');
            $table->date('expected_delivery')->nullable();
            $table->text('notes')->nullable();
            $table->decimal('subtotal', 14, 2)->default(0);
            $table->decimal('tax_amount', 14, 2)->default(0);
            $table->decimal('total_amount', 14, 2)->default(0);
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->index(['facility_id', 'status']);
            $table->index(['vendor_id', 'status']);
        });

        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('po_id')->constrained('purchase_orders')->cascadeOnDelete();
            $table->foreignUuid('inventory_item_id')->nullable()->constrained('inventory_items')->nullOnDelete();
            $table->string('item_description', 255);
            $table->decimal('quantity_ordered', 10, 2);
            $table->decimal('quantity_received', 10, 2)->default(0);
            $table->decimal('unit_price', 12, 2);
            $table->decimal('total_price', 14, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');
        Schema::dropIfExists('vendors');
    }
};
