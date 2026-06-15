<?php

namespace Modules\Academic\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Academic\Models\FacultyProfile;
use Modules\Academic\Models\MedicalRotation;

class AcademicController extends Controller
{
    public function facultyProfiles(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('academic.view')) {
            abort(403);
        }

        $query = FacultyProfile::query()->with(['user:id,first_name,last_name,email', 'facility:id,name,code']);

        if ($request->has('facility_id')) {
            $query->where('facility_id', $request->facility_id);
        }

        if ($request->has('rank')) {
            $query->where('academic_rank', $request->rank);
        }

        $profiles = $query->orderByDesc('created_at')->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $profiles->items(),
            'meta' => [
                'total' => $profiles->total(),
                'per_page' => $profiles->perPage(),
                'current_page' => $profiles->currentPage(),
                'last_page' => $profiles->lastPage(),
            ],
        ]);
    }

    public function storeFacultyProfile(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('academic.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'user_id' => ['required', 'uuid', 'exists:users,id', 'unique:faculty_profiles,user_id'],
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'academic_rank' => ['required', 'in:professor,associate_professor,assistant_professor,lecturer,instructor,fellow,resident,intern'],
            'department' => ['nullable', 'string', 'max:100'],
            'specialty' => ['nullable', 'string', 'max:100'],
            'orcid_id' => ['nullable', 'string', 'max:20'],
            'research_interests' => ['nullable', 'array'],
            'publications_count' => ['nullable', 'integer', 'min:0'],
        ]);

        $profile = FacultyProfile::create($validated);

        return response()->json([
            'data' => $profile->load(['user:id,first_name,last_name', 'facility:id,name']),
            'message' => 'Faculty profile created.',
        ], 201);
    }

    public function rotations(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('academic.view')) {
            abort(403);
        }

        $query = MedicalRotation::query()
            ->with([
                'trainee:id,first_name,last_name',
                'supervisor:id,first_name,last_name',
                'facility:id,name',
            ]);

        if ($request->has('trainee_id')) {
            $query->where('trainee_id', $request->trainee_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $rotations = $query->orderByDesc('start_date')->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $rotations->items(),
            'meta' => [
                'total' => $rotations->total(),
                'per_page' => $rotations->perPage(),
                'current_page' => $rotations->currentPage(),
                'last_page' => $rotations->lastPage(),
            ],
        ]);
    }

    public function storeRotation(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('academic.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'trainee_id' => ['required', 'uuid', 'exists:users,id'],
            'supervisor_id' => ['required', 'uuid', 'exists:users,id'],
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'department' => ['required', 'string', 'max:100'],
            'rotation_type' => ['required', 'in:residency,fellowship,internship,elective,observership'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'competencies' => ['nullable', 'array'],
        ]);

        $rotation = MedicalRotation::create(array_merge($validated, ['status' => 'active']));

        return response()->json([
            'data' => $rotation->load([
                'trainee:id,first_name,last_name',
                'supervisor:id,first_name,last_name',
                'facility:id,name',
            ]),
            'message' => 'Rotation created.',
        ], 201);
    }

    public function completeRotation(Request $request, MedicalRotation $rotation): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('academic.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'supervisor_rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'supervisor_comments' => ['nullable', 'string'],
            'competencies' => ['nullable', 'array'],
        ]);

        $rotation->update(array_merge($validated, ['status' => 'completed']));

        return response()->json([
            'data' => $rotation->fresh()->load([
                'trainee:id,first_name,last_name',
                'supervisor:id,first_name,last_name',
            ]),
            'message' => 'Rotation completed.',
        ]);
    }
}
