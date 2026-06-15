<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_feedback', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->string('feedback_type', 20);
            $table->tinyInteger('rating');
            $table->text('comments')->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->string('status', 20)->default('pending');
            $table->timestamps();
        });

        Schema::create('health_education_content', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title', 255);
            $table->string('title_ar', 255)->nullable();
            $table->string('content_type', 20);
            $table->string('category', 50);
            $table->text('content')->nullable();
            $table->string('language', 5)->default('en');
            $table->boolean('is_published')->default(true);
            $table->foreignUuid('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('patient_notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->string('notification_type', 30);
            $table->string('title', 255);
            $table->text('message');
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'is_read']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_notifications');
        Schema::dropIfExists('health_education_content');
        Schema::dropIfExists('patient_feedback');
    }
};
