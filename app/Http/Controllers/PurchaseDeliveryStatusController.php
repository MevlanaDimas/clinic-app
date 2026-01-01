<?php

namespace App\Http\Controllers;

use App\Http\Requests\PurchaseDeliveryStatus;
use App\Http\Resources\ItemRequestResource;
use App\Models\PurchaseDeliveryStatus as ModelsPurchaseDeliveryStatus;
use App\Models\RequestItems;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseDeliveryStatusController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $perPage = request()->query('perPage', 25);
        $search = request()->query('search', '');
        $query = RequestItems::query()
            ->with(['purchaseDeliveryStatus', 'supplier:id,name,contact_person,email,phone_number,address', 'purchaseRequest.requester:id,name'])
            ->filter($search);

        $query->orderBy('created_at', 'ASC');

        if ($perPage == -1 || $perPage > 100) {
            $perPage = 100;
        }
        $items = ItemRequestResource::collection($query->paginate($perPage));

        return Inertia::render('inventories/request-items-delivery-status', [
            'items' => $items
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PurchaseDeliveryStatus $request, int $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request, $id) {
                $requestedItem = RequestItems::findOrFail($id);

                $requestedItem->purchaseDeliveryStatus()->updateOrCreate(
                    [
                        'request_item_id' => $id
                    ],
                    [
                        'request_item_id' => $id,
                        'status' => $request->status,
                        'delivery_service' => $request->delivery_service,
                        'tracking_number' => $request->tracking_number,
                        'estimated_delivery_time_in_days' => $request->estimated_delivery_time_in_days,
                        'rejected_reason' => $request->rejected_reason,
                        'returned_reason' => $request->returned_reason
                    ]
                );
            });
            return redirect()->back()->with('success', 'Item request delivery status updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update item request delivery status. ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($id) {
                ModelsPurchaseDeliveryStatus::findOrFail($id)->delete();
            });
            return redirect()->back()->with('success', 'Delivery status record deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete delivery status record. ' . $e->getMessage());
        }
    }
}
