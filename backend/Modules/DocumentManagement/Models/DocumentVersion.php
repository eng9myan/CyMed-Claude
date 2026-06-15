<?php

namespace Modules\DocumentManagement\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class DocumentVersion extends Model
{
    use HasUuids;

    protected $table = 'document_versions';

    const UPDATED_AT = null;

    protected $fillable = [
        'document_id', 'version_number', 'file_path', 'file_size_bytes',
        'mime_type', 'checksum', 'uploaded_by', 'change_summary',
    ];
}
