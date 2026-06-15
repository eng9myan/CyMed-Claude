<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_queues', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('token_number', 20);
            $table->foreignUuid('clinic_id')->constrained('clinics')->cascadeOnDelete();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('registered_by')->constrained('users')->cascadeOnDelete();
            $table->date('queue_date');
            $table->integer('queue_position');
            $table->string('status', 20)->default('waiting');
            $table->string('priority', 10)->default('normal');
            $table->timestamp('registered_at');
            $table->timestamp('called_at')->nullable();
            $table->timestamp('consultation_started_at')->nullable();
            $table->timestamp('consultation_ended_at')->nullable();
            $table->integer('wait_time_minutes')->nullable();
            $table->integer('consultation_time_minutes')->nullable();
            $table->timestamps();

            $table->index(['clinic_id', 'queue_date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_queues');
    }
};
