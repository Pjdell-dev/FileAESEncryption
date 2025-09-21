<?php
// app/Http/Controllers/AdminController.php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AuditLog;
use App\Models\User;

class AdminController extends Controller
{
    /**
     * List audit logs (Admin only).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function listLogs()
    {
        // Fetch logs, potentially with eager loading for user details
        // Consider pagination for large datasets in production
        $logs = AuditLog::with(['user:id,name,email'])->orderBy('created_at', 'desc')->paginate(20); // Adjust pagination as needed

        return response()->json($logs);
    }

    /**
     * List all users (Admin only).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function listUsers()
    {
        // Fetch users, potentially with pagination
        $users = User::select('id', 'name', 'email', 'role', 'created_at')->paginate(20); // Adjust pagination as needed

        return response()->json($users);
    }
}