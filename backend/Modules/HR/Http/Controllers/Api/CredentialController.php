<?php

namespace Modules\HR\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\HR\Models\StaffCredential;

class CredentialController extends Controller
{
    public function index(Request $request, User $user): JsonResponse
    {
        $authUser = $request->user();
        $isSelf = $authUser->id === $user->id;

        if (! $isSelf && ! $authUser->hasAnyPermission(['view-users', 'hr.staff.view', 'manage-users'])) {
            abort(403);
        }

        $credentials = StaffCredential::where('user_id', $user->id)
            ->when($request->credential_type, fn ($q, $v) => $q->where('credential_type', $v))
            ->orderByDesc('expiry_date')
            ->get();

        return response()->json(['data' => $credentials]);
    }

    public function store(Request $request, User $user): JsonResponse
    {
        $authUser = $request->user();
        $isSelf = $authUser->id === $user->id;

        if (! $isSelf && ! $authUser->hasAnyPermission(['manage-users', 'hr.staff.manage'])) {
            abort(403);
        }

        $validated = $request->validate([
            'credential_type' => ['required', 'in:license,certification,qualification,training,vaccination,background_check'],
            'title' => ['required', 'string', 'max:200'],
            'title_ar' => ['nullable', 'string', 'max:200'],
            'issuing_authority' => ['nullable', 'string', 'max:200'],
            'credential_number' => ['nullable', 'string', 'max:100'],
            'issued_date' => ['nullable', 'date'],
            'expiry_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $credential = StaffCredential::create(array_merge($validated, ['user_id' => $user->id]));

        return response()->json(['data' => $credential, 'message' => 'Credential added.'], 201);
    }

    public function update(Request $request, User $user, string $credential): JsonResponse
    {
        $authUser = $request->user();
        $isSelf = $authUser->id === $user->id;

        if (! $isSelf && ! $authUser->hasAnyPermission(['manage-users', 'hr.staff.manage'])) {
            abort(403);
        }

        $cred = StaffCredential::where('user_id', $user->id)->findOrFail($credential);

        $validated = $request->validate([
            'credential_type' => ['sometimes', 'in:license,certification,qualification,training,vaccination,background_check'],
            'title' => ['sometimes', 'string', 'max:200'],
            'title_ar' => ['nullable', 'string', 'max:200'],
            'issuing_authority' => ['nullable', 'string', 'max:200'],
            'credential_number' => ['nullable', 'string', 'max:100'],
            'issued_date' => ['nullable', 'date'],
            'expiry_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $cred->update($validated);

        return response()->json(['data' => $cred->fresh(), 'message' => 'Credential updated.']);
    }

    public function destroy(Request $request, User $user, string $credential): JsonResponse
    {
        $authUser = $request->user();
        $isSelf = $authUser->id === $user->id;

        if (! $isSelf && ! $authUser->hasAnyPermission(['manage-users', 'hr.staff.manage'])) {
            abort(403);
        }

        $cred = StaffCredential::where('user_id', $user->id)->findOrFail($credential);
        $cred->delete();

        return response()->json(['message' => 'Credential removed.']);
    }

    public function expiring(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyRole(['super-admin', 'system-admin', 'hospital-admin', 'hr-officer'])
            && ! $authUser->hasAnyPermission(['view-users', 'hr.staff.view', 'manage-users'])) {
            abort(403);
        }

        $days = max(1, min(365, (int) $request->get('days', 90)));

        $credentials = StaffCredential::with('user:id,first_name,last_name,employee_id,user_type')
            ->expiringSoon($days)
            ->orderBy('expiry_date')
            ->get();

        return response()->json([
            'data' => $credentials,
            'meta' => ['days_threshold' => $days, 'count' => $credentials->count()],
        ]);
    }
}
