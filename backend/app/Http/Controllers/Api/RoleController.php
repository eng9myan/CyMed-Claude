<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Role\StoreRoleRequest;
use App\Http\Resources\RoleResource;
use App\Models\User;
use App\Services\Audit\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function __construct(protected AuditService $auditService) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Role::class);

        $roles = Role::with('permissions')->withCount('users')->get();

        return response()->json(['data' => RoleResource::collection($roles)]);
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $this->authorize('create', Role::class);

        $role = Role::create(['name' => $request->name, 'guard_name' => 'web']);
        $role->syncPermissions($request->permissions);

        $this->auditService->logSecurityEvent('role_created', ['role' => $request->name]);

        return response()->json([
            'data' => new RoleResource($role->load('permissions')),
            'message' => 'Role created successfully.',
        ], 201);
    }

    public function show(Role $role): JsonResponse
    {
        $this->authorize('view', $role);

        return response()->json(['data' => new RoleResource($role->load('permissions'))]);
    }

    public function update(Request $request, Role $role): JsonResponse
    {
        $this->authorize('update', $role);

        $request->validate([
            'permissions' => ['required', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role->syncPermissions($request->permissions);
        $this->auditService->logSecurityEvent('role_updated', ['role' => $role->name]);

        return response()->json([
            'data' => new RoleResource($role->load('permissions')),
            'message' => 'Role updated successfully.',
        ]);
    }

    public function destroy(Role $role): JsonResponse
    {
        $this->authorize('delete', $role);

        $role->delete();
        $this->auditService->logSecurityEvent('role_deleted', ['role' => $role->name]);

        return response()->json(['message' => 'Role deleted.']);
    }

    public function permissions(): JsonResponse
    {
        $permissions = Permission::all()->groupBy(fn ($p) => explode('.', $p->name)[0]);

        return response()->json(['data' => $permissions]);
    }

    public function assignToUser(Request $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $request->validate([
            'roles' => ['required', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
        ]);

        $user->syncRoles(
            collect($request->roles)->map(fn ($name) => Role::findByName($name, 'web'))->all()
        );
        $this->auditService->logSecurityEvent('roles_assigned', [
            'target_user_id' => $user->id,
            'roles' => $request->roles,
        ]);

        return response()->json(['message' => 'Roles assigned.', 'data' => $user->getRoleNames()]);
    }
}
