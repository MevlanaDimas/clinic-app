<?php

namespace App\Http\Controllers;

use App\Http\Requests\Marketing;
use App\Http\Resources\MarketingResource;
use App\Models\MarketingCosts;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Inertia\Response;

class MarketingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $perPage = $request->query('perPage', 25);
        $search = $request->query('search', '');
        $query = MarketingCosts::query()->with(['bills:id,bill_number'])->filter($search)->orderBy('created_at', 'ASC');

        if ($perPage === -1 || $perPage > 100) {
            $perPage = 100;
        }
        $marketings = MarketingResource::collection($query->paginate($perPage));

        return Inertia::render('bills/marketing', [
            'marketings' => $marketings
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Marketing $request): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request) {
                $data = $request->validated();
                $marketing = MarketingCosts::create([
                    'bill_id' => $data['bill_id'] ?? null,
                    'name' => $data['name'],
                    'amount' => $data['amount'],
                    'description' => $data['description'] ?? null
                ]);

                $marketing->bills?->recalculateTotal();
            });

            return redirect()->back()->with('success', 'Marketing data has been added successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to add marketing data. ' . $e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Marketing $request, int $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request, $id) {
                $marketing = MarketingCosts::findOrFail($id);
                $data = $request->validated();

                $marketing->update([
                    'bill_id' => $data['bill_id'] ?? null,
                    'name' => $data['name'],
                    'amount' => $data['amount'],
                    'description' => $data['description'] ?? null
                ]);

                $marketing->bills?->recalculateTotal();
            });

            return redirect()->back()->with('success', 'Marketing data has been updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update marketing data. ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($id) {
                $marketing = MarketingCosts::with('bills')->findOrFail($id);
                $bill = $marketing->bills;
                $marketing->delete();
                $bill?->recalculateTotal();
            });

            return redirect()->back()->with('success', 'Marketing data has been deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete marketing data. ' . $e->getMessage());
        }
    }
}
