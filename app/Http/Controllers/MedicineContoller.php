<?php

namespace App\Http\Controllers;

use App\Http\Requests\Medicine as RequestsMedicine;
use App\Http\Resources\MedicineResource;
use App\Models\Inventories;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class MedicineContoller extends Controller
{
    public function index(): Response
    {
        $perPage = request()->query('perPage', 25);
        $search = request()->query('search', '');
        $query = Medicine::query()
            ->with(['inventory:id,name,supplier_id,quantity', 'inventory.supplier:id,name'])
            ->filter($search);

        $query->orderBy('expiry_date', 'ASC');

        if ($perPage == -1 || $perPage > 100) {
            $perPage = 100;
        }
        $medicines = MedicineResource::collection($query->paginate($perPage));

        return Inertia::render('medicine/index', [
            'medicines' => $medicines
        ]);
    }

    public function store(RequestsMedicine $request): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request) {
                $itemInInventory = Inventories::findOrFail($request->inventory_id);
                $itemInInventory->medicines()->create([
                    'form' => $request->form,
                    'delivery_systems' => $request->delivery_system,
                    'strength' => $request->strength,
                    'strength_units' => $request->strength_unit,
                    'batch_number' => $request->batch_number,
                    'expiry_date' => $request->expiry_date,
                    'sell_price_per_unit' => $request->sell_price_per_unit
                ]);
            });

            return redirect()->back()->with('success', 'Medicine has been added successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to add medicine. ' . $e->getMessage());
        }
    }
    
    public function update(RequestsMedicine $request, int $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request, $id) {
                $medicine = Medicine::findOrFail($id);
                $itemInInventory = Inventories::findOrFail($request->inventory_id);
                
                $itemInInventory->update(['quantity' => $request->quantity_in_stock]);

                $medicine->update([
                    'inventory_id' => $request->inventory_id,
                    'form' => $request->form,
                    'delivery_systems' => $request->delivery_system,
                    'strength' => $request->strength,
                    'strength_units' => $request->strength_unit,
                    'batch_number' => $request->batch_number,
                    'expiry_date' => $request->expiry_date,
                    'sell_price_per_unit' => $request->sell_price_per_unit
                ]);
            });

            return redirect()->back()->with('success', 'Medicine data has been updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update medicine. ' . $e->getMessage());
        }
    }
    
    public function destroy($id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($id) {
                Medicine::findOrFail($id)->delete();
            });

            return redirect()->back()->with('success', 'Medicine has been deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete medicine. ' . $e->getMessage());
        }
    }

    public function getJson(Request $request): JsonResponse
    {
        $search = $request->query('search', '');
        $query = Medicine::query()
            ->with(['inventory:id,name,supplier_id', 'inventory.supplier:id,name'])
            ->select('id', 'inventory_id', 'strength', 'strength_units', 'sell_price_per_unit');

        // Enforce that we only get medicines that are in stock
        $query->whereHas('inventory', function($q) {
            $q->where('type', 'medicine')
              ->where('quantity', '>', 0);
        });

        if($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('inventory', function ($inventoryQuery) use ($search) {
                    $inventoryQuery->where('name', 'LIKE', "%{$search}%");
                })->orWhereHas('inventory.supplier', function ($supplierQuery) use ($search) {
                    $supplierQuery->where('name', 'LIKE', "%{$search}%")
                                  ->orWhere('contact_person', 'LIKE', "%{$search}%");
                })->orWhere('form', 'LIKE', "%{$search}%")
                  ->orWhere('delivery_systems', 'LIKE', "%{$search}")
                  ->orWhere('strength', 'LIKE', "%{$search}%")
                  ->orWhere('strength_units', 'LIKE', "%{$search}%")
                  ->orWhere('batch_number', 'LIKE', "%{$search}%")
                  ->orWhere('expiry_date', 'LIKE', "%{$search}%")
                  ->orWhere('sell_price_per_unit', 'LIKE', "%{$search}%");
            });
        }

        $query->orderBy('expiry_date', 'DESC');

        $medicines = $query->limit(20)
            ->get()
            ->map(function ($medicine){
            return [
                'label' => $medicine->inventory->name . ' - ' . $medicine->strength . $medicine->strength_units . ' (' . $medicine->inventory->supplier->name . ')',
                'value' => $medicine->id
            ];
        });

        return response()->json($medicines);
    }
}
