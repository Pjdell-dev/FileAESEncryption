<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// Add these use statements
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
class File extends Model
{
    /** @use HasFactory<\Database\Factories\FileFactory> */
    use HasFactory;
    // It's good practice to define fillable attributes
    protected $fillable = [
        'user_id', 'original_name', 'stored_name', 'mime_type',
        'size', 'file_path', 'checksum', 'aes_key_encrypted'
    ];
     /**
     * Get the user that owns the file.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    /**
     * Get the audit logs associated with the file.
     */
    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }
    public function shares(): HasMany
    {
    return $this->hasMany(FileShare::class);
    }
}
