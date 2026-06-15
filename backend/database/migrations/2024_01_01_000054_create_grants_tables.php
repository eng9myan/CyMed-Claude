<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('research_grants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('grant_number', 50)->unique(); // GR-{year}-{seq}
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->foreignUuid('principal_investigator_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 500);
            $table->string('funding_agency', 200);
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('SAR');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('status', 20)->default('active'); // pending, active, completed, terminated
            $table->text('objectives')->nullable();
            $table->timestamps();

            $table->index(['facility_id', 'status']);
            $table->index(['principal_investigator_id', 'start_date']);
        });

        Schema::create('grant_expenditures', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('research_grant_id')->constrained('research_grants')->cascadeOnDelete();
            $table->date('expenditure_date');
            $table->string('category', 50); // personnel, equipment, supplies, travel, indirect
            $table->string('description', 300);
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('SAR');
            $table->foreignUuid('recorded_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->index(['research_grant_id', 'expenditure_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grant_expenditures');
        Schema::dropIfExists('research_grants');
    }
};
