<?php

namespace Modules\Clinic\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Modules\Clinic\Models\PatientQueue;

class QueueController extends Controller
{
    public function today(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('queue.view')) {
            abort(403);
        }

        $request->validate([
            'clinic_id' => ['required', 'uuid', 'exists:clinics,id'],
        ]);

        $queues = PatientQueue::where('clinic_id', $request->clinic_id)
            ->where('queue_date', today()->toDateString())
            ->with([
                'patient:id,first_name,last_name,mrn',
                'registeredBy:id,first_name,last_name',
            ])
            ->orderBy('queue_position')
            ->get();

        return response()->json(['data' => $queues]);
    }

    public function register(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('queue.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'clinic_id' => ['required', 'uuid', 'exists:clinics,id'],
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'priority' => ['nullable', 'in:normal,urgent,vip,elderly,disabled'],
            'queue_date' => ['nullable', 'date'],
        ]);

        $date = $validated['queue_date'] ?? today()->toDateString();

        $tokenData = PatientQueue::generateTokenNumber($validated['clinic_id'], $date);

        $queue = PatientQueue::create([
            'clinic_id' => $validated['clinic_id'],
            'patient_id' => $validated['patient_id'],
            'registered_by' => $authUser->id,
            'queue_date' => $date,
            'queue_position' => $tokenData['position'],
            'token_number' => $tokenData['token'],
            'status' => 'waiting',
            'priority' => $validated['priority'] ?? 'normal',
            'registered_at' => now(),
        ]);

        return response()->json([
            'data' => $queue->load([
                'patient:id,first_name,last_name,mrn',
                'registeredBy:id,first_name,last_name',
            ]),
            'message' => 'Patient registered in queue.',
        ], 201);
    }

    public function call(PatientQueue $queue): JsonResponse
    {
        $authUser = request()->user();
        if (! $authUser->hasPermissionTo('queue.manage')) {
            abort(403);
        }

        $waitMinutes = null;
        if ($queue->registered_at) {
            $waitMinutes = (int) abs(round(now()->diffInMinutes($queue->registered_at)));
        }

        $queue->update([
            'status' => 'called',
            'called_at' => now(),
            'wait_time_minutes' => $waitMinutes,
        ]);

        return response()->json([
            'data' => $queue->fresh(),
            'message' => 'Patient called.',
        ]);
    }

    public function startConsultation(PatientQueue $queue): JsonResponse
    {
        $authUser = request()->user();
        if (! $authUser->hasPermissionTo('queue.manage')) {
            abort(403);
        }

        $queue->update([
            'status' => 'in_consultation',
            'consultation_started_at' => now(),
        ]);

        return response()->json([
            'data' => $queue->fresh(),
            'message' => 'Consultation started.',
        ]);
    }

    public function complete(PatientQueue $queue): JsonResponse
    {
        $authUser = request()->user();
        if (! $authUser->hasPermissionTo('queue.manage')) {
            abort(403);
        }

        $consultationMinutes = null;
        if ($queue->consultation_started_at) {
            $consultationMinutes = (int) abs(round(now()->diffInMinutes($queue->consultation_started_at)));
        }

        $queue->update([
            'status' => 'completed',
            'consultation_ended_at' => now(),
            'consultation_time_minutes' => $consultationMinutes,
        ]);

        return response()->json([
            'data' => $queue->fresh(),
            'message' => 'Consultation completed.',
        ]);
    }

    public function stats(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('queue.view')) {
            abort(403);
        }

        $request->validate([
            'clinic_id' => ['required', 'uuid', 'exists:clinics,id'],
        ]);

        $today = today()->toDateString();

        $counts = PatientQueue::where('clinic_id', $request->clinic_id)
            ->where('queue_date', $today)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $avgWait = PatientQueue::where('clinic_id', $request->clinic_id)
            ->where('queue_date', $today)
            ->whereNotNull('wait_time_minutes')
            ->avg('wait_time_minutes');

        return response()->json([
            'data' => [
                'counts' => $counts,
                'avg_wait_minutes' => $avgWait ? round($avgWait, 1) : null,
                'date' => $today,
            ],
        ]);
    }
}
