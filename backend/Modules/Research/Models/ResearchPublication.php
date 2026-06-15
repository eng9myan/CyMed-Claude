<?php

namespace Modules\Research\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ResearchPublication extends Model
{
    use HasUuids;

    protected $table = 'research_publications';

    protected $fillable = [
        'facility_id', 'title', 'publication_type', 'journal_name', 'doi',
        'pubmed_id', 'publication_year', 'volume', 'issue', 'pages',
        'authors', 'impact_factor', 'citation_count', 'corresponding_author_id',
    ];

    protected $casts = [
        'authors' => 'array',
        'citation_count' => 'integer',
    ];

    public function correspondingAuthor()
    {
        return $this->belongsTo(User::class, 'corresponding_author_id');
    }
}
