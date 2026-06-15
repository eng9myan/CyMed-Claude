<?php

namespace App\Services\User;

use App\Models\User;
use App\Services\Auth\PasswordService;
use App\Services\Auth\TokenService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserService
{
    public function __construct(
        protected PasswordService $passwordService,
        protected TokenService $tokenService,
    ) {}

    public function list(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = User::with(['roles.permissions', 'permissions', 'facility', 'department'])
            ->when($filters['facility_id'] ?? null, fn ($q, $v) => $q->where('facility_id', $v))
            ->when($filters['department_id'] ?? null, fn ($q, $v) => $q->where('department_id', $v))
            ->when($filters['user_type'] ?? null, fn ($q, $v) => $q->where('user_type', $v))
            ->when($filters['is_active'] ?? null, fn ($q, $v) => $q->where('is_active', (bool) $v))
            ->when($filters['role'] ?? null, fn ($q, $v) => $q->whereHas('roles', fn ($r) => $r->where('name', $v)))
            ->when($filters['search'] ?? null, function ($q, $v) {
                $q->where(fn ($s) => $s
                    ->where('first_name', 'ilike', "%{$v}%")
                    ->orWhere('last_name', 'ilike', "%{$v}%")
                    ->orWhere('username', 'ilike', "%{$v}%")
                    ->orWhere('email', 'ilike', "%{$v}%")
                    ->orWhere('employee_id', 'ilike', "%{$v}%")
                );
            })
            ->latest();

        if ($filters['with_trashed'] ?? false) {
            $query->withTrashed();
        }

        return $query->paginate($perPage);
    }

    public function create(array $data): User
    {
        $roles = $data['roles'] ?? [];
        unset($data['roles']);

        $data['password'] = Hash::make($data['password']);
        $data['password_changed_at'] = now();

        $user = User::create($data);

        if ($roles) {
            $user->syncRoles($roles);
        }

        return $user->load(['roles', 'facility', 'department']);
    }

    public function update(User $user, array $data): User
    {
        $roles = $data['roles'] ?? null;
        unset($data['roles'], $data['password']);

        $user->update($data);

        if ($roles !== null) {
            $user->syncRoles($roles);
        }

        return $user->load(['roles', 'facility', 'department']);
    }

    public function deactivate(User $user): void
    {
        $user->update(['is_active' => false]);
        $this->tokenService->revokeAllUserTokens($user, 'account_deactivated');
    }

    public function activate(User $user): void
    {
        $user->update(['is_active' => true]);
    }

    public function syncRoles(User $user, array $roleNames): void
    {
        $roles = Role::whereIn('name', $roleNames)->where('guard_name', 'web')->get();
        $user->syncRoles($roles);
    }
}
