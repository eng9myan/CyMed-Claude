<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // System health snapshots for monitoring
        Schema::create('system_health_checks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('service_name', 100); // database, redis, queue, storage, api
            $table->string('status', 20); // healthy, degraded, unhealthy
            $table->integer('response_time_ms')->nullable();
            $table->text('details')->nullable();
            $table->timestamp('checked_at');
            $table->timestamps();

            $table->index(['service_name', 'checked_at']);
        });

        // Deployment notes for release tracking
        Schema::create('deployment_notes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('version', 30);
            $table->string('environment', 20)->default('production'); // production, staging, development
            $table->text('release_notes')->nullable();
            $table->jsonb('migrations_run')->default('[]');
            $table->jsonb('features_deployed')->default('[]');
            $table->foreignUuid('deployed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('deployed_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deployment_notes');
        Schema::dropIfExists('system_health_checks');
    }
};
