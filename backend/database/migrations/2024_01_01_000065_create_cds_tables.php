<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cds_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained()->cascadeOnDelete();
            $table->string('rule_code', 50)->unique();
            $table->string('rule_name', 255);
            $table->string('category', 50);
            $table->jsonb('condition')->default('{}');
            $table->jsonb('recommendations')->default('[]');
            $table->string('severity', 20)->default('warning'); // info,warning,critical
            $table->boolean('is_active')->default(true);
            $table->uuid('created_by')->nullable();
            $table->timestamps();

            $table->index('facility_id');
            $table->index('category');
            $table->index('is_active');
        });

        Schema::create('cds_alerts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained()->cascadeOnDelete();
            $table->uuid('patient_id');
            $table->uuid('rule_id')->nullable();
            $table->uuid('encounter_id')->nullable();
            $table->text('alert_text');
            $table->boolean('acknowledged')->default(false);
            $table->uuid('acknowledged_by')->nullable();
            $table->timestamp('acknowledged_at')->nullable();
            $table->text('override_reason')->nullable();
            $table->timestamps();

            $table->index('facility_id');
            $table->index('patient_id');
            $table->index('acknowledged');
            $table->index('rule_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cds_alerts');
        Schema::dropIfExists('cds_rules');
    }
};
