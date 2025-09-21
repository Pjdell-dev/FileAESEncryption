<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// Add this use statement
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class AuditLog extends Model
{
    /** @use HasFactory<\Database\Factories\AuditLogFactory> */
    use HasFactory;
    // It's good practice to define fillable attributes
    protected $fillable = [
        'user_id', 'action', 'file_id', 'ip_address', 'details'
    ];
     /**
     * Get the user that performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
     /**
     * Get the file associated with the action (if any).
     */
    public function file(): BelongsTo
    {
        return $this->belongsTo(File::class);
    }
}
