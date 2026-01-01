<?php

namespace App\Http\Controllers;

use App\Http\Requests\TotalUtilitiesCosts;
use App\Http\Requests\UtilitiesCosts;
use App\Http\Resources\TotalUtilityResource;
use App\Http\Resources\UtilityResource;
use App\Models\TotalUtilityCosts;
use App\Models\UtilityCost;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class UtilityCostsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $perPage = $request->query('perPage', 25);
        $search = $request->query('search', '');
        
        $query = TotalUtilityCosts::query()->with(['utilityCost', 'bills'])
            ->filter($search)
            ->orderBy('created_at', 'ASC');

        if ($perPage === -1 || $perPage > 100) {
            $perPage = 100;
        }
        $utilityCosts = TotalUtilityResource::collection($query->paginate($perPage));

        return Inertia::render('bills/utility-costs', [
            'utilityCosts' => $utilityCosts
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(TotalUtilitiesCosts $request): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request) {
                $data = $request->validated();
                $totalUtilitiesCosts = TotalUtilityCosts::create([
                    'notes' => $data['notes'] ?? null,
                    'bill_id' => $data['bill_id'] ?? null
                ]);

                $this->processUtilityItems($totalUtilitiesCosts, $data['request_items'] ?? []);

                $totalUtilitiesCosts->recalculateTotal();
                if ($totalUtilitiesCosts->bills) $totalUtilitiesCosts->bills->recalculateTotal();
            });

            return redirect()->back()->with('success', 'Total utilties cost data has been added successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to add total utilities cost data. ' . $e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(TotalUtilitiesCosts $request, int $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request, $id) {
                $totalUtilitiesCosts = TotalUtilityCosts::findOrFail($id);
                $data = $request->validated();

                $totalUtilitiesCosts->update([
                    'bill_id' => $data['bill_id'] ?? null,
                    'notes' => $data['notes'] ?? null
                ]);

                $this->syncUtilityItems($totalUtilitiesCosts, $data['request_items'] ?? []);

                $totalUtilitiesCosts->recalculateTotal();
                if ($totalUtilitiesCosts->bills) $totalUtilitiesCosts->bills->recalculateTotal();
            });

            return redirect()->back()->with('success', 'Total utilities cost data has been updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update total utilities cost data. ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($id) {
                $totalUtilitiesCosts = TotalUtilityCosts::findOrFail($id);
                $bill = $totalUtilitiesCosts->bills;
                $totalUtilitiesCosts->delete();
                if ($bill) $bill->recalculateTotal();
            });

            return redirect()->back()->with('success', 'Total utilities cost data has been deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete total utilities cost data. ' . $e->getMessage());
        }
    }

    public function showUtilityCost($id): Response
    {
        $perPage = request()->query('perPage', 25);
        $search = request()->query('search', '');
        $query = UtilityCost::where('total_utility_cost_id', $id)->filter($search);
        $totalUtilities = new TotalUtilityResource(TotalUtilityCosts::with('bills')->findOrFail($id));

        $query->orderBy('created_at', 'ASC');

        if ($perPage === -1 || $perPage > 100) {
            $perPage = 100;
        }
        $utilitiesCosts = UtilityResource::collection($query->paginate($perPage));

        return Inertia::render('bills/utilities', [
            'utilitiesCosts' => $utilitiesCosts,
            'totalUtilities' => $totalUtilities
        ]);
    }

    public function storeUtilityCost(UtilitiesCosts $request, $totalUtiltiesCostsId): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request, $totalUtiltiesCostsId) {
                $totalUtilitiesCost = TotalUtilityCosts::findOrFail($totalUtiltiesCostsId);
                $totalUtilitiesCost->utilityCost()->create([
                    'name' => $request->name,
                    'amount' => $request->amount,
                    'description' => $request->description ?? null
                ]);
                $totalUtilitiesCost->recalculateTotal();
                if ($totalUtilitiesCost->bills) $totalUtilitiesCost->bills->recalculateTotal();
            });

            return redirect()->back()->with('success', 'Utility item has been added successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to add utility item. ' . $e->getMessage());
        }
    }

    public function updateUtilityCost(UtilitiesCosts $request, $totalUtiltiesCostsId, $utilityId): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request, $totalUtiltiesCostsId, $utilityId) {
                $utilityItem = UtilityCost::with('totalUtilityCost.bills')->findOrFail($utilityId);
                $totalUtilitiesCosts = $utilityItem->totalUtilityCost;

                $utilityItem->update([
                    'total_utility_cost_id' => $totalUtiltiesCostsId,
                    'name' => $request->name,
                    'amount' => $request->amount,
                    'description' => $request->description
                ]);
                $totalUtilitiesCosts->recalculateTotal();
                if ($totalUtilitiesCosts->bills) $totalUtilitiesCosts->bills->recalculateTotal();
            });

            return redirect()->back()->with('success', 'Utility item has been updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update utility item. ' . $e->getMessage());
        }
    }

    public function destroyUtilityCost($totalUtiltiesCostsId, $utilityId): RedirectResponse
    {
        try {
            DB::transaction(function () use ($totalUtiltiesCostsId, $utilityId) {
                $utilityItem = UtilityCost::findOrFail($utilityId);
                $utilityItem->delete();
                $totalUtilitiesCosts = TotalUtilityCosts::findOrFail($totalUtiltiesCostsId);
                $totalUtilitiesCosts->recalculateTotal();
                if ($totalUtilitiesCosts->bills) $totalUtilitiesCosts->bills->recalculateTotal();
            });

            return redirect()->back()->with('success', 'Utility item has been deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete utility item. ' . $e->getMessage());
        }
    }

    private function processUtilityItems(TotalUtilityCosts $totalUtilitiesCosts, array $items): void
    {
        foreach ($items as $item) {
            $totalUtilitiesCosts->utilityCost()->create([
                'name' => $item['name'],
                'amount' => $item['amount'],
                'description' => $item['description'] ?? null,
            ]);
        }
    }

    private function syncUtilityItems(TotalUtilityCosts $totalUtilitiesCosts, array $items): void
    {
        if (empty($items)) {
            return;
        }
        $existingItemsId = $totalUtilitiesCosts->utilityCost()->pluck('id')->toArray();
        $incomingUtilityCostId = [];

        foreach ($items as $item) {
            $itemData = [
                'name' => $item['name'],
                'amount' => $item['amount'],
                'description' => $item['description']
            ];
            $ui = $totalUtilitiesCosts->utilityCost()->updateOrCreate(['id' => $item['id'] ?? null], $itemData);
            $incomingUtilityCostId[] = $ui->id;
        }
        UtilityCost::destroy(array_diff($existingItemsId, $incomingUtilityCostId));
    }
}
