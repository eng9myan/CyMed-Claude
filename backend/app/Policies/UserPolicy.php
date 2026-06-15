<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $authUser): bool
    {
        return $authUser->hasAnyRole(['super-admin', 'system-admin', 'hospital-admin', 'hr-officer']);
    }

    public function view(User $authUser, User $user): bool
    {
        if ($authUser->id === $user->id) {
            return true;
        }
        return $authUser->hasAnyPermission(['manage-users', 'view-users']);
    }

    public function create(User $authUser): bool
    {
        return $authUser->hasPermissionTo('manage-users');
    }

    public function update(User $authUser, User $user): bool
    {
        if (! $authUser->hasPermissionTo('manage-users')) {
            return false;
        }
        // Hospital admins cannot update super-admins or system-admins
        if ($authUser->hasRole('hospital-admin') && $user->hasAnyRole(['super-admin', 'system-admin'])) {
            return false;
        }
        return true;
    }

    public function delete(User $authUser, User $user): bool
    {
        if ($authUser->id === $user->id) {
            return false;
        }
        if ($user->hasRole('super-admin')) {
            return false;
        }
        return $authUser->hasPermissionTo('manage-users');
    }

    public function restore(User $authUser, User $user): bool
    {
        return $authUser->hasPermissionTo('manage-users');
    }

    public function impersonate(User $authUser, User $user): bool
    {
        if ($authUser->id === $user->id) {
            return false;
        }
        return $authUser->hasRole('super-admin');
    }
}
