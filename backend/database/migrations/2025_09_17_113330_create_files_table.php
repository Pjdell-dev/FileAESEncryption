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
        Schema::create('files', function (Blueprint $table) {
           $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Links to the user who owns the file
            $table->string('original_name'); // Original filename when uploaded
            $table->string('stored_name'); // Unique filename used for storage (e.g., UUID)
            $table->string('mime_type'); // MIME type (e.g., application/pdf)
            $table->bigInteger('size'); // File size in bytes
            $table->string('file_path'); // Path to the encrypted file on disk
            $table->string('checksum'); // SHA-256 hash for integrity verification
            // Stores the AES key for this file, encrypted with the owner's RSA public key
            $table->text('aes_key_encrypted');
            $table->timestamps(); // created_at, updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};
