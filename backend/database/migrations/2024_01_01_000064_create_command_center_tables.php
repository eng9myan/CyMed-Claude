<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('operational_alerts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained()->cascadeOnDelete();
            $table->string('alert_type', 50);
            $table->string('severity', 20)->default('warning'); // info,warning,critical
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->uuid('triggered_by')->nullable();
            $table->timestamp('triggered_at')->useCurrent();
            $table->timestamp('resolved_at')->nullable();
            $table->string('status', 20)->default('active'); // active,resolved
            $table->timestamps();

            $table->index('facility_id');
            $table->index('status');
            $table->index('severity');
        });

        Schema::create('realtime_capacity_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained()->cascadeOnDelete();
            $table->timestamp('recorded_at');
            $table->integer('total_beds');
            $table->integer('occupied_beds');
            $table->integer('icu_beds');
            $table->integer('icu_occupied');
            $table->integer('ed_boarding')->default(0);
            $table->timestamps();

            $table->index('facility_id');
            $table->index('recorded_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('realtime_capacity_logs');
        Schema::dropIfExists('operational_alerts');
    }
};
