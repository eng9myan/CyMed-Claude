<?php

namespace Modules\Interoperability\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class FhirTransaction extends Model
{
    use HasUuids;

    protected $table = 'fhir_transactions';

    protected $fillable = [
        'transaction_id', 'facility_id', 'direction', 'resource_type',
        'operation', 'http_status', 'request_payload', 'response_payload',
        'source_system', 'transacted_at',
    ];

    protected $casts = [
        'transacted_at' => 'datetime',
    ];
}
