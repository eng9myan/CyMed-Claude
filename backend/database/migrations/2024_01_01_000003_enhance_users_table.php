<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop the default users table first if it exists with wrong schema
        Schema::dropIfExists('users');

        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('department_id')->nullable()->constrained()->nullOnDelete();

            // Identity
            $table->string('employee_id', 30)->nullable()->unique();
            $table->string('username', 50)->unique();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');

            // Personal Information
            $table->string('first_name');
            $table->string('last_name');
            $table->string('first_name_ar')->nullable();
            $table->string('last_name_ar')->nullable();
            $table->string('display_name')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('gender', 1)->nullable(); // M/F
            $table->string('national_id', 20)->nullable()->unique();
            $table->string('passport_number', 20)->nullable();
            $table->string('nationality', 2)->nullable()->default('SA');
            $table->string('phone', 20)->nullable();
            $table->string('phone_ext', 10)->nullable();
            $table->string('mobile', 20)->nullable();

            // Professional
            $table->string('job_title')->nullable();
            $table->string('specialty')->nullable();
            $table->string('subspecialty')->nullable();
            $table->string('professional_license_number', 50)->nullable();
            $table->date('license_expiry_date')->nullable();
            $table->string('scfhs_number', 30)->nullable(); // Saudi Commission for Health Specialties
            $table->string('dea_number', 20)->nullable();
            $table->string('npi', 20)->nullable();
            $table->string('signature_image_path')->nullable();
            $table->string('photo_path')->nullable();

            // System
            $table->string('user_type'); // physician/nurse/pharmacist/lab_tech/radiologist/admin/billing/etc
            $table->boolean('is_active')->default(true);
            $table->boolean('is_locked')->default(false);
            $table->string('locale', 5)->default('en');
            $table->string('timezone')->default('Asia/Riyadh');
            $table->boolean('is_rtl')->default(false);

            // MFA
            $table->string('mfa_secret')->nullable();
            $table->boolean('mfa_enabled')->default(false);
            $table->text('mfa_recovery_codes')->nullable();
            $table->timestamp('mfa_confirmed_at')->nullable();

            // Security
            $table->integer('failed_login_attempts')->default(0);
            $table->timestamp('locked_until')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip', 45)->nullable();
            $table->timestamp('password_changed_at')->nullable();
            $table->boolean('must_change_password')->default(false);
            $table->jsonb('password_history')->default('[]');

            // Preferences
            $table->jsonb('preferences')->default('{}');
            $table->jsonb('notification_settings')->default('{}');

            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });

        // Extend sessions table with user_id FK after users table is recreated
        Schema::table('sessions', function (Blueprint $table) {
            if (! Schema::hasColumn('sessions', 'user_id')) {
                $table->foreignUuid('user_id')->nullable()->index()->constrained()->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
