<?php

namespace Modules\Interoperability\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Modules\Interoperability\Models\FhirResource;
use Modules\Interoperability\Models\FhirTransaction;

class FhirController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('fhir.read')) {
            abort(403);
        }

        $validated = $request->validate([
            'resource_type' => ['required', 'in:Patient,Observation,DiagnosticReport,MedicationRequest,Condition,Procedure,AllergyIntolerance,Encounter'],
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'internal_entity_id' => ['nullable', 'uuid'],
        ]);

        $query = FhirResource::where('resource_type', $validated['resource_type'])
            ->where('facility_id', $validated['facility_id'])
            ->where('status', 'active');

        if (isset($validated['internal_entity_id'])) {
            $query->where('internal_entity_id', $validated['internal_entity_id']);
        }

        $resources = $query->orderByDesc('updated_at')->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'resourceType' => 'Bundle',
            'type' => 'searchset',
            'total' => $resources->total(),
            'entry' => array_map(fn($r) => ['resource' => $r->resource_json], $resources->items()),
            'meta' => [
                'per_page' => $resources->perPage(),
                'current_page' => $resources->currentPage(),
                'last_page' => $resources->lastPage(),
            ],
        ]);
    }

    public function read(string $resourceType, string $fhirId): JsonResponse
    {
        $authUser = request()->user();
        if (! $authUser->hasPermissionTo('fhir.read')) {
            abort(403);
        }

        $resource = FhirResource::where('resource_type', $resourceType)
            ->where('fhir_id', $fhirId)
            ->firstOrFail();

        return response()->json($resource->resource_json);
    }

    public function create(Request $request, string $resourceType): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('fhir.write')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'resource_json' => ['required', 'array'],
            'internal_entity_id' => ['nullable', 'uuid'],
            'internal_entity_type' => ['nullable', 'string', 'max:50'],
        ]);

        $fhirId = Str::uuid()->toString();
        $resourceJson = array_merge($validated['resource_json'], [
            'resourceType' => $resourceType,
            'id' => $fhirId,
            'meta' => [
                'versionId' => '1',
                'lastUpdated' => now()->toISOString(),
            ],
        ]);

        $resource = FhirResource::create([
            'resource_type' => $resourceType,
            'fhir_id' => $fhirId,
            'facility_id' => $validated['facility_id'],
            'internal_entity_id' => $validated['internal_entity_id'] ?? null,
            'internal_entity_type' => $validated['internal_entity_type'] ?? null,
            'resource_json' => $resourceJson,
        ]);

        FhirTransaction::create([
            'transaction_id' => Str::uuid()->toString(),
            'facility_id' => $validated['facility_id'],
            'direction' => 'inbound',
            'resource_type' => $resourceType,
            'operation' => 'create',
            'http_status' => 201,
            'source_system' => $request->header('X-Source-System', 'CyMed'),
            'transacted_at' => now(),
        ]);

        return response()->json($resource->resource_json, 201);
    }

    public function update(Request $request, string $resourceType, string $fhirId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('fhir.write')) {
            abort(403);
        }

        $resource = FhirResource::where('resource_type', $resourceType)
            ->where('fhir_id', $fhirId)
            ->firstOrFail();

        $validated = $request->validate([
            'resource_json' => ['required', 'array'],
        ]);

        $currentVersion = (int) ($resource->resource_json['meta']['versionId'] ?? 0);
        $resourceJson = array_merge($validated['resource_json'], [
            'resourceType' => $resourceType,
            'id' => $fhirId,
            'meta' => [
                'versionId' => (string) ($currentVersion + 1),
                'lastUpdated' => now()->toISOString(),
            ],
        ]);

        $resource->update(['resource_json' => $resourceJson]);

        return response()->json($resourceJson);
    }

    public function transactions(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('fhir.admin')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $transactions = FhirTransaction::where('facility_id', $validated['facility_id'])
            ->orderByDesc('transacted_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $transactions->items(),
            'meta' => [
                'total' => $transactions->total(),
                'per_page' => $transactions->perPage(),
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
            ],
        ]);
    }
}
