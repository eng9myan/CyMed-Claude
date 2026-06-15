<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prediction_models', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('facility_id')->nullable();
            $table->string('model_code', 50)->unique();
            $table->string('model_name', 255);
            $table->string('outcome_type', 100);
            $table->jsonb('feature_list')->default('[]');
            $table->string('model_version', 20)->default('1.0');
            $table->decimal('accuracy_score', 5, 4)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('facility_id');
            $table->index('is_active');
        });

        Schema::create('patient_predictions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained()->cascadeOnDelete();
            $table->uuid('patient_id');
            $table->foreignUuid('model_id')->constrained('prediction_models')->cascadeOnDelete();
            $table->decimal('prediction_score', 5, 4);
            $table->string('risk_category', 20); // low,moderate,high,critical
            $table->jsonb('features_used')->default('{}');
            $table->timestamp('predicted_at')->useCurrent();
            $table->timestamps();

            $table->index('facility_id');
            $table->index('patient_id');
            $table->index('risk_category');
            $table->index('predicted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_predictions');
        Schema::dropIfExists('prediction_models');
    }
};
