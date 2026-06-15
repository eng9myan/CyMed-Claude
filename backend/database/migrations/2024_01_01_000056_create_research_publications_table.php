<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('research_publications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->string('title', 500);
            $table->string('publication_type', 30); // journal_article, conference_paper, book_chapter, thesis, report
            $table->string('journal_name', 300)->nullable();
            $table->string('doi', 100)->nullable()->unique();
            $table->string('pubmed_id', 20)->nullable();
            $table->year('publication_year');
            $table->string('volume', 20)->nullable();
            $table->string('issue', 20)->nullable();
            $table->string('pages', 30)->nullable();
            $table->jsonb('authors')->default('[]'); // array of author names
            $table->string('impact_factor', 10)->nullable();
            $table->integer('citation_count')->default(0);
            $table->foreignUuid('corresponding_author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['facility_id', 'publication_year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('research_publications');
    }
};
