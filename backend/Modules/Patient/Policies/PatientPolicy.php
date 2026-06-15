<?php

namespace Modules\Patient\Policies;

use App\Models\User;
use Modules\Patient\Models\Patient;

class PatientPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyPermission(['patient.view', 'patients.view']);
    }

    public function view(User $user, Patient $patient): bool
    {
        return $user->hasAnyPermission(['patient.view', 'patients.view']);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('patients.create');
    }

    public function update(User $user, Patient $patient): bool
    {
        return $user->hasAnyPermission(['patients.update', 'patients.create']);
    }

    public function delete(User $user, Patient $patient): bool
    {
        return $user->hasPermissionTo('patients.delete');
    }

    public function merge(User $user, Patient $patient): bool
    {
        return $user->hasPermissionTo('patients.merge');
    }
}
