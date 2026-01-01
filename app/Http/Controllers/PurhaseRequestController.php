<?php

namespace App\Http\Controllers;

use App\Http\Requests\PurchaseRequest;
use App\Http\Requests\PurchaseRequestStatus;
use App\Http\Requests\RequestItem;
use App\Http\Resources\ItemRequestResource;
use App\Http\Resources\PurchaseRequestResource;
use App\Models\PurchaseDeliveryStatus;
use App\Models\PurchaseRequests;
use App\Models\RequestItems;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class PurhaseRequestController extends Controller
{
    public function index(): Response
    {
        $perPage = request()->query('perPage', 25);
        $search = request()->query('search', '');
        $query = PurchaseRequests::query()
            ->with(['requester', 'items', 'items.supplier', 'bill'])
            ->filter($search);

        $query->orderBy('created_at', 'ASC');

        if ($perPage == -1 || $perPage > 100) {
            $perPage = 100;
        }
        $purchaseRequests = PurchaseRequestResource::collection($query->paginate($perPage));

        return Inertia::render('inventories/purchase-request', [
            'purchase_requests' => $purchaseRequests
        ]);
    }

    public function store(PurchaseRequest $request): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request) {
                $data = $request->validated();
                $requester = User::findOrFail($data['user_id']);

                $purchaseRequest = PurchaseRequests::create([
                    'user_id' => $data['user_id'],
                    'purchase_request_id' => 'TEMP-' . uniqid(),
                    'required_by_date' => $data['required_by_date'],
                    'notes' => $data['notes'] ?? null,
                    'bill_id' => $data['bill_id'] ?? null
                ]);

                $purchaseRequest->update([
                    'purchase_request_id' => PurchaseRequests::generatePurchaseRequestId($requester->name, $purchaseRequest->id)
                ]);
                
                if(!empty($data['request_items'])) {
                    $this->processRequestItems($purchaseRequest, $data['request_items'], $data['user_id']);
                }

                $this->updateTotals($purchaseRequest);
            });

            return redirect()->back()->with('success', 'Purchase request has been added successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to add purchase request. ' . $e->getMessage());
        }
    }

    public function update(PurchaseRequest $request, $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request, $id) {
                $purchaseRequest = PurchaseRequests::findOrFail($id);
                $data = $request->validated();

                $purchaseRequest->update([
                    'user_id' => $data['user_id'],
                    'required_by_date' => $data['required_by_date'],
                    'bill_id' => $data['bill_id'] ?? null,
                    'notes' => $data['notes'] ?? null
                ]);

                if (!empty($data['request_items'])) {
                    $this->processRequestItems($purchaseRequest, $data['request_items'], $data['user_id'], true);
                }

                $this->updateTotals($purchaseRequest);
            });

            return redirect()->back()->with('success', 'Purchase request has been updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update purchase request. ' . $e->getMessage());
        }
    }

    public function status(PurchaseRequestStatus $request, $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request, $id) {
                PurchaseRequests::findOrFail($id)->update(['status' => $request->status]);
            });

            return redirect()->back()->with('success', 'Purchase request status has been updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update purchase request status. ' . $e->getMessage());
        }
    }

    public function destroy($id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($id) {
                $purchaseRequest = PurchaseRequests::findOrFail($id);
                $bill = $purchaseRequest->bill;
                $purchaseRequest->delete();
                if($bill) $bill->recalculateTotal();
            });

            return redirect()->back()->with('success', 'Purchase reqeust data has been deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete purchase request data. ' . $e->getMessage());
        }
    }

    public function showRequestItem($id): Response
    {
        $perPage = request()->query('perPage', 25);
        $search = request()->query('search', '');
        $query = RequestItems::where('purchase_request_id', $id)->with(['supplier']);
        $purchaseRequest = new PurchaseRequestResource(PurchaseRequests::with('requester')->findOrFail($id));

        $query->filter($search);

        $query->orderBy('created_at', 'ASC');

        if ($perPage === -1) {
            $requestItems = ItemRequestResource::collection($query->get());
        } else {
            $requestItems = ItemRequestResource::collection($query->paginate($perPage));
        }

        return Inertia::render('inventories/request-items', [
            'requestItems' => $requestItems,
            'purchaseRequest' => $purchaseRequest
        ]);
    }

    public function storeRequestItem(RequestItem $request, $purchaseRequestId): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request, $purchaseRequestId) {
                $purchaseRequest = PurchaseRequests::with('bill')->findOrFail($purchaseRequestId);

                $requestedItem = $purchaseRequest->items()->create([
                    'request_number' => 'TEMP-' . uniqid(),
                    'item_name' => $request->item_name,
                    'supplier_id' => $request->supplier_id,
                    'type' => $request->type,
                    'reason' => $request->reason,
                    'quantity' => $request->quantity,
                    'price_per_unit' => $request->price_per_unit
                ]);

                $requestedItem->update([
                    'request_number' => RequestItems::generateRequestNumber((int)$purchaseRequest->id, (int)$request->supplier_id, $request->item_name, $requestedItem->id)
                ]);

                $requestedItem->purchaseDeliveryStatus()->create(['status' => 'pending']);
                $this->updateTotals($purchaseRequest);
            });

            return redirect()->back()->with('success', 'Item request has been added successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to add item request. ' . $e->getMessage());
        }
    }

    public function updateRequestItem(RequestItem $request, $id, $requestItemId): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request, $id, $requestItemId) {
                $requestedItem = RequestItems::with('purchaseRequest.bill')->findOrFail($requestItemId);
                $purchaseRequest = $requestedItem->purchaseRequest;

                $requestedItem->update([
                    'purchase_request_id' => $id,
                    'item_name' => $request->item_name,
                    'supplier_id' => $request->supplier_id,
                    'type' => $request->type,
                    'reason' => $request->reason,
                    'quantity' => $request->quantity,
                    'price_per_unit' => $request->price_per_unit
                ]);

                $this->updateTotals($purchaseRequest);
            });
            return redirect()->back()->with('success', 'Item request has been updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update item request. ' . $e->getMessage());
        }
    }

    public function destroyRequestItem($purchaseRequestId, $requestedItemId): RedirectResponse
    {
        try {
            DB::transaction(function () use ($purchaseRequestId, $requestedItemId) {
                $requestedItem = RequestItems::findOrFail($requestedItemId);
                $requestedItem->delete();
                $purchaseRequest = PurchaseRequests::findOrFail($purchaseRequestId);
                $this->updateTotals($purchaseRequest);
            });

            return redirect()->back()->with('success', 'Item request has been deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete item request. ' . $e->getMessage());
        }
    }

    public function getJsonRequestItem(Request $request): JsonResponse
    {
        $search = $request->query('search', '');
        $query = PurchaseDeliveryStatus::query()
            ->where('status', 'delivered')
            ->with(['requestItem:id,item_name,supplier_id', 'requestItem.supplier:id,name,contact_person'])
            ->select('id', 'request_item_id');

        $query->when($search, function ($q) use ($search) {
            $q->where(function ($subQ) use ($search) {
                $subQ->whereHas('requestItem', function ($requestItemQuery) use ($search) {
                    $requestItemQuery->where('request_number', 'LIKE', "%{$search}%")
                                     ->orWhere('item_name', 'LIKE', "%{$search}%")
                                     ->orWhere('type', 'LIKE', "%{$search}%")
                                     ->orWhere('reason', 'LIKE', "%{$search}%")
                                     ->orWhere('quantity', 'LIKE', "%{$search}%")
                                     ->orWhere('price_per_unit', 'LIKE', "%{$search}%")
                                     ->orWhere('total_price', 'LIKE', "%{$search}%");
                })->orWhereHas('requestItem.supplier', function ($supplierQuery) use ($search) {
                    $supplierQuery->where('name', 'LIKE', "%{$search}%")
                                  ->orWhere('contact_person', 'LIKE', "%{$search}%")
                                  ->orWhere('email', 'LIKE', "%{$search}%")
                                  ->orWhere('phone_number', 'LIKE', "%{$search}%")
                                  ->orWhere('address', 'LIKE', "%{$search}%");
                });
            });
        });

        $query->orderBy('created_at', 'ASC');

        $items = $query->limit(20)->get()->map(function ($deliveryStatus){
            return [
                'label' => $deliveryStatus->requestItem->item_name . ' - (' . $deliveryStatus->requestItem->supplier->name . ' - ' . $deliveryStatus->requestItem->supplier->contact_person . ')',
                'value' => $deliveryStatus->requestItem->id
            ];
        });

        return response()->json($items);
    }

    private function processRequestItems(PurchaseRequests $purchaseRequest, array $items, int $userId, bool $isUpdate = false): void
    {
        $incomingIds = [];

        foreach ($items as $item) {
            $data = [
                'item_name' => $item['item_name'],
                'supplier_id' => $item['supplier_id'],
                'type' => $item['type'],
                'reason' => $item['reason'],
                'quantity' => $item['quantity'],
                'price_per_unit' => $item['price_per_unit']
            ];

            if (empty($item['id'])) {
                $data['request_number'] = 'TEMP-' . uniqid();
            }

            $requestItem = $purchaseRequest->items()->updateOrCreate(['id' => $item['id'] ?? null], $data);
            $incomingIds[] = $requestItem->id;

            if ($requestItem->wasRecentlyCreated) {
                $requestItem->update(['request_number' => RequestItems::generateRequestNumber($userId, (int)$item['supplier_id'], $item['item_name'], $requestItem->id)]);
                $requestItem->purchaseDeliveryStatus()->create(['status' => 'pending']);
            }
        }

        if ($isUpdate) {
            $purchaseRequest->items()->whereNotIn('id', $incomingIds)->delete();
        }
    }

    private function updateTotals(PurchaseRequests $purchaseRequest): void
    {
        $purchaseRequest->recalculateTotal();
        if ($purchaseRequest->bill) {
            $purchaseRequest->bill->recalculateTotal();
        }
    }
}
