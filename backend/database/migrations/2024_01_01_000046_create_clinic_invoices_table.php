<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clinic_invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('invoice_number', 30)->unique();
            $table->foreignUuid('clinic_id')->constrained('clinics')->cascadeOnDelete();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('cashier_id')->constrained('users')->cascadeOnDelete();
            $table->date('invoice_date');
            $table->string('visit_type', 20);
            $table->decimal('consultation_fee', 10, 2)->default(0);
            $table->decimal('procedure_fees', 10, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('vat_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->decimal('patient_share', 10, 2)->default(0);
            $table->decimal('paid_amount', 10, 2)->default(0);
            $table->string('payment_method', 20)->nullable();
            $table->string('status', 20)->default('draft');
            $table->timestamps();

            $table->index(['clinic_id', 'invoice_date']);
            $table->index('patient_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clinic_invoices');
    }
};
