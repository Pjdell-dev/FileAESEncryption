<?php
// app/Http/Controllers/AuthController.php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\AuditLog; // Import the AuditLog model
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\JsonResponse; // Optional: for type hinting

class AuthController extends Controller
{
    /**
     * Handle user login.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $credentials = $request->only('email', 'password');

        if (!$token = auth('api')->attempt($credentials)) {
            // Log failed login attempt? (Optional, be careful with PII)
            // AuditLog::create([
            //     'user_id' => null, // Or find user by email if you want to log failed attempts for existing users
            //     'action' => 'login_failed',
            //     'ip_address' => $request->ip(),
            //     'details' => 'Failed login attempt for email: ' . $request->email
            // ]);
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $userId = auth('api')->id(); // Get the user ID
        $ipAddress = $request->ip(); // Get the IP address

        // Log the successful login action
        AuditLog::create([
            'user_id' => $userId,
            'action' => 'login',
            'ip_address' => $ipAddress,
            'details' => 'User logged in successfully'
        ]);

        // The 'if ($token)' check is redundant here because
        // if auth()->attempt failed, we would have returned already.
        // The code below will only execute if $token is valid.
        return response()->json(['token' => $token]);
    }

    /**
     * Handle user registration.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request): JsonResponse
    {
        try {
            // Add password confirmation if desired
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed', // Add 'confirmed' rule
            ]);
        } catch (ValidationException $e) {
            return response()->json(['error' => 'Validation failed', 'messages' => $e->errors()], 422);
        }

        // Create the user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            // 'role' => 'user', // Default role. The User model's booted method should handle RSA key generation.
            // If you want to explicitly set a default role here, you can, but the migration default should cover it.
        ]);

        // Automatically log the user in after registration
        $token = auth()->login($user); // Login the newly created user and get JWT

        // Log the registration and automatic login action
        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'register',
            'ip_address' => $request->ip(),
            'details' => 'User registered and logged in'
        ]);

        return response()->json(['token' => $token], 201);
    }

    /**
     * Handle user logout.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(): JsonResponse
    {
        $userId = auth()->id(); // Get user ID before logging out
        $ipAddress = request()->ip(); // Get IP address

        auth()->logout();

        // Log the logout action
        AuditLog::create([
            'user_id' => $userId,
            'action' => 'logout',
            'ip_address' => $ipAddress,
            'details' => 'User logged out successfully'
        ]);

        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Get the authenticated user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function me(): JsonResponse
    {
        return response()->json(auth()->user());
    }
}