<?php

namespace App\Http\Controllers;

use App\Http\Requests\Role as RequestsRole;
use App\Http\Resources\RoleResource;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $perPage = request()->query('perPage', 25);
        $search = request()->query('search', '');
        $query = Role::query()->with('permissions');

        if($search) {
            $query->where('name', 'LIKE', "%{$search}%")->orWhereHas('permissions', function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%");
            });
        }

        $query->orderBy('name', 'ASC');

        if ($perPage == -1 || $perPage > 100) {
            $perPage = 100;
        }
        $roles = RoleResource::collection($query->paginate($perPage));

        return Inertia::render('users/roles', [
            'roles' => $roles
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(RequestsRole $request): RedirectResponse
    {
        try{
            DB::transaction(function () use ($request) {
                $role = Role::create([
                    'name' => $request->name,
                ]);
                $role->syncPermissions($request->permissions);
            });
            return redirect()->back()->with('success', 'Role has been added successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to add role.' . $e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(RequestsRole $request, string $id): RedirectResponse
    {
        try{
            DB::transaction(function () use ($request, $id) {
                $role = Role::findById($id);
                $role->name = $request->name;
                $role->save();
                if ($request->permissions) {
                    $role->syncPermissions($request->permissions);
                }
            });
            return redirect()->back()->with('success', 'Role has been updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update role.' . $e->getMessage()); 
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        try{
            DB::transaction(function () use ($id) {
                Role::findById($id)->delete();
            });
            return redirect()->back()->with('success', 'Role has been deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete role.' . $e->getMessage());
        }
    }

    public function getJson(Request $request): JsonResponse
    {
        $search = $request->query('search', '');
        $query = Role::query()->select('id', 'name');

        if($search) {
            $query->where('name', 'LIKE', "%{$search}%");
        }

        $query->orderBy('name', 'ASC');

        $roles = $query->limit(20)->get()->map(function ($role){
            return [
                'label' => $role->name,
                'value' => $role->id
            ];
        });

        return response()->json($roles);
    }
}
