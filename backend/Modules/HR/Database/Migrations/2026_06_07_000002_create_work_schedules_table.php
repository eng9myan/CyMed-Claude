<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('work_schedules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('facility_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('department_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('schedule_type', ['regular', 'on_call', 'overtime', 'shift'])->default('regular');
            $table->smallInteger('day_of_week'); // 0=Sun … 6=Sat
            $table->time('start_time');
            $table->time('end_time');
            $table->date('effective_from');
            $table->date('effective_until')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'day_of_week']);
            $table->index('effective_from');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_schedules');
    }
};
