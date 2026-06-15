<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('drugs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('rxnorm_code', 20)->nullable()->index();
            $table->string('ndc_code', 20)->nullable()->index();
            $table->string('sfda_code', 30)->nullable(); // Saudi FDA code
            $table->string('generic_name');
            $table->string('brand_name')->nullable();
            $table->string('drug_class')->nullable(); // ATC classification
            $table->string('atc_code', 10)->nullable();
            $table->string('strength')->nullable();
            $table->string('strength_unit')->nullable();
            $table->string('dosage_form', 30); // tablet/capsule/injection/syrup/cream/patch/etc
            $table->string('route_of_administration')->nullable();
            $table->boolean('is_controlled')->default(false);
            $table->string('schedule', 10)->nullable(); // Schedule II/III/IV/V
            $table->boolean('is_high_alert')->default(false);
            $table->boolean('requires_refrigeration')->default(false);
            $table->boolean('is_formulary')->default(true);
            $table->boolean('is_active')->default(true);
            $table->jsonb('contraindications')->default('[]');
            $table->jsonb('black_box_warnings')->default('[]');
            $table->jsonb('dosing_guidelines')->default('{}');
            $table->timestamps();
        });

        Schema::create('medication_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('drug_id')->nullable()->constrained('drugs')->nullOnDelete();
            $table->foreignUuid('ordered_by')->constrained('users')->cascadeOnDelete();

            $table->string('order_number', 30)->unique();
            $table->timestamp('ordered_at');
            $table->string('priority', 10)->default('routine'); // stat/urgent/asap/routine

            // Drug details
            $table->string('drug_name'); // in case drug not in formulary
            $table->string('rxnorm_code', 20)->nullable();
            $table->string('dose');
            $table->string('dose_unit', 20)->nullable();
            $table->string('route', 30); // oral/IV/IM/SC/topical/inhaled/rectal/etc
            $table->string('frequency', 30); // QD/BID/TID/QID/q4h/q6h/q8h/PRN/etc
            $table->string('frequency_interval_hours')->nullable();
            $table->boolean('is_prn')->default(false);
            $table->string('prn_reason')->nullable();
            $table->string('prn_max_dose')->nullable();
            $table->string('prn_interval_hours')->nullable();

            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->integer('duration_days')->nullable();
            $table->integer('refills_allowed')->default(0);
            $table->decimal('quantity', 10, 2)->nullable();
            $table->string('quantity_unit')->nullable();

            $table->string('indication')->nullable();
            $table->text('sig')->nullable(); // Patient-facing instructions
            $table->text('pharmacist_notes')->nullable();
            $table->text('prescriber_notes')->nullable();

            // Clinical checks
            $table->timestamp('allergy_checked_at')->nullable();
            $table->timestamp('interaction_checked_at')->nullable();
            $table->jsonb('interaction_alerts')->default('[]');
            $table->boolean('interaction_override')->default(false);
            $table->text('interaction_override_reason')->nullable();

            // Pharmacy workflow
            $table->foreignUuid('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->foreignUuid('dispensed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('dispensed_at')->nullable();

            $table->string('status', 20)->default('ordered'); // ordered/verified/dispensed/administered/discontinued/held/completed

            $table->string('discontinued_reason')->nullable();
            $table->foreignUuid('discontinued_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('discontinued_at')->nullable();

            $table->boolean('is_discharge_prescription')->default(false);
            $table->boolean('sent_to_external_pharmacy')->default(false);

            $table->jsonb('fhir_medication_request')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['patient_id', 'status']);
            $table->index(['encounter_id', 'status']);
        });

        Schema::create('medication_administrations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('medication_order_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('administered_by')->constrained('users')->cascadeOnDelete();

            $table->timestamp('scheduled_at');
            $table->timestamp('administered_at')->nullable();
            $table->string('status', 20)->default('scheduled'); // scheduled/given/held/refused/missed/not_applicable

            // What was given
            $table->string('dose_given')->nullable();
            $table->string('dose_unit')->nullable();
            $table->string('route_given', 30)->nullable();
            $table->string('site', 30)->nullable(); // injection site

            // Dispensing
            $table->string('batch_number', 30)->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('barcode_scanned')->nullable();

            // Hold/Refuse
            $table->string('hold_reason')->nullable();
            $table->string('refuse_reason')->nullable();
            $table->text('notes')->nullable();

            // Witness (for high-alert/controlled drugs)
            $table->foreignUuid('witnessed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('witnessed_at')->nullable();

            $table->jsonb('fhir_medication_administration')->nullable();
            $table->timestamps();

            $table->index(['encounter_id', 'scheduled_at']);
            $table->index(['patient_id', 'administered_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medication_administrations');
        Schema::dropIfExists('medication_orders');
        Schema::dropIfExists('drugs');
    }
};
