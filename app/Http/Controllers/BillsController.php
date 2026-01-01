<?php

namespace App\Http\Controllers;

use App\Http\Requests\Bill;
use App\Http\Resources\BillsResource;
use App\Models\Bills;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BillsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $perPage = $request->query('perPage', 25);
        $search = $request->query('search', '');
        $query = Bills::query()->filter($search);

        $query->orderBy('created_at', 'ASC');

        if ($perPage == -1 || $perPage > 100) {
            $perPage = 100;
        }
        $bills = BillsResource::collection($query->paginate($perPage));

        return Inertia::render('bills/index', [
            'bills' => $bills,
        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(): RedirectResponse
    {
        try {
            DB::transaction(function () {
                Bills::create(['notes' => '']);
            });

            return redirect()->back()->with('success', 'Bill has been added successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to add bill. ' . $e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Bill $request, int $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request, $id) {
                $bill = Bills::findOrFail($id);
                $bill->update([
                    'status' => $request->status,
                    'notes' => $request->notes
                ]);
            });

            return redirect()->back()->with('success', 'Bill has been updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update bill. ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($id) {
                Bills::findOrFail($id)->delete();
            });
            return redirect()->back()->with('success', 'Bill has been deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete bill. ' . $e->getMessage());
        }
    }

    public function getJson(Request $request): JsonResponse
    {
        $search = $request->query('search', '');
        $query = Bills::query();

        if($search) {
            $query->where('bill_number', 'LIKE', "%{$search}%");
        }

        if($request->has('statuses')) {
            $query->whereIn('status', (array) $request->input('statuses'));
        }

        $query->orderBy('created_at', 'ASC');

        // Select only necessary columns for performance
        $bills = $query->select('id', 'bill_number', 'updated_at')
            ->limit(20)
            ->get()
            ->map(function ($bill) {
            return [
                'label' => $bill->bill_number . ' - ' . '(' . $bill->updated_at->format('d-M-Y') . ')',
                'value' => $bill->id
            ];
        });

        return response()->json($bills);
    }
}
