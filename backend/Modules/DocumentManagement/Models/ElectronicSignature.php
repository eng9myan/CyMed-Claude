<?php

namespace Modules\DocumentManagement\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ElectronicSignature extends Model
{
    use HasUuids;

    protected $table = 'electronic_signatures';

    protected $fillable = [
        'signable_type', 'signable_id', 'signer_id', 'signature_type',
        'signature_hash', 'certificate_thumbprint', 'ip_address',
        'reason', 'status', 'signed_at',
    ];

    protected $casts = [
        'signed_at' => 'datetime',
    ];
}
