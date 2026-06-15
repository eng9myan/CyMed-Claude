<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Translation keys and locale strings for multi-language support
        Schema::create('locale_translations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('locale', 10); // en, ar, fr, tr, ur
            $table->string('namespace', 50)->default('general'); // general, clinical, billing, etc.
            $table->string('key', 255);
            $table->text('value');
            $table->boolean('is_verified')->default(false);
            $table->timestamps();

            $table->unique(['locale', 'namespace', 'key']);
            $table->index(['locale', 'namespace']);
        });

        // User-preferred locale settings (supplements users table)
        Schema::create('user_locale_preferences', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('locale', 10)->default('ar');
            $table->string('date_format', 20)->default('DD/MM/YYYY');
            $table->string('time_format', 5)->default('24h');
            $table->string('calendar_type', 10)->default('gregorian'); // gregorian, hijri
            $table->string('number_format', 10)->default('western'); // western, arabic-indic
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_locale_preferences');
        Schema::dropIfExists('locale_translations');
    }
};
