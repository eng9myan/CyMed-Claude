<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ent_examinations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->nullable()->constrained('encounters')->nullOnDelete();
            $table->foreignUuid('examiner_id')->constrained('users')->cascadeOnDelete();
            $table->date('exam_date');
            $table->jsonb('ear_right')->default('{}');
            $table->jsonb('ear_left')->default('{}');
            $table->jsonb('nose')->default('{}');
            $table->jsonb('throat')->default('{}');
            $table->decimal('hearing_right_db', 5, 1)->nullable();
            $table->decimal('hearing_left_db', 5, 1)->nullable();
            $table->string('hearing_classification', 20)->nullable();
            $table->text('diagnosis')->nullable();
            $table->text('plan')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'exam_date']);
        });

        Schema::create('audiograms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('performed_by')->constrained('users')->cascadeOnDelete();
            $table->date('performed_at');
            $table->string('test_type', 20);
            $table->jsonb('right_frequencies')->default('{}');
            $table->jsonb('left_frequencies')->default('{}');
            $table->decimal('speech_reception_right', 5, 1)->nullable();
            $table->decimal('speech_reception_left', 5, 1)->nullable();
            $table->string('tympanogram_type_right', 5)->nullable();
            $table->string('tympanogram_type_left', 5)->nullable();
            $table->text('interpretation')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audiograms');
        Schema::dropIfExists('ent_examinations');
    }
};
