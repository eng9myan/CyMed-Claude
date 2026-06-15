<?php

namespace Modules\Academic\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Academic\Models\CmeCompletion;
use Modules\Academic\Models\GrandRound;
use Modules\Academic\Models\GrandRoundsAttendance;

class GrandRoundsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('academic.view')) {
            abort(403);
        }

        $query = GrandRound::query()
            ->with(['facility:id,name', 'presenter:id,first_name,last_name']);

        if ($request->has('facility_id')) {
            $query->where('facility_id', $request->facility_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $rounds = $query->orderByDesc('scheduled_at')->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $rounds->items(),
            'meta' => [
                'total' => $rounds->total(),
                'per_page' => $rounds->perPage(),
                'current_page' => $rounds->currentPage(),
                'last_page' => $rounds->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('academic.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'title' => ['required', 'string', 'max:255'],
            'presenter_id' => ['required', 'uuid', 'exists:users,id'],
            'department' => ['nullable', 'string', 'max:100'],
            'scheduled_at' => ['required', 'date'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
            'location' => ['nullable', 'string', 'max:100'],
            'topic_category' => ['required', 'in:case_presentation,research,guidelines,morbidity_mortality,journal_club,invited_lecture'],
            'case_summary' => ['nullable', 'string'],
            'learning_objectives' => ['nullable', 'array'],
            'cme_credit_hours' => ['nullable', 'numeric', 'min:0'],
        ]);

        $grandRound = GrandRound::create(array_merge($validated, ['status' => 'scheduled']));

        return response()->json([
            'data' => $grandRound->load(['facility:id,name', 'presenter:id,first_name,last_name']),
            'message' => 'Grand rounds scheduled.',
        ], 201);
    }

    public function attend(Request $request, GrandRound $grandRound): JsonResponse
    {
        $authUser = $request->user();

        $existing = GrandRoundsAttendance::where('grand_rounds_id', $grandRound->id)
            ->where('user_id', $authUser->id)
            ->first();

        if ($existing) {
            return response()->json([
                'data' => $existing,
                'message' => 'Attendance already recorded.',
            ]);
        }

        $cmeCompletionId = null;

        // Auto-create CME completion if credit hours > 0
        if ((float) $grandRound->cme_credit_hours > 0) {
            // Find or create a CME activity for this grand round
            $cmeCompletion = CmeCompletion::create([
                'activity_id' => $this->getOrCreateCmeActivity($grandRound),
                'user_id' => $authUser->id,
                'completed_at' => today()->toDateString(),
                'credits_earned' => $grandRound->cme_credit_hours,
            ]);
            $cmeCompletionId = $cmeCompletion->id;
        }

        $attendance = GrandRoundsAttendance::create([
            'grand_rounds_id' => $grandRound->id,
            'user_id' => $authUser->id,
            'attended_at' => now(),
            'cme_completion_id' => $cmeCompletionId,
        ]);

        return response()->json([
            'data' => $attendance->load(['user:id,first_name,last_name']),
            'message' => 'Attendance recorded.',
        ], 201);
    }

    private function getOrCreateCmeActivity(GrandRound $grandRound): string
    {
        // Find existing CME activity linked to this grand round or create one
        $activity = \Modules\Academic\Models\CmeActivity::where('title', 'Grand Rounds: ' . $grandRound->title)
            ->where('facility_id', $grandRound->facility_id)
            ->first();

        if (! $activity) {
            $activity = \Modules\Academic\Models\CmeActivity::create([
                'facility_id' => $grandRound->facility_id,
                'title' => 'Grand Rounds: ' . $grandRound->title,
                'activity_type' => 'grand_rounds',
                'credit_hours' => $grandRound->cme_credit_hours,
                'activity_date' => $grandRound->scheduled_at->toDateString(),
                'created_by' => $grandRound->presenter_id,
            ]);
        }

        return $activity->id;
    }

    public function complete(Request $request, GrandRound $grandRound): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('academic.manage')) {
            abort(403);
        }

        $grandRound->update(['status' => 'completed']);

        return response()->json([
            'data' => $grandRound->fresh()->load(['facility:id,name', 'presenter:id,first_name,last_name']),
            'message' => 'Grand rounds completed.',
        ]);
    }

    public function attendance(Request $request, GrandRound $grandRound): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('academic.view')) {
            abort(403);
        }

        $attendance = GrandRoundsAttendance::where('grand_rounds_id', $grandRound->id)
            ->with(['user:id,first_name,last_name,email'])
            ->get();

        return response()->json([
            'data' => $attendance,
            'meta' => ['total' => $attendance->count()],
        ]);
    }
}
