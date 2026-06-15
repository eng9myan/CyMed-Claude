<?php

namespace Modules\HR\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyRole(['super-admin', 'system-admin', 'hospital-admin', 'hr-officer'])
            && ! $authUser->hasAnyPermission(['view-users', 'hr.staff.view', 'manage-users'])) {
            abort(403);
        }

        $query = User::with(['roles.permissions', 'permissions', 'facility', 'department'])
            ->when($request->user_type, fn ($q, $v) => $q->where('user_type', $v))
            ->when($request->facility_id, fn ($q, $v) => $q->where('facility_id', $v))
            ->when($request->department_id, fn ($q, $v) => $q->where('department_id', $v))
            ->when($request->specialty, fn ($q, $v) => $q->where('specialty', 'ilike', "%{$v}%"))
            ->when($request->is_active !== null, fn ($q) => $q->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN)))
            ->when($request->search, function ($q, $v) {
                $q->where(fn ($s) => $s
                    ->where('first_name', 'ilike', "%{$v}%")
                    ->orWhere('last_name', 'ilike', "%{$v}%")
                    ->orWhere('display_name', 'ilike', "%{$v}%")
                    ->orWhere('employee_id', 'ilike', "%{$v}%")
                    ->orWhere('email', 'ilike', "%{$v}%")
                );
            })
            ->latest();

        $staff = $query->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => UserResource::collection($staff),
            'meta' => [
                'total' => $staff->total(),
                'per_page' => $staff->perPage(),
                'current_page' => $staff->currentPage(),
                'last_page' => $staff->lastPage(),
            ],
        ]);
    }

    public function show(Request $request, User $user): JsonResponse
    {
        $authUser = $request->user();
        $isSelf = $authUser->id === $user->id;

        if (! $isSelf && ! $authUser->hasAnyPermission(['view-users', 'hr.staff.view', 'manage-users'])) {
            abort(403);
        }

        $user->load(['roles', 'facility', 'department', 'credentials']);

        return response()->json(['data' => new UserResource($user)]);
    }

    public function updateProfile(Request $request, User $user): JsonResponse
    {
        $authUser = $request->user();
        $isSelf = $authUser->id === $user->id;

        if (! $isSelf && ! $authUser->hasAnyPermission(['manage-users', 'hr.staff.manage'])) {
            abort(403);
        }

        $rules = [
            'job_title' => ['nullable', 'string', 'max:200'],
            'specialty' => ['nullable', 'string', 'max:100'],
            'subspecialty' => ['nullable', 'string', 'max:100'],
            'professional_license_number' => ['nullable', 'string', 'max:50'],
            'license_expiry_date' => ['nullable', 'date'],
            'scfhs_number' => ['nullable', 'string', 'max:30'],
            'npi' => ['nullable', 'string', 'max:20'],
            'phone' => ['nullable', 'string', 'max:20'],
            'mobile' => ['nullable', 'string', 'max:20'],
        ];

        // Only HR/admin can reassign facility/department
        if (! $isSelf && $authUser->hasAnyPermission(['manage-users', 'hr.staff.manage'])) {
            $rules['department_id'] = ['nullable', 'uuid', 'exists:departments,id'];
            $rules['facility_id'] = ['nullable', 'uuid', 'exists:facilities,id'];
        }

        $validated = $request->validate($rules);

        $user->update($validated);

        return response()->json([
            'data' => new UserResource($user->fresh(['roles', 'facility', 'department'])),
            'message' => 'Professional profile updated.',
        ]);
    }

    public function expiringLicenses(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyRole(['super-admin', 'system-admin', 'hospital-admin', 'hr-officer'])
            && ! $authUser->hasAnyPermission(['view-users', 'hr.staff.view', 'manage-users'])) {
            abort(403);
        }

        $days = max(1, min(365, (int) $request->get('days', 90)));
        $cutoff = now()->addDays($days)->toDateString();

        $staff = User::with(['roles.permissions', 'permissions', 'facility', 'department'])
            ->whereNotNull('license_expiry_date')
            ->where('license_expiry_date', '<=', $cutoff)
            ->where('is_active', true)
            ->orderBy('license_expiry_date')
            ->get();

        return response()->json([
            'data' => UserResource::collection($staff),
            'meta' => ['days_threshold' => $days, 'count' => $staff->count()],
        ]);
    }
}
