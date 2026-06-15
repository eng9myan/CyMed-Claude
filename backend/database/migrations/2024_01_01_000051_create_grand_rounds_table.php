<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grand_rounds', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->string('title', 255);
            $table->foreignUuid('presenter_id')->constrained('users')->cascadeOnDelete();
            $table->string('department', 100)->nullable();
            $table->timestamp('scheduled_at');
            $table->integer('duration_minutes')->default(60);
            $table->string('location', 100)->nullable();
            $table->string('topic_category', 30);
            $table->text('case_summary')->nullable();
            $table->jsonb('learning_objectives')->default('[]');
            $table->decimal('cme_credit_hours', 4, 2)->default(0);
            $table->string('status', 20)->default('scheduled');
            $table->timestamps();

            $table->index(['facility_id', 'scheduled_at']);
        });

        Schema::create('grand_rounds_attendance', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('grand_rounds_id')->constrained('grand_rounds')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('attended_at');
            $table->foreignUuid('cme_completion_id')->nullable()->constrained('cme_completions')->nullOnDelete();
            $table->timestamps();

            $table->unique(['grand_rounds_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grand_rounds_attendance');
        Schema::dropIfExists('grand_rounds');
    }
};
