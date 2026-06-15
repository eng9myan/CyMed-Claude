<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Security events (login anomalies, brute force, suspicious activity)
        Schema::create('security_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('event_type', 50); // login_failure, brute_force, impossible_travel, suspicious_ip, mfa_bypass_attempt
            $table->string('severity', 20)->default('medium'); // low, medium, high, critical
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->string('country_code', 5)->nullable();
            $table->jsonb('event_details')->default('{}');
            $table->boolean('is_resolved')->default(false);
            $table->foreignUuid('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->index(['user_id', 'occurred_at']);
            $table->index(['event_type', 'severity', 'occurred_at']);
        });

        // Password policy violations and password history (beyond what's in password_histories)
        Schema::create('account_lockouts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('lockout_reason', 100);
            $table->integer('failed_attempts')->default(0);
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('locked_at');
            $table->timestamp('unlocked_at')->nullable();
            $table->foreignUuid('unlocked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('auto_unlock')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'locked_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('account_lockouts');
        Schema::dropIfExists('security_events');
    }
};
