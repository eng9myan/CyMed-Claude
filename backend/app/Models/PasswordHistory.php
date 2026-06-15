<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Hash;

class PasswordHistory extends Model
{
    use HasUuids;

    public $timestamps = false;
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['user_id', 'password_hash', 'created_at'];

    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function recordPassword(User $user): void
    {
        static::create([
            'user_id' => $user->id,
            'password_hash' => $user->password,
            'created_at' => now(),
        ]);

        // Keep only last 12 entries
        $ids = static::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->skip(12)
            ->pluck('id');

        if ($ids->isNotEmpty()) {
            static::whereIn('id', $ids)->delete();
        }
    }

    public static function isPasswordReused(User $user, string $plainPassword, int $historyCount = 12): bool
    {
        return static::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit($historyCount)
            ->get()
            ->contains(fn ($history) => Hash::check($plainPassword, $history->password_hash));
    }
}
