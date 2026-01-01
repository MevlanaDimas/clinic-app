<?php

namespace App\Http\Controllers;

use App\Http\Requests\Users;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $perPage = $request->query('perPage', 25);
        $search = $request->query('search', '');
        
        $query = User::query()->with('roles')->filter($search)->orderBy('name', 'ASC');

        if ($perPage == -1 || $perPage > 100) {
            $perPage = 100;
        }
        $users = UserResource::collection($query->paginate($perPage));


        return Inertia::render('users/index', [
            'users' => $users
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Users $request): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request) {
                $data = $request->validated();
                $user = User::create($data);
                $user->syncRoles($data['roles'] ?? []);
            });
            
            return redirect()->back()->with('success', 'User has been added successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to add user.' . $e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Users $request, string $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request, $id) {
                $user = User::findOrFail($id);
                $data = $request->validated();
                $user->update($data);
                $user->syncRoles($data['roles'] ?? []);
            });
            
            return redirect()->back()->with('success', 'User has been updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update user.' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($id) {
                User::findOrFail($id)->delete();
            });
            return redirect()->back()->with('success', 'User has been deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete user.' . $e->getMessage());
        }
    }

    public function getJson(Request $request): JsonResponse
    {
        $search = $request->query('search', '');
        $role = $request->input('role');

        $query = User::query()->select('id', 'name')->filter($search);
        
        $query->when($role, function ($q) use ($role) {
            $q->whereHas('roles', function ($roleQuery) use ($role) {
                $roleQuery->where('name', $role);
            });
        });

        $query->orderBy('name', 'ASC');

        $users = $query->limit(20)->get()->map(function ($user){
            return [
                'label' => $user->name,
                'value' => $user->id
            ];
        });

        return response()->json($users);
    }
}