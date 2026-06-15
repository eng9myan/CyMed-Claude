<?php

namespace Modules\Pharmacy\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PharmacyController extends Controller
{
    public function checkInteractions(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['pharmacy.prescribe', 'pharmacy.verify', 'patients.view'])) {
            abort(403);
        }

        $validated = $request->validate([
            'rxnorm_codes' => ['required', 'array', 'min:2'],
            'rxnorm_codes.*' => ['required', 'string'],
        ]);

        // Placeholder — real implementation would call an external drug interaction API
        return response()->json([
            'data' => [
                'interactions' => [],
                'checked_codes' => $validated['rxnorm_codes'],
                'severity_summary' => ['contraindicated' => 0, 'major' => 0, 'moderate' => 0, 'minor' => 0],
            ],
            'meta' => ['checked_at' => now()->toIso8601String()],
        ]);
    }
}
