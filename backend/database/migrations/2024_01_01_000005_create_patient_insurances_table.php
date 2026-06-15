<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('insurers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code', 20)->unique();
            $table->string('name');
            $table->string('name_ar')->nullable();
            $table->string('insurer_type'); // government/private/tpa/self_pay
            $table->string('nphies_payer_id')->nullable(); // Saudi NPHIES payer ID
            $table->string('tax_number')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('portal_url')->nullable();
            $table->string('claims_email')->nullable();
            $table->jsonb('contact_info')->default('{}');
            $table->jsonb('submission_config')->default('{}'); // EDI/API config
            $table->jsonb('coverage_config')->default('{}'); // copay/deductible rules
            $table->boolean('requires_prior_auth')->default(true);
            $table->boolean('supports_realtime_eligibility')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('patient_insurances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('insurer_id')->constrained()->cascadeOnDelete();
            $table->string('coverage_type', 20)->default('primary'); // primary/secondary/tertiary
            $table->string('policy_number', 50);
            $table->string('member_id', 50);
            $table->string('group_number', 50)->nullable();
            $table->string('network_name')->nullable();
            $table->string('plan_name')->nullable();
            $table->date('valid_from');
            $table->date('valid_to')->nullable();
            $table->string('eligibility_status', 20)->default('unknown'); // active/inactive/unknown
            $table->timestamp('last_verified_at')->nullable();
            $table->jsonb('eligibility_response')->nullable(); // raw eligibility response
            $table->jsonb('coverage_details')->default('{}'); // deductible, copay, max_out_of_pocket
            $table->decimal('annual_deductible', 10, 2)->nullable();
            $table->decimal('deductible_met', 10, 2)->nullable();
            $table->decimal('out_of_pocket_max', 10, 2)->nullable();
            $table->decimal('out_of_pocket_met', 10, 2)->nullable();
            $table->decimal('copay_percentage', 5, 2)->nullable();
            $table->string('card_scan_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['patient_id', 'coverage_type']);
            $table->index(['policy_number', 'insurer_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_insurances');
        Schema::dropIfExists('insurers');
    }
};
