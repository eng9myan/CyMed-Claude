<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cme_activities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->string('title', 255);
            $table->string('activity_type', 30);
            $table->string('provider', 100)->nullable();
            $table->decimal('credit_hours', 5, 2);
            $table->string('accreditation_body', 100)->nullable();
            $table->date('activity_date');
            $table->date('expiry_date')->nullable();
            $table->boolean('is_mandatory')->default(false);
            $table->foreignUuid('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('cme_completions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('activity_id')->constrained('cme_activities')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('completed_at');
            $table->string('certificate_number', 50)->nullable();
            $table->decimal('credits_earned', 5, 2);
            $table->foreignUuid('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['activity_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cme_completions');
        Schema::dropIfExists('cme_activities');
    }
};
