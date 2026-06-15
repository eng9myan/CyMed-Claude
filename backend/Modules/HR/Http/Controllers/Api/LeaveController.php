<?php

namespace Modules\HR\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\HR\Models\LeaveRequest;

class LeaveController extends Controller
{
    public function index(Request $request, User $user): JsonResponse
    {
        $authUser = $request->user();
        $isSelf = $authUser->id === $user->id;

        if (! $isSelf && ! $authUser->hasAnyPermission(['view-users', 'hr.staff.view', 'manage-users', 'hr.leave.view'])) {
            abort(403);
        }

        $leaves = LeaveRequest::where('user_id', $user->id)
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $leaves]);
    }

    public function store(Request $request, User $user): JsonResponse
    {
        $authUser = $request->user();
        $isSelf = $authUser->id === $user->id;

        if (! $isSelf && ! $authUser->hasAnyPermission(['manage-users', 'hr.staff.manage'])) {
            abort(403);
        }

        $validated = $request->validate([
            'leave_type' => ['required', 'in:annual,sick,emergency,maternity,paternity,unpaid,other'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date'],
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $start = \Carbon\Carbon::parse($validated['start_date']);
        $end = \Carbon\Carbon::parse($validated['end_date']);
        $validated['duration_days'] = $start->diffInDays($end) + 1;
        $validated['user_id'] = $user->id;
        $validated['status'] = 'pending';

        $leave = LeaveRequest::create($validated);

        return response()->json(['data' => $leave, 'message' => 'Leave request submitted.'], 201);
    }

    public function update(Request $request, User $user, string $leave): JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser->hasAnyPermission(['manage-users', 'hr.staff.manage', 'hr.leave.approve'])) {
            abort(403);
        }

        $leaveRequest = LeaveRequest::where('user_id', $user->id)->findOrFail($leave);

        $validated = $request->validate([
            'status' => ['required', 'in:approved,rejected,cancelled'],
            'rejection_reason' => ['required_if:status,rejected', 'nullable', 'string', 'max:500'],
        ]);

        if ($validated['status'] === 'approved' && $leaveRequest->user_id === $authUser->id) {
            return response()->json(['message' => 'Cannot approve your own leave request.'], 422);
        }

        $leaveRequest->update([
            'status' => $validated['status'],
            'rejection_reason' => $validated['rejection_reason'] ?? null,
            'approved_by' => in_array($validated['status'], ['approved', 'rejected']) ? $authUser->id : null,
            'approved_at' => in_array($validated['status'], ['approved', 'rejected']) ? now() : null,
        ]);

        return response()->json(['data' => $leaveRequest->fresh(), 'message' => "Leave request {$validated['status']}."]);
    }

    public function allPending(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasAnyPermission(['manage-users', 'hr.staff.manage', 'hr.leave.approve'])) {
            abort(403);
        }

        $leaves = LeaveRequest::with('user:id,first_name,last_name,employee_id,user_type')
            ->pending()
            ->orderBy('created_at')
            ->get();

        return response()->json(['data' => $leaves]);
    }
}
