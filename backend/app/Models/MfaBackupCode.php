<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MfaBackupCode extends Model
{
    use HasUuids;

    public $timestamps = false;
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['user_id', 'code_hash', 'used_at', 'created_at'];

    protected function casts(): array
    {
        return ['used_at' => 'datetime', 'created_at' => 'datetime'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isUsed(): bool
    {
        return $this->used_at !== null;
    }

    public function markUsed(): bool
    {
        if ($this->isUsed()) {
            return false;
        }
        $this->update(['used_at' => now()]);
        return true;
    }
}
