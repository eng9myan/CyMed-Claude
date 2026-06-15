<?php

namespace App\Services\Auth;

use App\Models\PasswordHistory;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class PasswordService
{
    public function sendResetLink(string $email): bool
    {
        $status = Password::sendResetLink(['email' => $email]);
        return $status === Password::RESET_LINK_SENT;
    }

    public function resetPassword(array $data): bool
    {
        $status = Password::reset(
            $data,
            function (User $user, string $password) {
                $this->validateNotReused($user, $password);
                $this->applyNewPassword($user, $password);
            }
        );

        return $status === Password::PASSWORD_RESET;
    }

    public function changePassword(User $user, string $currentPassword, string $newPassword): void
    {
        if (! Hash::check($currentPassword, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => [__('auth.current_password_incorrect')],
            ]);
        }

        $this->validateNotReused($user, $newPassword);
        $this->applyNewPassword($user, $newPassword);
    }

    public function validateNotReused(User $user, string $newPassword): void
    {
        if (PasswordHistory::isPasswordReused($user, $newPassword)) {
            throw ValidationException::withMessages([
                'password' => [__('auth.password_reused')],
            ]);
        }
    }

    public function isExpired(User $user): bool
    {
        // Password expiry only for clinical staff — 90 days
        $clinicalTypes = ['physician', 'resident', 'intern', 'consultant', 'nurse', 'charge_nurse', 'pharmacist'];

        if (! in_array($user->user_type, $clinicalTypes)) {
            return false;
        }

        if (! $user->password_changed_at) {
            return true;
        }

        return $user->password_changed_at->lt(now()->subDays(90));
    }

    private function applyNewPassword(User $user, string $password): void
    {
        PasswordHistory::recordPassword($user);

        $user->update([
            'password' => Hash::make($password),
            'password_changed_at' => now(),
            'must_change_password' => false,
        ]);
    }
}
