<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use App\Http\Resources\PermissionResource;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Requests\PermissionRequest;

class PermissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $perPage = request()->query('perPage', 25);
        $search = request()->query('search', '');
        $query = Permission::query();

        if($search) {
            $query->where('name', 'LIKE', "%{$search}%");
        }

        $query->orderBy('name', 'ASC');

        if ($perPage == -1 || $perPage > 100) {
            $perPage = 100;
        }
        $permissions = PermissionResource::collection($query->paginate($perPage));

        return Inertia::render('users/permissions', [
            'permissions' => $permissions
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PermissionRequest $request): RedirectResponse
    {
        try{
            DB::transaction(function () use ($request) {
                Permission::create([
                    'name' => $request->name
                ]);
            });
            return redirect()->back()->with('success', 'Permission has been added successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to add permission.' . $e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PermissionRequest $request, string $id): RedirectResponse
    {
        try{
            DB::transaction(function () use ($request, $id) {
                $permission = Permission::findById($id);
                $permission->name = $request->name;
                $permission->save();
            });
            return redirect()->back()->with('success', 'Permission has been updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update permission.' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        try{
            DB::transaction(function () use ($id) {
                Permission::findById($id)->delete();
            });
            return redirect()->back()->with('success', 'Permission has been deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete permission.' . $e->getMessage());
        }
    }

    public function getJson(Request $request): JsonResponse
    {
        $search = $request->query('search', '');
        $query = Permission::query()->select('id', 'name');

        if($search) {
            $query->where('name', 'LIKE', "%{$search}%");
        }

        $query->orderBy('name', 'ASC');

        $permissions = $query->limit(20)->get()->map(function ($permission){
            return [
                'label' => $permission->name,
                'value' => $permission->name
            ];
        });

        return response()->json($permissions);
    }
}
