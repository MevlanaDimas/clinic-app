<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddInventoryRequest;
use App\Http\Requests\UpdateInventoryRequest;
use App\Http\Resources\InventoryResource;
use App\Models\Inventories;
use App\Models\RequestItems;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InventoriesController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = $request->query('perPage', 25);
        $search = $request->query('search', '');
        $query = Inventories::query()->with('supplier')->filter($search)->orderBy('name', 'ASC');

        if ($perPage == -1 || $perPage > 100) {
            $perPage = 100;
        }
        $items = InventoryResource::collection($query->paginate($perPage));

        return Inertia::render('inventories/index', [
            'items' => $items
        ]);
    }

    public function store(AddInventoryRequest $request): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request) {
                $data = $request->validated();
                $requestedItem = RequestItems::with('supplier')->findOrFail($data['request_item_id']);

                if ($requestedItem->purchaseDeliveryStatus && $requestedItem->purchaseDeliveryStatus->status === 'delivered') {
                    throw new \Exception('This item has already been added to inventory.');
                }

                Inventories::create([
                    'name' => $requestedItem->item_name,
                    'supplier_id' => $requestedItem->supplier->id,
                    'type' => $requestedItem->type,
                    'quantity' => $requestedItem->quantity
                ]);
                
                if ($requestedItem->purchaseDeliveryStatus) {
                    $requestedItem->purchaseDeliveryStatus()->update(['status' => 'delivered']);
                }
            });

            return redirect()->back()->with('success', 'Inventory data has been added successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to add inventory data. ' . $e->getMessage());
        }
    }

    public function update(UpdateInventoryRequest $request, int $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request, $id) {
                $itemInInventory = Inventories::findOrFail($id);
                $data = $request->validated();
                $itemInInventory->update([
                    'name' => $data['name'],
                    'supplier_id' => $data['supplier_id'],
                    'type' => $data['type'],
                    'quantity' => $data['quantity']
                ]);
            });

            return redirect()->back()->with('success', 'Inventory data has been updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update inventory data. ' . $e->getMessage());
        }
    }

    public function destroy(int $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($id) {
                Inventories::findOrFail($id)->delete();
            });

            return redirect()->back()->with('success', 'Inventory data has been deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete inventory data. ' . $e->getMessage());
        }
    }

    public function getJson(Request $request): JsonResponse
    {
        $search = $request->query('search', '');
        $query = Inventories::query()
            ->select('id', 'name', 'quantity', 'supplier_id')
            ->where('type', 'medicine')->with('supplier:id,name,contact_person');

        $query->orderBy('name', 'ASC');

        $items = $query->filter($search)->limit(20)->get()->map(function ($item){
            return [
                'label' => $item->name . ' - ' . 'in stock: ' . $item->quantity . ' ( ' . $item->supplier->name . ' - ' . $item->supplier->contact_person . ')',
                'value' => $item->id
            ];
        });

        return response()->json($items);
    }
}
