<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class FileShare extends Model
{
    use HasFactory;
    protected $fillable = ['file_id', 'shared_by_user_id', 'shared_with_user_id', 'permission'];
    public function file(): BelongsTo
    {
        return $this->belongsTo(File::class);
    }
    public function sharedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'shared_by_user_id');
    }
    public function sharedWith(): BelongsTo
    {
        return $this->belongsTo(User::class, 'shared_with_user_id');
    }
}