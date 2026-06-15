<?php

namespace App\Services\Auth;

use App\Models\MfaBackupCode;
use App\Models\User;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

class MfaService
{
    public function __construct(protected Google2FA $google2fa) {}

    public function generateSecret(): string
    {
        return $this->google2fa->generateSecretKey();
    }

    public function getQrCodeUrl(User $user, string $secret): string
    {
        return $this->google2fa->getQRCodeUrl(
            'CyMed Healthcare',
            $user->email,
            $secret
        );
    }

    public function generateQrCodeSvg(User $user, string $secret): string
    {
        $url = $this->getQrCodeUrl($user, $secret);

        $renderer = new ImageRenderer(
            new RendererStyle(200),
            new SvgImageBackEnd()
        );

        $writer = new Writer($renderer);
        return base64_encode($writer->writeString($url));
    }

    public function verifyCode(string $encryptedSecret, string $code): bool
    {
        try {
            $secret = Crypt::decryptString($encryptedSecret);
            return $this->google2fa->verifyKey($secret, $code, 1);
        } catch (\Exception) {
            return false;
        }
    }

    public function verifyBackupCode(User $user, string $code): bool
    {
        $normalised = strtoupper(str_replace('-', '', $code));

        $backupCode = MfaBackupCode::where('user_id', $user->id)
            ->whereNull('used_at')
            ->get()
            ->first(fn ($bc) => Hash::check($normalised, $bc->code_hash));

        if (! $backupCode) {
            return false;
        }

        return $backupCode->markUsed();
    }

    public function generateBackupCodes(User $user): array
    {
        // Delete existing unused codes
        MfaBackupCode::where('user_id', $user->id)->delete();

        $codes = [];
        for ($i = 0; $i < 8; $i++) {
            $plain = strtoupper(Str::random(4) . '-' . Str::random(4));
            $normalised = str_replace('-', '', $plain);
            MfaBackupCode::create([
                'user_id' => $user->id,
                'code_hash' => Hash::make($normalised),
                'created_at' => now(),
            ]);
            $codes[] = $plain;
        }

        return $codes;
    }

    public function enableMfa(User $user, string $plainSecret): void
    {
        $user->update([
            'mfa_secret' => Crypt::encryptString($plainSecret),
            'mfa_enabled' => true,
            'mfa_confirmed_at' => now(),
        ]);
    }

    public function disableMfa(User $user): void
    {
        MfaBackupCode::where('user_id', $user->id)->delete();
        $user->update([
            'mfa_secret' => null,
            'mfa_enabled' => false,
            'mfa_confirmed_at' => null,
        ]);
    }
}
