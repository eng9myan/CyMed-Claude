<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_catalog', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('service_code', 30)->unique();
            $table->string('cpt_code', 10)->nullable();
            $table->string('drg_code', 10)->nullable();
            $table->string('service_name');
            $table->string('service_name_ar')->nullable();
            $table->string('service_category', 30); // consultation/procedure/lab/radiology/pharmacy/room/supply
            $table->foreignUuid('department_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('standard_price', 12, 2)->default(0);
            $table->decimal('cost', 12, 2)->default(0);
            $table->string('unit_of_measure', 20)->default('each');
            $table->boolean('is_active')->default(true);
            $table->boolean('requires_pre_auth')->default(false);
            $table->jsonb('payer_prices')->default('{}'); // {insurer_id: price}
            $table->timestamps();
        });

        Schema::create('service_charges', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('encounter_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('service_id')->constrained('service_catalog')->cascadeOnDelete();

            $table->date('service_date');
            $table->timestamp('charged_at');
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 12, 2);
            $table->decimal('gross_amount', 12, 2);
            $table->decimal('discount_percent', 5, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('tax_percent', 5, 2)->default(15); // 15% VAT in Saudi Arabia
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('net_amount', 12, 2); // after discount
            $table->decimal('total_amount', 12, 2); // after tax

            $table->string('coverage_type', 20)->default('insured'); // insured/cash/charity/government/discount
            $table->decimal('insurance_covered', 12, 2)->default(0);
            $table->decimal('patient_responsibility', 12, 2)->default(0);

            $table->foreignUuid('insurance_id')->nullable()->constrained('patient_insurances')->nullOnDelete();
            $table->string('pre_auth_number', 50)->nullable();
            $table->string('revenue_code', 10)->nullable();

            $table->foreignUuid('posted_by')->constrained('users')->cascadeOnDelete();
            $table->string('status', 20)->default('pending'); // pending/approved/billed/paid/adjusted/voided/on_hold
            $table->text('void_reason')->nullable();
            $table->foreignUuid('voided_by')->nullable()->constrained('users')->nullOnDelete();

            $table->jsonb('icd_diagnoses')->default('[]');
            $table->jsonb('modifiers')->default('[]');

            $table->timestamps();
            $table->softDeletes();

            $table->index(['encounter_id', 'status']);
            $table->index(['patient_id', 'service_date']);
        });

        Schema::create('invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('encounter_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();

            $table->string('invoice_number', 30)->unique();
            $table->date('invoice_date');
            $table->date('due_date')->nullable();
            $table->string('invoice_type', 20)->default('standard'); // standard/insurance/final/interim/credit
            $table->string('status', 20)->default('draft'); // draft/issued/partially_paid/paid/cancelled/written_off

            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->decimal('insurance_amount', 12, 2)->default(0);
            $table->decimal('patient_amount', 12, 2)->default(0);
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->decimal('balance', 12, 2)->default(0);

            $table->string('currency', 3)->default('SAR');
            $table->foreignUuid('created_by')->constrained('users')->cascadeOnDelete();

            // ZATCA e-invoicing (Saudi Arabia)
            $table->string('zatca_uuid')->nullable();
            $table->string('zatca_hash')->nullable();
            $table->string('zatca_qr_code')->nullable();
            $table->boolean('zatca_submitted')->default(false);
            $table->timestamp('zatca_submitted_at')->nullable();

            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('invoice_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();

            $table->string('payment_number', 30)->unique();
            $table->date('payment_date');
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('SAR');
            $table->string('payment_method', 30); // cash/card/bank_transfer/insurance/charity/write_off
            $table->string('reference_number', 50)->nullable();
            $table->string('transaction_id', 100)->nullable();
            $table->string('status', 20)->default('completed'); // pending/completed/failed/refunded/voided
            $table->foreignUuid('received_by')->constrained('users')->cascadeOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('insurance_claims', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('encounter_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('insurer_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('insurance_id')->constrained('patient_insurances')->cascadeOnDelete();

            $table->string('claim_number', 30)->unique();
            $table->string('claim_type', 20); // professional/institutional/pharmacy/dental
            $table->date('claim_date');
            $table->date('service_from_date');
            $table->date('service_to_date')->nullable();

            $table->decimal('billed_amount', 12, 2)->default(0);
            $table->decimal('approved_amount', 12, 2)->default(0);
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->decimal('patient_responsibility', 12, 2)->default(0);
            $table->decimal('adjustment_amount', 12, 2)->default(0);

            $table->string('status', 30)->default('draft'); // draft/scrubbed/submitted/acknowledged/processing/partially_paid/paid/denied/appealed/closed

            $table->timestamp('submitted_at')->nullable();
            $table->string('submission_method', 20)->nullable(); // nphies/edi_837/portal/manual
            $table->string('submission_reference', 50)->nullable();

            // Response
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamp('adjudicated_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->date('payment_date')->nullable();
            $table->string('check_number', 50)->nullable();

            // Denial
            $table->text('denial_reason')->nullable();
            $table->string('denial_code', 20)->nullable();
            $table->date('appeal_deadline')->nullable();
            $table->boolean('is_appealed')->default(false);
            $table->integer('appeal_count')->default(0);

            // EDI
            $table->text('edi_837_payload')->nullable();
            $table->text('edi_835_payload')->nullable();
            $table->text('nphies_request')->nullable();
            $table->text('nphies_response')->nullable();

            $table->foreignUuid('created_by')->constrained('users')->cascadeOnDelete();
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['insurer_id', 'status']);
            $table->index(['patient_id', 'claim_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('insurance_claims');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('service_charges');
        Schema::dropIfExists('service_catalog');
    }
};
