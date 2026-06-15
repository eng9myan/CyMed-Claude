<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained()->cascadeOnDelete();

            // Identifiers
            $table->string('mrn', 30)->unique(); // Master Record Number - e.g. CYM-2024-000001
            $table->string('national_id', 20)->nullable()->index();
            $table->string('iqama_number', 20)->nullable()->index();
            $table->string('passport_number', 20)->nullable()->index();
            $table->string('gcc_id', 20)->nullable()->index();
            $table->string('birth_certificate_number', 30)->nullable();

            // Demographics
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('full_name')->storedAs("first_name || ' ' || COALESCE(middle_name || ' ', '') || last_name");
            $table->string('first_name_ar')->nullable();
            $table->string('middle_name_ar')->nullable();
            $table->string('last_name_ar')->nullable();
            $table->date('date_of_birth');
            $table->string('gender', 1); // M/F/U
            $table->string('blood_group', 5)->nullable(); // A+/A-/B+/B-/AB+/AB-/O+/O-/Unknown
            $table->string('rh_factor', 3)->nullable(); // Pos/Neg/Unknown

            // Identity Details
            $table->string('nationality', 2)->default('SA');
            $table->string('country_of_birth', 2)->nullable();
            $table->string('religion')->nullable(); // Islam/Christianity/Judaism/Other/Unknown
            $table->string('marital_status', 20)->nullable(); // single/married/divorced/widowed/unknown
            $table->string('education_level')->nullable();
            $table->string('occupation')->nullable();
            $table->string('employer')->nullable();
            $table->string('primary_language', 10)->default('ar');
            $table->jsonb('spoken_languages')->default('[]');

            // Contact
            $table->string('phone_primary', 20)->nullable();
            $table->string('phone_secondary', 20)->nullable();
            $table->string('email')->nullable();
            $table->jsonb('addresses')->default('[]'); // [{type: home/work, street, city, region, postal_code, country}]

            // Emergency Contacts
            $table->jsonb('emergency_contacts')->default('[]'); // [{name, relationship, phone, phone2}]

            // Clinical Flags
            $table->boolean('is_deceased')->default(false);
            $table->timestamp('deceased_at')->nullable();
            $table->string('deceased_cause')->nullable();
            $table->string('icd_cause_of_death')->nullable();
            $table->boolean('is_vip')->default(false);
            $table->boolean('is_staff')->default(false);
            $table->boolean('is_newborn')->default(false);
            $table->string('vip_category')->nullable();
            $table->text('special_needs')->nullable();
            $table->text('interpreter_needed')->nullable();

            // Biometric / Photos
            $table->string('photo_path')->nullable();
            $table->jsonb('biometric_data')->nullable(); // encrypted

            // MPI (Master Patient Index)
            $table->uuid('merged_into')->nullable()->index();
            $table->boolean('is_merged')->default(false);
            $table->timestamp('merged_at')->nullable();

            // Audit
            $table->uuid('registered_by')->nullable();
            $table->uuid('updated_by')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['last_name', 'first_name']);
            $table->index('date_of_birth');
            $table->index(['facility_id', 'mrn']);
        });

        // Add self-referential MPI FK after table is fully created
        Schema::table('patients', function (Blueprint $table) {
            $table->foreign('merged_into')->references('id')->on('patients')->nullOnDelete();
        });

        // Trigram index for patient name search
        \Illuminate\Support\Facades\DB::statement(
            "CREATE INDEX patients_name_trigram_idx ON patients USING gin((first_name || ' ' || last_name) gin_trgm_ops)"
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
