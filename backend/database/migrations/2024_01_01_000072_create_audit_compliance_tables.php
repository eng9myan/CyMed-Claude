<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hipaa_access_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->uuid('patient_id')->nullable();
            $table->foreignUuid('facility_id')->nullable()->constrained('facilities')->nullOnDelete();
            $table->string('resource_type', 50); // patient, clinical_note, lab_result, radiology, prescription
            $table->uuid('resource_id')->nullable();
            $table->string('action', 30); // view, create, update, delete, export, print
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->boolean('is_authorized')->default(true);
            $table->boolean('is_break_glass')->default(false);
            $table->text('break_glass_reason')->nullable();
            $table->timestamp('accessed_at');
            $table->timestamps();

            $table->index(['user_id', 'accessed_at']);
            $table->index(['patient_id', 'accessed_at']);
            $table->index(['facility_id', 'resource_type', 'accessed_at']);
        });

        Schema::create('api_keys', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->string('key_name', 100);
            $table->string('key_hash', 100)->unique(); // bcrypt hash of the actual key
            $table->string('key_prefix', 10); // first 8 chars for identification
            $table->string('system_type', 50)->nullable(); // lis, pms, partner_app, etc
            $table->jsonb('permissions')->default('[]'); // allowed scopes
            $table->string('status', 20)->default('active'); // active, revoked, expired
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['facility_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('api_keys');
        Schema::dropIfExists('hipaa_access_logs');
    }
};
