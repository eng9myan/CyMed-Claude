<?php

namespace Modules\Finance\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Finance\Models\AnnualBudget;
use Modules\Finance\Models\CostCenter;

class FinancialPlanningController extends Controller
{
    public function costCenters(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('finance.gl.manage')) {
            abort(403);
        }

        $query = CostCenter::query()->where('is_active', true);

        if ($request->has('facility_id')) {
            $query->where('facility_id', $request->facility_id);
        }

        return response()->json(['data' => $query->orderBy('name')->get()]);
    }

    public function createCostCenter(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('finance.gl.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'code'        => ['required', 'string', 'max:30', 'unique:cost_centers,code'],
            'name'        => ['required', 'string', 'max:255'],
            'type'        => ['sometimes', 'in:department,service_line,overhead'],
            'parent_id'   => ['nullable', 'uuid', 'exists:cost_centers,id'],
        ]);

        $costCenter = CostCenter::create($validated);

        return response()->json([
            'data'    => $costCenter,
            'message' => 'Cost center created.',
        ], 201);
    }

    public function budgets(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('finance.gl.manage')) {
            abort(403);
        }

        $query = AnnualBudget::query()->with('costCenter');

        if ($request->has('cost_center_id')) {
            $query->where('cost_center_id', $request->cost_center_id);
        }

        if ($request->has('fiscal_year')) {
            $query->where('fiscal_year', $request->fiscal_year);
        }

        $budgets = $query->orderByDesc('fiscal_year')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'data' => $budgets->items(),
            'meta' => [
                'total'        => $budgets->total(),
                'per_page'     => $budgets->perPage(),
                'current_page' => $budgets->currentPage(),
                'last_page'    => $budgets->lastPage(),
            ],
        ]);
    }

    public function createBudget(Request $request): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('finance.gl.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'cost_center_id' => ['required', 'uuid', 'exists:cost_centers,id'],
            'fiscal_year'    => ['required', 'string', 'size:4', 'regex:/^\d{4}$/'],
            'budget_amount'  => ['required', 'numeric', 'min:0'],
            'currency'       => ['sometimes', 'string', 'size:3'],
            'notes'          => ['nullable', 'string'],
        ]);

        $budget = AnnualBudget::create($validated);

        return response()->json([
            'data'    => $budget,
            'message' => 'Budget created.',
        ], 201);
    }

    public function updateActualSpend(Request $request, string $budgetId): JsonResponse
    {
        $authUser = $request->user();
        if (! $authUser->hasPermissionTo('finance.gl.manage')) {
            abort(403);
        }

        $budget = AnnualBudget::findOrFail($budgetId);

        $validated = $request->validate([
            'actual_spent' => ['required', 'numeric', 'min:0'],
        ]);

        $budget->update($validated);

        return response()->json([
            'data'    => $budget->fresh(),
            'message' => 'Actual spend updated.',
        ]);
    }
}
