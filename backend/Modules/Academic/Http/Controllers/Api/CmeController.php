<?php

namespace Modules\Academic\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Academic\Models\CmeActivity;
use Modules\Academic\Models\CmeCompletion;

class CmeController extends Controller
{
    public function activities(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('cme.view')) {
            abort(403);
        }

        $query = CmeActivity::query()->with(['facility:id,name', 'creator:id,first_name,last_name']);

        if ($request->has('activity_type')) {
            $query->where('activity_type', $request->activity_type);
        }

        if ($request->has('is_mandatory')) {
            $query->where('is_mandatory', (bool) $request->is_mandatory);
        }

        $activities = $query->orderByDesc('activity_date')->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $activities->items(),
            'meta' => [
                'total' => $activities->total(),
                'per_page' => $activities->perPage(),
                'current_page' => $activities->currentPage(),
                'last_page' => $activities->lastPage(),
            ],
        ]);
    }

    public function storeActivity(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('cme.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'title' => ['required', 'string', 'max:255'],
            'activity_type' => ['required', 'in:conference,workshop,webinar,journal_club,grand_rounds,simulation,online_course'],
            'provider' => ['nullable', 'string', 'max:100'],
            'credit_hours' => ['required', 'numeric', 'min:0'],
            'accreditation_body' => ['nullable', 'string', 'max:100'],
            'activity_date' => ['required', 'date'],
            'expiry_date' => ['nullable', 'date', 'after:activity_date'],
            'is_mandatory' => ['nullable', 'boolean'],
        ]);

        $validated['created_by'] = $authUser->id;

        $activity = CmeActivity::create($validated);

        return response()->json([
            'data' => $activity->load(['facility:id,name', 'creator:id,first_name,last_name']),
            'message' => 'CME activity created.',
        ], 201);
    }

    public function recordCompletion(Request $request): JsonResponse
    {
        $authUser = $request->user();

        $validated = $request->validate([
            'activity_id' => ['required', 'uuid', 'exists:cme_activities,id'],
            'completed_at' => ['required', 'date'],
            'credits_earned' => ['required', 'numeric', 'min:0'],
            'certificate_number' => ['nullable', 'string', 'max:50'],
        ]);

        $validated['user_id'] = $authUser->id;

        // Check if already completed
        $existing = CmeCompletion::where('activity_id', $validated['activity_id'])
            ->where('user_id', $authUser->id)
            ->first();

        if ($existing) {
            return response()->json([
                'data' => $existing->load(['activity:id,title,credit_hours']),
                'message' => 'CME completion already recorded.',
            ]);
        }

        $completion = CmeCompletion::create($validated);

        return response()->json([
            'data' => $completion->load(['activity:id,title,credit_hours']),
            'message' => 'CME completion recorded.',
        ], 201);
    }

    public function myCredits(Request $request): JsonResponse
    {
        $authUser = $request->user();

        $completions = CmeCompletion::where('user_id', $authUser->id)
            ->with(['activity:id,title,activity_type,activity_date,credit_hours'])
            ->orderByDesc('completed_at')
            ->get();

        $totalCredits = $completions->sum('credits_earned');

        return response()->json([
            'data' => [
                'completions' => $completions,
                'total_credits' => round((float) $totalCredits, 2),
            ],
        ]);
    }

    public function userCredits(Request $request, string $userId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('cme.view')) {
            abort(403);
        }

        $completions = CmeCompletion::where('user_id', $userId)
            ->with(['activity:id,title,activity_type,activity_date,credit_hours'])
            ->orderByDesc('completed_at')
            ->get();

        $totalCredits = $completions->sum('credits_earned');

        return response()->json([
            'data' => [
                'user_id' => $userId,
                'completions' => $completions,
                'total_credits' => round((float) $totalCredits, 2),
            ],
        ]);
    }
}
