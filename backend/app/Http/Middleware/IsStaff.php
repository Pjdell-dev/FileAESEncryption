<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsStaff
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Check if user has staff role/permission
        $user = auth()->user();
        
        // Option 1: If you have a 'role' column - allow both admin and staff
        if (!in_array($user->role, ['admin', 'staff'])) {
            return response()->json(['message' => 'Access denied. Staff privileges required.'], 403);
        }

        // Option 2: If you have an 'is_staff' boolean column
        // if (!$user->is_staff && !$user->is_admin) {
        //     return response()->json(['message' => 'Access denied. Staff privileges required.'], 403);
        // }

        return $next($request);
    }
}