<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Spatie\Permission\Models\Role;

class RolePolicy
{
    use HandlesAuthorization;

    private const SYSTEM_ROLES = ['super-admin', 'hospital-admin', 'physician', 'nurse', 'patient'];

    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'system-admin', 'hospital-admin']);
    }

    public function view(User $user, Role $role): bool
    {
        return $user->hasAnyRole(['super-admin', 'system-admin', 'hospital-admin']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'system-admin']);
    }

    public function update(User $user, Role $role): bool
    {
        if (in_array($role->name, self::SYSTEM_ROLES) && ! $user->hasRole('super-admin')) {
            return false;
        }
        return $user->hasAnyRole(['super-admin', 'system-admin']);
    }

    public function delete(User $user, Role $role): bool
    {
        if (in_array($role->name, self::SYSTEM_ROLES)) {
            return false;
        }
        return $user->hasRole('super-admin');
    }
}
