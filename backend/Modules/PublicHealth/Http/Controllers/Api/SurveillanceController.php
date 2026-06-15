<?php

namespace Modules\PublicHealth\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\PublicHealth\Models\DiseaseNotification;
use Modules\PublicHealth\Models\ReportableDisease;

class SurveillanceController extends Controller
{
    public function reportableList(Request $request): JsonResponse
    {
        $diseases = ReportableDisease::where('is_active', true)->get();

        return response()->json(['data' => $diseases]);
    }

    public function notifications(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('surveillance.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $notifications = DiseaseNotification::where('facility_id', $validated['facility_id'])
            ->orderByDesc('reported_at')
            ->paginate(20);

        return response()->json($notifications);
    }

    public function submitNotification(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('surveillance.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'patient_id'  => ['required', 'uuid', 'exists:patients,id'],
            'disease_id'  => ['required', 'uuid', 'exists:reportable_diseases,id'],
            'onset_date'  => ['nullable', 'date'],
        ]);

        $notification = DiseaseNotification::create(array_merge($validated, [
            'reported_by' => $authUser->id,
            'reported_at' => now(),
            'status'      => 'submitted',
        ]));

        return response()->json(['message' => 'Notification submitted.', 'data' => $notification], 201);
    }

    public function acknowledge(Request $request, DiseaseNotification $diseaseNotification): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('surveillance.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'public_health_ref' => ['nullable', 'string'],
        ]);

        $diseaseNotification->update(array_merge(
            ['status' => 'acknowledged'],
            $validated
        ));

        return response()->json(['message' => 'Notification acknowledged.', 'data' => $diseaseNotification]);
    }

    public function dashboard(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('surveillance.view')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
        ]);

        $counts = DiseaseNotification::where('facility_id', $validated['facility_id'])
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        return response()->json([
            'submitted'    => $counts['submitted'] ?? 0,
            'acknowledged' => $counts['acknowledged'] ?? 0,
            'closed'       => $counts['closed'] ?? 0,
            'total'        => $counts->sum(),
        ]);
    }
}
