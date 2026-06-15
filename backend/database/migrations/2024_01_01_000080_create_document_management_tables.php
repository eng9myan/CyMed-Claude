<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Document versions (for existing clinical_documents)
        Schema::create('document_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('document_id')->constrained('clinical_documents')->cascadeOnDelete();
            $table->integer('version_number');
            $table->string('file_path', 500);
            $table->integer('file_size_bytes')->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->string('checksum', 64)->nullable(); // SHA-256
            $table->foreignUuid('uploaded_by')->constrained('users')->cascadeOnDelete();
            $table->text('change_summary')->nullable();
            $table->timestamp('created_at');

            $table->index(['document_id', 'version_number']);
        });

        // Electronic signatures
        Schema::create('electronic_signatures', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('signable_type', 100); // clinical_document, consent_form, etc.
            $table->uuid('signable_id');
            $table->foreignUuid('signer_id')->constrained('users')->cascadeOnDelete();
            $table->string('signature_type', 30)->default('electronic'); // electronic, digital, wet
            $table->string('signature_hash', 128); // HMAC of document content + signer + timestamp
            $table->string('certificate_thumbprint', 128)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('reason', 200)->nullable();
            $table->string('status', 20)->default('valid'); // valid, revoked, expired
            $table->timestamp('signed_at');
            $table->timestamps();

            $table->index(['signable_type', 'signable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('electronic_signatures');
        Schema::dropIfExists('document_versions');
    }
};
