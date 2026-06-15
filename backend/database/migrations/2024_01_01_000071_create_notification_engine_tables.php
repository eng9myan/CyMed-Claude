<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('template_code', 50)->unique();
            $table->string('name', 200);
            $table->string('channel', 20); // push, sms, email, in_app
            $table->string('subject', 300)->nullable(); // for email
            $table->text('body_template'); // mustache/blade template
            $table->string('language', 5)->default('en');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('notification_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->uuid('patient_id')->nullable();
            $table->string('template_code', 50)->nullable();
            $table->string('channel', 20); // push, sms, email, in_app
            $table->string('recipient', 255); // phone/email/device_token
            $table->string('subject', 300)->nullable();
            $table->text('body');
            $table->string('status', 20)->default('sent'); // sent, delivered, failed, bounced
            $table->string('external_id', 100)->nullable(); // provider message ID
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at');
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'sent_at']);
            $table->index(['status', 'channel']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
        Schema::dropIfExists('notification_templates');
    }
};
