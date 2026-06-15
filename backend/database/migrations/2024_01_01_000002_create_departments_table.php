<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained()->cascadeOnDelete();
            $table->uuid('parent_id')->nullable(); // Self-ref FK added after table creation
            $table->string('code', 20);
            $table->string('name');
            $table->string('name_ar')->nullable();
            $table->string('department_type'); // clinical/administrative/support/ancillary
            $table->string('specialty')->nullable();
            $table->string('cost_center_code', 20)->nullable();
            $table->string('phone_extension')->nullable();
            $table->string('email')->nullable();
            $table->string('location_floor')->nullable();
            $table->string('location_wing')->nullable();
            $table->integer('total_beds')->default(0);
            $table->boolean('is_active')->default(true);
            $table->jsonb('settings')->default('{}');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['facility_id', 'code']);
            $table->index('parent_id');
        });

        // Add self-referential FK after table is fully created with PK
        Schema::table('departments', function (Blueprint $table) {
            $table->foreign('parent_id')
                ->references('id')
                ->on('departments')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('departments');
    }
};
