<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('irb_submissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('submission_number', 30)->unique(); // IRB-{year}-{seq}
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->foreignUuid('principal_investigator_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 500);
            $table->string('study_type', 30); // observational, interventional, retrospective, case_study
            $table->date('submission_date');
            $table->date('review_date')->nullable();
            $table->string('review_type', 20)->default('full'); // full, expedited, exempt
            $table->string('status', 20)->default('submitted'); // submitted, under_review, approved, rejected, suspended, withdrawn
            $table->text('summary')->nullable();
            $table->integer('expected_subjects')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->boolean('involves_minors')->default(false);
            $table->boolean('involves_vulnerable')->default(false);
            $table->text('reviewer_comments')->nullable();
            $table->foreignUuid('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['facility_id', 'status']);
            $table->index(['principal_investigator_id', 'submission_date']);
        });

        Schema::create('irb_amendments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('irb_submission_id')->constrained('irb_submissions')->cascadeOnDelete();
            $table->string('amendment_number', 20);
            $table->date('amendment_date');
            $table->text('description');
            $table->string('status', 20)->default('pending'); // pending, approved, rejected
            $table->foreignUuid('submitted_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('irb_amendments');
        Schema::dropIfExists('irb_submissions');
    }
};
