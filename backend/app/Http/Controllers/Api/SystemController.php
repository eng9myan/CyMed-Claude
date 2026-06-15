<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Facility\StoreFacilityRequest;
use App\Http\Resources\DepartmentResource;
use App\Http\Resources\FacilityResource;
use App\Models\HospitalGroup;
use App\Models\User;
use App\Services\Audit\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Models\Department;
use Modules\Core\Models\Facility;

class SystemController extends Controller
{
    public function __construct(protected AuditService $auditService) {}

    public function facilities(Request $request): JsonResponse
    {
        $facilities = Facility::query()
            ->when($request->hospital_group_id, fn ($q, $v) => $q->where('hospital_group_id', $v))
            ->when($request->type, fn ($q, $v) => $q->where('facility_type', $v))
            ->when($request->is_active !== null, fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->when($request->search, fn ($q, $v) => $q->where(fn ($s) => $s
                ->where('name', 'ilike', "%{$v}%")
                ->orWhere('code', 'ilike', "%{$v}%")
            ))
            ->orderBy('name')
            ->paginate($request->integer('per_page', 20));

        return response()->json(['data' => FacilityResource::collection($facilities), 'meta' => [
            'total' => $facilities->total(),
            'per_page' => $facilities->perPage(),
            'current_page' => $facilities->currentPage(),
            'last_page' => $facilities->lastPage(),
        ]]);
    }

    public function storeFacility(StoreFacilityRequest $request): JsonResponse
    {
        $facility = Facility::create($request->validated());
        $this->auditService->logSecurityEvent('facility_created', ['facility_id' => $facility->id, 'code' => $facility->code]);

        return response()->json(['data' => new FacilityResource($facility), 'message' => 'Facility created.'], 201);
    }

    public function updateFacility(StoreFacilityRequest $request, Facility $facility): JsonResponse
    {
        $facility->update($request->validated());
        $this->auditService->logSecurityEvent('facility_updated', ['facility_id' => $facility->id]);

        return response()->json(['data' => new FacilityResource($facility), 'message' => 'Facility updated.']);
    }

    public function departments(Request $request): JsonResponse
    {
        $departments = Department::query()
            ->when($request->facility_id, fn ($q, $v) => $q->where('facility_id', $v))
            ->when($request->type, fn ($q, $v) => $q->where('department_type', $v))
            ->when($request->search, fn ($q, $v) => $q->where('name', 'ilike', "%{$v}%"))
            ->orderBy('name')
            ->paginate($request->integer('per_page', 20));

        return response()->json(['data' => DepartmentResource::collection($departments), 'meta' => [
            'total' => $departments->total(),
            'per_page' => $departments->perPage(),
            'current_page' => $departments->currentPage(),
        ]]);
    }

    public function storeDepartment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'name' => ['required', 'string', 'max:200'],
            'name_ar' => ['nullable', 'string', 'max:200'],
            'code' => ['required', 'string', 'max:30'],
            'department_type' => ['required', 'string', 'max:60'],
            'floor' => ['nullable', 'string', 'max:20'],
        ]);

        $department = Department::create($validated);

        return response()->json(['data' => new DepartmentResource($department), 'message' => 'Department created.'], 201);
    }

    public function updateDepartment(Request $request, Department $department): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:200'],
            'name_ar' => ['nullable', 'string', 'max:200'],
            'floor' => ['nullable', 'string', 'max:20'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $department->update($validated);

        return response()->json(['data' => new DepartmentResource($department), 'message' => 'Department updated.']);
    }

    public function hospitalGroups(Request $request): JsonResponse
    {
        $groups = HospitalGroup::withCount('facilities')
            ->when($request->search, fn ($q, $v) => $q->where('name', 'ilike', "%{$v}%"))
            ->orderBy('name')
            ->paginate($request->integer('per_page', 20));

        return response()->json(['data' => $groups]);
    }

    public function storeHospitalGroup(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:200'],
            'name_ar' => ['nullable', 'string', 'max:200'],
            'code' => ['required', 'string', 'max:30', 'unique:hospital_groups,code'],
            'type' => ['nullable', 'string', 'in:group,network,ministry,private'],
            'country' => ['nullable', 'string', 'size:2'],
            'city' => ['nullable', 'string', 'max:100'],
        ]);

        $group = HospitalGroup::create($validated);

        return response()->json(['data' => $group, 'message' => 'Hospital group created.'], 201);
    }

    public function stats(): JsonResponse
    {
        return response()->json(['data' => [
            'users' => [
                'total' => User::count(),
                'active' => User::where('is_active', true)->count(),
                'by_type' => User::groupBy('user_type')->selectRaw('user_type, count(*) as count')->pluck('count', 'user_type'),
            ],
            'facilities' => [
                'total' => Facility::count(),
                'active' => Facility::where('is_active', true)->count(),
            ],
            'hospital_groups' => HospitalGroup::count(),
            'departments' => Department::count(),
        ]]);
    }
}
