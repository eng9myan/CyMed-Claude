<?php

namespace Modules\Compliance\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Modules\Compliance\Models\ApiKey;
use Modules\Compliance\Models\HipaaAccessLog;

class ComplianceController extends Controller
{
    public function accessLogs(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('compliance.audit')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $query = HipaaAccessLog::where('facility_id', $validated['facility_id']);

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        if ($request->has('is_break_glass')) {
            $query->where('is_break_glass', (bool) $request->is_break_glass);
        }

        if ($request->has('from')) {
            $query->where('accessed_at', '>=', $request->from);
        }

        if ($request->has('to')) {
            $query->where('accessed_at', '<=', $request->to);
        }

        $logs = $query->orderByDesc('accessed_at')->paginate((int) ($request->per_page ?? 50));

        return response()->json([
            'data' => $logs->items(),
            'meta' => [
                'total' => $logs->total(),
                'per_page' => $logs->perPage(),
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
            ],
        ]);
    }

    public function logAccess(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patient_id' => ['nullable', 'uuid'],
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'resource_type' => ['required', 'string', 'max:50'],
            'resource_id' => ['nullable', 'uuid'],
            'action' => ['required', 'in:view,create,update,delete,export,print'],
            'is_break_glass' => ['sometimes', 'boolean'],
            'break_glass_reason' => ['nullable', 'string'],
        ]);

        $log = HipaaAccessLog::create(array_merge($validated, [
            'user_id' => $request->user()->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'is_authorized' => true,
            'accessed_at' => now(),
        ]));

        return response()->json([
            'data' => $log,
            'message' => 'Access logged.',
        ], 201);
    }

    public function apiKeys(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('compliance.api_keys')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $keys = ApiKey::where('facility_id', $validated['facility_id'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $keys]);
    }

    public function createApiKey(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('compliance.api_keys')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'key_name' => ['required', 'string', 'max:100'],
            'system_type' => ['nullable', 'string', 'max:50'],
            'permissions' => ['nullable', 'array'],
            'expires_at' => ['nullable', 'date'],
        ]);

        $rawKey = 'cymk_' . Str::random(40);
        $prefix = substr($rawKey, 0, 12);

        $apiKey = ApiKey::create(array_merge($validated, [
            'key_hash' => Hash::make($rawKey),
            'key_prefix' => $prefix,
            'permissions' => $validated['permissions'] ?? [],
            'status' => 'active',
            'created_by' => $authUser->id,
        ]));

        return response()->json([
            'data' => $apiKey,
            'key' => $rawKey,
            'message' => 'API key created. Store the key securely — it will not be shown again.',
        ], 201);
    }

    public function revokeApiKey(Request $request, string $id): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('compliance.api_keys')) {
            abort(403);
        }

        $apiKey = ApiKey::findOrFail($id);
        $apiKey->update(['status' => 'revoked']);

        return response()->json(['message' => 'API key revoked.']);
    }
}
