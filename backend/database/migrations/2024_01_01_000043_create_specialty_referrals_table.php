<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('specialty_referrals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('referral_number', 30)->unique();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignUuid('encounter_id')->nullable()->constrained('encounters')->nullOnDelete();
            $table->foreignUuid('referring_provider_id')->constrained('users')->cascadeOnDelete();
            $table->string('referred_to_specialty', 50);
            $table->foreignUuid('referred_to_provider_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->string('urgency', 10);
            $table->text('reason');
            $table->text('clinical_notes')->nullable();
            $table->string('status', 20)->default('pending');
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'status']);
            $table->index(['referred_to_specialty', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('specialty_referrals');
    }
};
