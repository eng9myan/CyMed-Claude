<?php

namespace Modules\DocumentManagement\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Modules\DocumentManagement\Models\DocumentVersion;
use Modules\DocumentManagement\Models\ElectronicSignature;

class DocumentVersionController extends Controller
{
    public function versions(Request $request, string $documentId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('documents.view')) {
            abort(403);
        }

        $versions = DocumentVersion::where('document_id', $documentId)
            ->orderByDesc('version_number')
            ->get();

        return response()->json(['data' => $versions]);
    }

    public function uploadVersion(Request $request, string $documentId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('documents.upload')) {
            abort(403);
        }

        $validated = $request->validate([
            'file_path' => ['required', 'string', 'max:500'],
            'file_size_bytes' => ['nullable', 'integer'],
            'mime_type' => ['nullable', 'string', 'max:100'],
            'checksum' => ['nullable', 'string', 'max:64'],
            'change_summary' => ['nullable', 'string'],
        ]);

        $lastVersion = DocumentVersion::where('document_id', $documentId)
            ->max('version_number') ?? 0;

        $version = DocumentVersion::create(array_merge($validated, [
            'document_id' => $documentId,
            'version_number' => $lastVersion + 1,
            'uploaded_by' => $authUser->id,
        ]));

        return response()->json([
            'data' => $version,
            'message' => 'Document version uploaded.',
        ], 201);
    }

    public function sign(Request $request, string $signableType, string $signableId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('documents.sign')) {
            abort(403);
        }

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:200'],
            'signature_type' => ['sometimes', 'in:electronic,digital'],
        ]);

        $signatureHash = hash_hmac(
            'sha256',
            $signableType . $signableId . $authUser->id . now()->toISOString(),
            config('app.key')
        );

        $signature = ElectronicSignature::create([
            'signable_type' => $signableType,
            'signable_id' => $signableId,
            'signer_id' => $authUser->id,
            'signature_type' => $validated['signature_type'] ?? 'electronic',
            'signature_hash' => $signatureHash,
            'ip_address' => $request->ip(),
            'reason' => $validated['reason'] ?? null,
            'signed_at' => now(),
        ]);

        return response()->json([
            'data' => $signature,
            'message' => 'Document signed.',
        ], 201);
    }

    public function signatures(Request $request, string $signableType, string $signableId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('documents.view')) {
            abort(403);
        }

        $signatures = ElectronicSignature::where('signable_type', $signableType)
            ->where('signable_id', $signableId)
            ->where('status', 'valid')
            ->orderByDesc('signed_at')
            ->get();

        return response()->json(['data' => $signatures]);
    }
}
