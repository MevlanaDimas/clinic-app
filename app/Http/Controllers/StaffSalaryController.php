<?php

namespace App\Http\Controllers;

use App\Http\Requests\StaffSalary as RequestsStaffSalary;
use App\Http\Resources\StaffSalariesResource;
use App\Models\StaffSalary;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StaffSalaryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $perPage = $request->query('perPage', 25);
        $search = $request->query('search', '');
        $query = StaffSalary::query()->with(['staff', 'staff.roles'])->filter($search)->orderBy('created_at', 'ASC');

        if ($perPage == -1 || $perPage > 100) {
            $perPage = 100;
        }
        $staffSalaries = StaffSalariesResource::collection($query->paginate($perPage));

        return Inertia::render('users/staff-salaries', [
            'staffSalaries' => $staffSalaries
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(RequestsStaffSalary $request): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request) {
                $data = $request->validated();
                StaffSalary::create([
                    'name' => $data['name'],
                    'position' => $data['position'],
                    'staff_id' => $data['user_id'] ?? null,
                    'monthly_salary' => $data['monthly_salary']
                ]);
            });

            return redirect()->back()->with('success', 'Staff salary record created successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'An error occurred while creating the staff salary record: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(RequestsStaffSalary $request, int $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request, $id) {
                $staffSalary = StaffSalary::findOrFail($id);
                $data = $request->validated();

                $staffSalary->update([
                    'name' => $data['name'],
                    'position' => $data['position'],
                    'staff_id' => $data['user_id'] ?? null,
                    'monthly_salary' => $data['monthly_salary']
                ]);
            });

            return redirect()->back()->with('success', 'staff salary record updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'An error occurred while updating the staff salary record: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($id) {
                StaffSalary::findOrFail($id)->delete();
            });
            return redirect()->back()->with('success', 'Staff salary record deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'An error occurred while deleting the staff salary record: ' . $e->getMessage());
        }
    }

    public function getJson(Request $request): JsonResponse
    {
        $search = $request->query('search', '');
        $query = StaffSalary::query()->select('id', 'name', 'position')->filter($search);

        $query->orderBy('name', 'ASC');

        $salaries = $query->limit(20)->get()->map(function ($salary){
            return [
                'label' => $salary->name . ' (' . $salary->position . ')',
                'value' => $salary->id
            ];
        });

        return response()->json($salaries);
    }
}
