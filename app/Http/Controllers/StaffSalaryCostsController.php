<?php

namespace App\Http\Controllers;

use App\Http\Requests\TotalStaffSalary;
use App\Http\Resources\TotalStaffSalariesCostsResource;
use App\Models\StaffSalaryCosts;
use App\Models\TotalStaffSalaryCosts;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class StaffSalaryCostsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $perPage = $request->query('perPage', 25);
        $search = $request->query('search', '');
        
        $query = TotalStaffSalaryCosts::query()
            ->with(['staffSalaryCosts.staffSalary:id,name,position,staff_id,monthly_salary', 'staffSalaryCosts.staffSalary.staff:id,name,email,created_at,updated_at', 'bills'])
            ->filter($search)
            ->orderBy('created_at', 'ASC');

        if ($perPage == -1 || $perPage > 100) {
            $perPage = 100;
        }
        $staffSalariesCosts = TotalStaffSalariesCostsResource::collection($query->paginate($perPage));

        return Inertia::render('bills/total-staff-salaries', [
            'staffSalariesCosts' => $staffSalariesCosts
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(TotalStaffSalary $request): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request) {
                $data = $request->validated();
                $totalStaffSalary = TotalStaffSalaryCosts::create([
                    'bill_id' => $data['bill_id'] ?? null,
                    'notes' => $data['notes'] ?? null
                ]);
        
                $this->processSalaries($totalStaffSalary, $data['salaries'] ?? []);

                $totalStaffSalary->recalculateTotal();
                if ($totalStaffSalary->bills) $totalStaffSalary->bills->recalculateTotal();
            });

            return redirect()->back()->with('success', 'Total staff salary has been added successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to add total salaries. ' . $e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(TotalStaffSalary $request, int $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request, $id) {
                $totalStaffSalary = TotalStaffSalaryCosts::findOrFail($id);
                $data = $request->validated();

                $totalStaffSalary->update([
                    'bill_id' => $data['bill_id'] ?? null,
                    'notes' => $data['notes'] ?? null
                ]);

                $this->syncSalaries($totalStaffSalary, $data['salaries'] ?? []);

                $totalStaffSalary->recalculateTotal();
                if ($totalStaffSalary->bills) $totalStaffSalary->bills->recalculateTotal();
            });

            return redirect()->back()->with('success', 'Total staff salary has been updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update total salaries. ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($id) {
                $totalStaffSalary = TotalStaffSalaryCosts::findOrFail($id);
                $bill = $totalStaffSalary->bills;
                $totalStaffSalary->delete();
                if($bill) $bill->recalculateTotal();
            });

            return redirect()->back()->with('success', 'Total salaries data has been deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete total salaries data. ' . $e->getMessage());
        }
    }

    private function processSalaries(TotalStaffSalaryCosts $totalStaffSalary, array $salaries): void
    {
        foreach ($salaries as $salary) {
            $totalStaffSalary->staffSalaryCosts()->create([
                'staff_salary_id' => $salary['staff_id']
            ]);
        }
    }

    private function syncSalaries(TotalStaffSalaryCosts $totalStaffSalary, array $salaries): void
    {
        if (empty($salaries)) {
            $totalStaffSalary->staffSalaryCosts()->delete();
            return;
        }

        $existingStaffSalaryCostIds = $totalStaffSalary->staffSalaryCosts()->pluck('id')->toArray();
        $incomingStaffSalaryCostIds = [];

        foreach ($salaries as $salary) {
            $staffSalaryCost = $totalStaffSalary->staffSalaryCosts()->updateOrCreate(
                ['id' => $salary['id'] ?? null],
                ['staff_salary_id' => $salary['staff_id']]
            );
            $incomingStaffSalaryCostIds[] = $staffSalaryCost->id;
        }

        $idsToDelete = array_diff($existingStaffSalaryCostIds, $incomingStaffSalaryCostIds);
        if (!empty($idsToDelete)) StaffSalaryCosts::destroy($idsToDelete);
    }
}
