<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('eye_examinations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->nullable()->constrained('encounters')->nullOnDelete();
            $table->foreignUuid('examiner_id')->constrained('users')->cascadeOnDelete();
            $table->date('exam_date');
            $table->string('va_right_unaided', 10)->nullable();
            $table->string('va_left_unaided', 10)->nullable();
            $table->string('va_right_corrected', 10)->nullable();
            $table->string('va_left_corrected', 10)->nullable();
            $table->decimal('iop_right_mmhg', 5, 1)->nullable();
            $table->decimal('iop_left_mmhg', 5, 1)->nullable();
            $table->jsonb('refraction_right')->default('{}');
            $table->jsonb('refraction_left')->default('{}');
            $table->text('anterior_segment_right')->nullable();
            $table->text('anterior_segment_left')->nullable();
            $table->text('posterior_segment_right')->nullable();
            $table->text('posterior_segment_left')->nullable();
            $table->text('diagnosis')->nullable();
            $table->text('plan')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'exam_date']);
        });

        Schema::create('ophthalmic_procedures', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->nullable()->constrained('encounters')->nullOnDelete();
            $table->foreignUuid('surgeon_id')->constrained('users')->cascadeOnDelete();
            $table->date('procedure_date');
            $table->string('eye', 10);
            $table->string('procedure_type', 50);
            $table->string('lens_type', 50)->nullable();
            $table->text('complications')->nullable();
            $table->string('postop_va', 10)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ophthalmic_procedures');
        Schema::dropIfExists('eye_examinations');
    }
};
