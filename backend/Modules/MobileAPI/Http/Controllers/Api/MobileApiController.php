<?php

namespace Modules\MobileAPI\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Modules\MobileAPI\Models\MobileDeviceToken;
use Modules\MobileAPI\Models\OfflineSyncToken;

class MobileApiController extends Controller
{
    public function registerDevice(Request $request): JsonResponse
    {
        $authUser = $request->user();

        $validated = $request->validate([
            'device_token' => ['required', 'string', 'max:500'],
            'platform' => ['required', 'in:ios,android'],
            'app_version' => ['nullable', 'string', 'max:20'],
            'device_model' => ['nullable', 'string', 'max:100'],
        ]);

        $token = MobileDeviceToken::updateOrCreate(
            ['user_id' => $authUser->id, 'device_token' => $validated['device_token']],
            array_merge($validated, ['is_active' => true, 'last_used_at' => now()])
        );

        return response()->json([
            'data' => $token,
            'message' => 'Device registered.',
        ], 201);
    }

    public function myDevices(Request $request): JsonResponse
    {
        $authUser = $request->user();

        $tokens = MobileDeviceToken::where('user_id', $authUser->id)
            ->where('is_active', true)
            ->orderByDesc('last_used_at')
            ->get();

        return response()->json(['data' => $tokens]);
    }

    public function deactivateDevice(Request $request, string $id): JsonResponse
    {
        $authUser = $request->user();

        $token = MobileDeviceToken::where('id', $id)
            ->where('user_id', $authUser->id)
            ->firstOrFail();

        $token->update(['is_active' => false]);

        return response()->json(['message' => 'Device deactivated.']);
    }

    public function requestSyncToken(Request $request): JsonResponse
    {
        $authUser = $request->user();

        $syncToken = Str::random(64);

        $token = OfflineSyncToken::create([
            'user_id' => $authUser->id,
            'sync_token' => $syncToken,
            'pending_sync' => [],
            'token_expires_at' => now()->addHours(24),
        ]);

        return response()->json([
            'data' => [
                'id' => $token->id,
                'sync_token' => $syncToken,
                'expires_at' => $token->token_expires_at,
            ],
            'message' => 'Sync token issued.',
        ], 201);
    }

    public function recordSync(Request $request, string $syncToken): JsonResponse
    {
        $authUser = $request->user();

        $token = OfflineSyncToken::where('sync_token', $syncToken)
            ->where('user_id', $authUser->id)
            ->where('token_expires_at', '>', now())
            ->firstOrFail();

        $validated = $request->validate([
            'pending_sync' => ['required', 'array'],
        ]);

        $token->update([
            'pending_sync' => $validated['pending_sync'],
            'last_synced_at' => now(),
        ]);

        return response()->json(['message' => 'Sync recorded.']);
    }
}
