<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Allergies
        Schema::create('patient_allergies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();
            $table->string('allergen_type', 30); // drug/food/environmental/latex/contrast/other
            $table->string('allergen_name');
            $table->string('allergen_code')->nullable(); // SNOMED CT
            $table->string('allergen_rxnorm')->nullable(); // RxNorm if drug
            $table->string('reaction_type')->nullable(); // anaphylaxis/rash/hives/angioedema/etc
            $table->string('severity', 20)->default('unknown'); // mild/moderate/severe/life_threatening/unknown
            $table->text('reaction_description')->nullable();
            $table->date('onset_date')->nullable();
            $table->string('status', 20)->default('active'); // active/inactive/resolved/entered_in_error
            $table->uuid('recorded_by')->nullable();
            $table->uuid('verified_by')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->jsonb('fhir_allergy_intolerance')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['patient_id', 'status']);
            $table->index(['allergen_rxnorm']);
        });

        // Problem List
        Schema::create('patient_problems', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->nullable(); // will be constrained after encounters table
            $table->string('icd11_code', 20)->nullable();
            $table->string('icd10_code', 20)->nullable();
            $table->string('snomed_code', 30)->nullable();
            $table->string('problem_name');
            $table->string('problem_type', 30)->default('problem'); // problem/diagnosis/finding/complaint
            $table->string('clinical_status', 20)->default('active'); // active/inactive/resolved/remission/relapse
            $table->string('verification_status', 20)->default('confirmed'); // confirmed/provisional/differential/refuted/entered_in_error
            $table->string('severity', 20)->nullable(); // mild/moderate/severe
            $table->date('onset_date')->nullable();
            $table->date('abatement_date')->nullable();
            $table->text('notes')->nullable();
            $table->uuid('recorded_by')->nullable();
            $table->jsonb('fhir_condition')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['patient_id', 'clinical_status']);
        });

        // Surgical History
        Schema::create('patient_surgical_history', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();
            $table->string('procedure_name');
            $table->string('cpt_code', 10)->nullable();
            $table->string('snomed_code', 30)->nullable();
            $table->date('procedure_date')->nullable();
            $table->string('facility_name')->nullable();
            $table->string('surgeon_name')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Family History
        Schema::create('patient_family_history', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();
            $table->string('relationship', 30); // father/mother/sibling/etc
            $table->string('condition_name');
            $table->string('icd11_code', 20)->nullable();
            $table->string('status', 20)->default('alive'); // alive/deceased/unknown
            $table->integer('age_at_onset')->nullable();
            $table->integer('age_at_death')->nullable();
            $table->string('cause_of_death')->nullable();
            $table->jsonb('fhir_family_member_history')->nullable();
            $table->timestamps();
        });

        // Social History
        Schema::create('patient_social_history', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();
            $table->string('smoking_status', 30)->nullable(); // never/former/current/unknown
            $table->integer('pack_years')->nullable();
            $table->string('alcohol_use', 30)->nullable(); // never/social/heavy/former/unknown
            $table->string('drug_use', 30)->nullable(); // never/former/current/unknown
            $table->text('drug_details')->nullable();
            $table->string('exercise_frequency')->nullable();
            $table->string('diet_type')->nullable(); // regular/vegetarian/diabetic/low_sodium/etc
            $table->string('housing_status')->nullable();
            $table->string('employment_status')->nullable();
            $table->text('notes')->nullable();
            $table->uuid('recorded_by')->nullable();
            $table->timestamps();
        });

        // Immunizations
        Schema::create('patient_immunizations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->nullable();
            $table->string('vaccine_code', 20)->nullable(); // CVX code
            $table->string('vaccine_name');
            $table->date('administered_date');
            $table->string('dose_number', 10)->nullable();
            $table->string('lot_number', 30)->nullable();
            $table->date('expiration_date')->nullable();
            $table->string('route', 20)->nullable(); // IM/SC/ID/PO
            $table->string('site', 30)->nullable(); // left_arm/right_arm/etc
            $table->string('manufacturer')->nullable();
            $table->string('status', 20)->default('completed'); // completed/not_done/entered_in_error
            $table->string('not_done_reason')->nullable();
            $table->uuid('administered_by')->nullable();
            $table->jsonb('fhir_immunization')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'vaccine_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_immunizations');
        Schema::dropIfExists('patient_social_history');
        Schema::dropIfExists('patient_family_history');
        Schema::dropIfExists('patient_surgical_history');
        Schema::dropIfExists('patient_problems');
        Schema::dropIfExists('patient_allergies');
    }
};
