<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Entity-level audit trail (before/after snapshots)
        Schema::create('entity_audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('entity_type', 100); // model class name or table
            $table->uuid('entity_id');
            $table->string('action', 20); // created, updated, deleted, restored
            $table->jsonb('old_values')->default('{}');
            $table->jsonb('new_values')->default('{}');
            $table->jsonb('changed_fields')->default('[]'); // list of field names that changed
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->string('request_id', 50)->nullable();
            $table->timestamp('audited_at');
            $table->timestamps();

            $table->index(['entity_type', 'entity_id', 'audited_at']);
            $table->index(['user_id', 'audited_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entity_audit_logs');
    }
};
