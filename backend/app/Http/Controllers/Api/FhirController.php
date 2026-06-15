<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Fhir\FhirService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FhirController extends Controller
{
    public function __construct(protected FhirService $fhirService) {}

    public function metadata(): JsonResponse
    {
        return response()->json([
            'resourceType' => 'CapabilityStatement',
            'status' => 'active',
            'date' => now()->toIso8601String(),
            'kind' => 'instance',
            'software' => [
                'name' => 'CyMed FHIR Server',
                'version' => config('cymed.version'),
            ],
            'implementation' => [
                'description' => 'CyMed Healthcare ERP FHIR R4 API',
                'url' => config('cymed.fhir.base_url'),
            ],
            'fhirVersion' => '4.0.1',
            'format' => ['json'],
            'rest' => [
                [
                    'mode' => 'server',
                    'resource' => array_map(fn($r) => [
                        'type' => $r,
                        'interaction' => [
                            ['code' => 'read'],
                            ['code' => 'search-type'],
                            ['code' => 'create'],
                            ['code' => 'update'],
                        ],
                    ], config('cymed.fhir.resources')),
                ],
            ],
        ]);
    }

    public function read(Request $request, string $resourceType, string $id): JsonResponse
    {
        return response()->json([
            'resourceType' => $resourceType,
            'id' => $id,
            'meta' => ['lastUpdated' => now()->toIso8601String()],
        ]);
    }

    public function search(Request $request, string $resourceType): JsonResponse
    {
        return response()->json([
            'resourceType' => 'Bundle',
            'type' => 'searchset',
            'total' => 0,
            'entry' => [],
        ]);
    }

    public function create(Request $request, string $resourceType): JsonResponse
    {
        return response()->json(['resourceType' => $resourceType, 'id' => \Illuminate\Support\Str::uuid()], 201);
    }

    public function update(Request $request, string $resourceType, string $id): JsonResponse
    {
        return response()->json(['resourceType' => $resourceType, 'id' => $id]);
    }

    public function delete(Request $request, string $resourceType, string $id): JsonResponse
    {
        return response()->json(null, 204);
    }

    public function history(Request $request, string $resourceType, string $id): JsonResponse
    {
        return response()->json(['resourceType' => 'Bundle', 'type' => 'history', 'entry' => []]);
    }

    public function transaction(Request $request): JsonResponse
    {
        return response()->json(['resourceType' => 'Bundle', 'type' => 'transaction-response', 'entry' => []]);
    }
}
