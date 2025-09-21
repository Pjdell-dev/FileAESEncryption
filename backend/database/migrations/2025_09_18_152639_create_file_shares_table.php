<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('file_shares', function (Blueprint $table) {
            $table->id();
            $table->foreignId('file_id')->constrained()->onDelete('cascade');
            $table->foreignId('shared_by_user_id')->constrained('users')->onDelete('cascade'); // User who shared
            $table->foreignId('shared_with_user_id')->constrained('users')->onDelete('cascade'); // User who received share
            $table->string('permission')->default('view'); // e.g., 'view', 'edit'
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('file_shares');
    }
};