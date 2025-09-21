<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
           $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // User who performed the action
            $table->string('action'); // e.g., 'login', 'logout', 'upload', 'download', 'delete', 'share'
            // Links to the file involved in the action (nullable for actions like login/logout)
            $table->foreignId('file_id')->nullable()->constrained()->onDelete('set null');
            $table->string('ip_address')->nullable(); // IP address of the user
            $table->text('details')->nullable(); // Optional extra information about the action
            $table->timestamps(); // created_at, updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
