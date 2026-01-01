<?php

namespace App\Http\Controllers;

use App\Http\Requests\SupplierData;
use App\Http\Resources\SupplierResource;
use App\Models\Suppliers;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function index(): Response
    {
        $perPage = request()->query('perPage', 25);
        $search = request()->query('search', '');
        $query = Suppliers::query()->filter($search);

        $query->orderBy('name', 'ASC');

        if ($perPage == -1 || $perPage > 100) {
            $perPage = 100;
        }
        $suppliers = SupplierResource::collection($query->paginate($perPage));

        return Inertia::render('supplier/index', [
            'suppliers' => $suppliers
        ]);
    }

    public function store(SupplierData $request): RedirectResponse
    {
        try{
            DB::transaction(function () use ($request) {
                Suppliers::create([
                    'name' => $request->name,
                    'contact_person' => $request->contact_person,
                    'email' => $request->email,
                    'phone_number' => $request->phone_number,
                    'address' => $request->address
                ]);
            });
            return redirect()->back()->with('success', 'Supplier data has been added successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to add supplier data' . $e->getMessage());
        }
    }

    public function update(SupplierData $request, int $id): RedirectResponse
    {
        try{
            DB::transaction(function () use ($request, $id) {
                $supplier = Suppliers::findOrFail($id);
                
                $supplier->update([
                    'name' => $request->name,
                    'contact_person' => $request->contact_person,
                    'email' => $request->email,
                    'phone_number' => $request->phone_number,
                    'address' => $request->address
                ]);
            });
            return redirect()->back()->with('success', 'Supplier data has been updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update supplier data.' . $e->getMessage());
        }
    }

    public function destroy(int $id): RedirectResponse
    {
        try{
            DB::transaction(function () use ($id) {
                Suppliers::findOrFail($id)->delete();
            });
            return redirect()->back()->with('success', 'Supplier data has been deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete supplier data.' . $e->getMessage());
        }
    }

    public function getJson(Request $request): JsonResponse
    {
        $search = $request->query('search', '');
        $query = Suppliers::query()->select('id', 'name', 'contact_person')->filter($search);

        $query->orderBy('name', 'ASC');

        $supplier = $query->limit(20)->get()->map(function ($supplier){
            return [
                'label' => $supplier->name . ' (' . $supplier->contact_person . ')',
                'value' => $supplier->id
            ];
        });

        return response()->json($supplier);
    }
}
