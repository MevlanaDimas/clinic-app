<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function dashboard(): Response
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user->loadMissing('salary');
        $userPosition  = $user->salary?->position;

        return Inertia::render('dashboard', [
            'position' => $userPosition
        ]);
    }
}
