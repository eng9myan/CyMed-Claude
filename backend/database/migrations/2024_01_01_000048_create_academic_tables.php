<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('faculty_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete()->unique();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->string('academic_rank', 30);
            $table->string('department', 100)->nullable();
            $table->string('specialty', 100)->nullable();
            $table->string('orcid_id', 20)->nullable();
            $table->jsonb('research_interests')->default('[]');
            $table->integer('publications_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('medical_rotations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('trainee_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('supervisor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->string('department', 100);
            $table->string('rotation_type', 20);
            $table->date('start_date');
            $table->date('end_date');
            $table->jsonb('competencies')->default('[]');
            $table->tinyInteger('supervisor_rating')->nullable();
            $table->text('supervisor_comments')->nullable();
            $table->string('status', 20)->default('active');
            $table->timestamps();

            $table->index(['trainee_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medical_rotations');
        Schema::dropIfExists('faculty_profiles');
    }
};
