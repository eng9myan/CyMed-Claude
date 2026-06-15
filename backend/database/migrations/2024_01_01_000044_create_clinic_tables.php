<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clinics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('clinic_code', 20)->unique();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->string('name', 200);
            $table->string('name_ar', 200)->nullable();
            $table->string('clinic_type', 30);
            $table->decimal('consultation_fee', 10, 2)->default(0);
            $table->decimal('follow_up_fee', 10, 2)->default(0);
            $table->jsonb('operating_hours')->default('{}');
            $table->boolean('is_active')->default(true);
            $table->integer('max_daily_patients')->nullable();
            $table->timestamps();

            $table->index(['facility_id', 'clinic_type']);
        });

        Schema::create('clinic_providers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('clinic_id')->constrained('clinics')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->boolean('is_primary')->default(false);
            $table->timestamps();

            $table->unique(['clinic_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clinic_providers');
        Schema::dropIfExists('clinics');
    }
};
