<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('infection_cases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('patient_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('encounter_id')->nullable()->constrained()->nullOnDelete();

            $table->string('case_reference', 30)->unique();
            $table->string('pathogen', 100)->nullable(); // organism/causative agent
            $table->string('case_type', 20)->default('hai'); // hai/community/outbreak/colonization
            $table->string('infection_site', 30); // SSI/UTI/CLABSI/VAP/CAUTI/BSI/wound/respiratory/other
            $table->string('risk_factors')->nullable();
            $table->boolean('is_multidrug_resistant')->default(false);
            $table->boolean('is_reportable')->default(false); // MOH reportable
            $table->boolean('reported_to_moh')->default(false);

            $table->string('status', 20)->default('under_investigation'); // under_investigation/confirmed/ruled_out/closed
            $table->foreignUuid('reported_by')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reported_at');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('closed_at')->nullable();

            $table->text('clinical_notes')->nullable();
            $table->jsonb('interventions_taken')->default('[]'); // [{intervention, date, performed_by}]
            $table->jsonb('lab_results')->default('[]'); // [{test, result, date}]

            $table->timestamps();

            $table->index(['facility_id', 'status']);
            $table->index(['case_type', 'infection_site']);
        });

        Schema::create('payroll_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->date('pay_period_start');
            $table->date('pay_period_end');

            $table->decimal('basic_salary', 12, 2)->default(0);
            $table->decimal('overtime_hours', 6, 2)->default(0);
            $table->decimal('overtime_pay', 12, 2)->default(0);
            $table->jsonb('allowances')->default('[]'); // [{type, amount}]
            $table->jsonb('deductions')->default('[]'); // [{type, amount, reason}]
            $table->decimal('total_allowances', 12, 2)->default(0);
            $table->decimal('total_deductions', 12, 2)->default(0);
            $table->decimal('gross_pay', 12, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('net_pay', 12, 2)->default(0);

            $table->string('status', 20)->default('draft'); // draft/approved/paid/cancelled
            $table->string('currency', 3)->default('SAR');
            $table->foreignUuid('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->string('payment_reference', 50)->nullable();

            $table->timestamps();

            $table->unique(['user_id', 'pay_period_start', 'pay_period_end']);
            $table->index(['status', 'pay_period_end']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_records');
        Schema::dropIfExists('infection_cases');
    }
};
