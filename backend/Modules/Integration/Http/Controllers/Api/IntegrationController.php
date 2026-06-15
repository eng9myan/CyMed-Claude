<?php

namespace Modules\Integration\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Modules\Integration\Models\Hl7Message;
use Modules\Integration\Models\IntegrationEndpoint;

class IntegrationController extends Controller
{
    public function endpoints(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('integration.manage')) {
            abort(403);
        }

        $query = IntegrationEndpoint::query();

        if ($request->has('facility_id')) {
            $query->where('facility_id', $request->facility_id);
        }

        if ($request->has('system_type')) {
            $query->where('system_type', $request->system_type);
        }

        $endpoints = $query->orderBy('endpoint_name')->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $endpoints->items(),
            'meta' => [
                'total' => $endpoints->total(),
                'per_page' => $endpoints->perPage(),
                'current_page' => $endpoints->currentPage(),
                'last_page' => $endpoints->lastPage(),
            ],
        ]);
    }

    public function storeEndpoint(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('integration.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'endpoint_name' => ['required', 'string', 'max:100'],
            'system_type' => ['required', 'in:lis,ris,pharmacy,emr,erp,pms,other'],
            'protocol' => ['required', 'in:hl7_v2,fhir_r4,rest,soap,sftp'],
            'host' => ['nullable', 'string', 'max:255'],
            'port' => ['nullable', 'integer', 'min:1', 'max:65535'],
            'path' => ['nullable', 'string', 'max:500'],
        ]);

        $endpoint = IntegrationEndpoint::create(array_merge($validated, [
            'auth_config' => '{}',
            'status' => 'active',
        ]));

        return response()->json([
            'data' => $endpoint,
            'message' => 'Integration endpoint registered.',
        ], 201);
    }

    public function receiveHl7(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('integration.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'message_type' => ['required', 'string', 'max:20'],
            'trigger_event' => ['required', 'string', 'max:10'],
            'raw_message' => ['required', 'string'],
            'source_system' => ['nullable', 'string', 'max:100'],
        ]);

        $messageId = 'MSG-' . now()->format('YmdHis') . '-' . strtoupper(Str::random(6));

        $hl7 = Hl7Message::create([
            'message_id' => $messageId,
            'facility_id' => $validated['facility_id'],
            'message_type' => $validated['message_type'],
            'trigger_event' => $validated['trigger_event'],
            'direction' => 'inbound',
            'source_system' => $validated['source_system'] ?? null,
            'raw_message' => $validated['raw_message'],
            'processing_status' => 'received',
            'message_datetime' => now(),
        ]);

        return response()->json([
            'data' => $hl7,
            'message' => 'HL7 message received.',
        ], 201);
    }

    public function hl7Messages(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('integration.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $query = Hl7Message::where('facility_id', $validated['facility_id']);

        if ($request->has('message_type')) {
            $query->where('message_type', $request->message_type);
        }

        if ($request->has('processing_status')) {
            $query->where('processing_status', $request->processing_status);
        }

        $messages = $query->orderByDesc('message_datetime')->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $messages->items(),
            'meta' => [
                'total' => $messages->total(),
                'per_page' => $messages->perPage(),
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
            ],
        ]);
    }
}
