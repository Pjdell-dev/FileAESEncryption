<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user = auth()->user();
        
        // Check if user has admin role
        if (!isset($user->role) || $user->role !== 'admin') {
            return response()->json([
                'message' => 'Access denied. Admin privileges required.',
                'your_role' => $user->role ?? 'no role'
            ], 403);
        }

        return $next($request);
    }
}