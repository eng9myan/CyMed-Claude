<?php

namespace Modules\Interoperability\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class FhirResource extends Model
{
    use HasUuids;

    protected $table = 'fhir_resources';

    protected $fillable = [
        'resource_type', 'fhir_id', 'fhir_version', 'facility_id',
        'internal_entity_id', 'internal_entity_type', 'resource_json', 'status',
    ];

    protected $casts = [
        'resource_json' => 'array',
    ];
}
