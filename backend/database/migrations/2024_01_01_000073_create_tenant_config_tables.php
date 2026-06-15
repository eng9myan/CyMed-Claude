<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_configurations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->unique()->constrained('facilities')->cascadeOnDelete();
            $table->string('primary_color', 7)->default('#0066CC'); // hex color
            $table->string('secondary_color', 7)->default('#004499');
            $table->string('logo_url', 500)->nullable();
            $table->string('favicon_url', 500)->nullable();
            $table->string('app_name', 100)->default('CyMed');
            $table->string('app_name_ar', 100)->nullable();
            $table->string('support_email', 150)->nullable();
            $table->string('support_phone', 30)->nullable();
            $table->jsonb('enabled_modules')->default('[]'); // list of enabled modules
            $table->jsonb('custom_fields')->default('{}'); // extra facility-specific config
            $table->timestamps();
        });

        Schema::create('feature_flags', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('flag_name', 100)->unique();
            $table->string('description', 500)->nullable();
            $table->boolean('is_global')->default(false); // true = applies to all facilities
            $table->boolean('default_value')->default(false);
            $table->timestamps();
        });

        Schema::create('facility_feature_flags', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->foreignUuid('feature_flag_id')->constrained('feature_flags')->cascadeOnDelete();
            $table->boolean('is_enabled')->default(false);
            $table->timestamps();

            $table->unique(['facility_id', 'feature_flag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facility_feature_flags');
        Schema::dropIfExists('feature_flags');
        Schema::dropIfExists('tenant_configurations');
    }
};
