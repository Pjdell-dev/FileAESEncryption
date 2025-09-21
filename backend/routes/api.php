<?php
// routes/api.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FileController;
// Import the AdminController (you'll create this later)
use App\Http\Controllers\AdminController;

// Public routes (accessible without authentication)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (require a valid JWT token via 'auth:api' middleware)
Route::group(['middleware' => 'auth:api'], function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // User/Staff/Admin routes
    Route::post('/upload', [FileController::class, 'upload']);
    Route::get('/my-files', [FileController::class, 'listMyFiles']);
    Route::get('/download/{file}', [FileController::class, 'download']); // Uses route model binding
    Route::get('/search', [FileController::class, 'search']); // Add search route

    // Staff/Admin routes (if you implement sharing)
    // Route::post('/files/{file}/share', [FileController::class, 'share'])->middleware('isStaff');

    // Admin-only routes
    Route::group(['middleware' => 'isAdmin'], function () {
        Route::get('/admin/logs', [AdminController::class, 'listLogs']);
        Route::get('/admin/users', [AdminController::class, 'listUsers']); // Add this route
    });
});