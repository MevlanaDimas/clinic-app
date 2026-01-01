<?php

namespace App\Http\Controllers;

use App\Http\Requests\MedicalWaste;
use App\Http\Resources\MedicalWasteResource;
use App\Models\MedicalWasteManagementCosts;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Inertia\Response;

class MedicalWasteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $perPage = $request->query('perPage', 25);
        $search = $request->query('search', '');
        $query = MedicalWasteManagementCosts::query()->with('bills:id,bill_number')->filter($search)->orderBy('created_at', 'ASC');

        if ($perPage === -1 || $perPage > 100) {
            $perPage = 100;
        }
        $medicalWastes = MedicalWasteResource::collection($query->paginate($perPage));

        return Inertia::render('bills/medical-waste', [
            'medicalWastes' => $medicalWastes
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(MedicalWaste $request): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request) {
                $data = $request->validated();
                $medicalWaste = MedicalWasteManagementCosts::create([
                    'bill_id' => $data['bill_id'] ?? null,
                    'name' => $data['name'],
                    'amount' => $data['amount'],
                    'description' => $data['description'] ?? null
                ]);

                $medicalWaste->bills?->recalculateTotal();
            });

            return redirect()->back()->with('success', 'Medical waste data has been added successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to add medical waste data. ' . $e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(MedicalWaste $request, int $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request, $id) {
                $medicalWaste = MedicalWasteManagementCosts::findOrFail($id);
                $data = $request->validated();

                $medicalWaste->update([
                    'bill_id' => $data['bill_id'] ?? null,
                    'name' => $data['name'],
                    'amount' => $data['amount'],
                    'description' => $data['description'] ?? null
                ]);

                $medicalWaste->bills?->recalculateTotal();
            });

            return redirect()->back()->with('success', 'Medical waste data has been updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update medical waste data. ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($id) {
                $medicalWaste = MedicalWasteManagementCosts::with('bills')->findOrFail($id);
                $bill = $medicalWaste->bills;
                $medicalWaste->delete();
                $bill?->recalculateTotal();
            });

            return redirect()->back()->with('success', 'Medical waste data has been deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete medical waste data. ' . $e->getMessage());
        }
    }
}
