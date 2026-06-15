<?php

namespace Modules\Compliance\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Compliance\Models\EntityAuditLog;

class AuditTrailController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('compliance.audit')) {
            abort(403);
        }

        $validated = $request->validate([
            'entity_type' => ['sometimes', 'string', 'max:100'],
            'entity_id' => ['sometimes', 'uuid'],
            'user_id' => ['sometimes', 'uuid'],
            'action' => ['sometimes', 'in:created,updated,deleted,restored'],
            'from' => ['sometimes', 'date'],
            'to' => ['sometimes', 'date'],
        ]);

        $query = EntityAuditLog::query();

        foreach (['entity_type', 'entity_id', 'user_id', 'action'] as $field) {
            if (isset($validated[$field])) {
                $query->where($field, $validated[$field]);
            }
        }

        if (isset($validated['from'])) {
            $query->where('audited_at', '>=', $validated['from']);
        }

        if (isset($validated['to'])) {
            $query->where('audited_at', '<=', $validated['to']);
        }

        $logs = $query->orderByDesc('audited_at')->paginate((int) ($request->per_page ?? 50));

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

    public function recordAudit(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'entity_type' => ['required', 'string', 'max:100'],
            'entity_id' => ['required', 'uuid'],
            'action' => ['required', 'in:created,updated,deleted,restored'],
            'old_values' => ['nullable', 'array'],
            'new_values' => ['nullable', 'array'],
            'changed_fields' => ['nullable', 'array'],
        ]);

        $log = EntityAuditLog::create(array_merge($validated, [
            'user_id' => $request->user()->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'request_id' => $request->header('X-Request-ID'),
            'old_values' => $validated['old_values'] ?? [],
            'new_values' => $validated['new_values'] ?? [],
            'changed_fields' => $validated['changed_fields'] ?? [],
            'audited_at' => now(),
        ]));

        return response()->json(['data' => $log, 'message' => 'Audit recorded.'], 201);
    }
}
