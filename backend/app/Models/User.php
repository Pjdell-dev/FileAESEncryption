<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
// Remove or comment out HasApiTokens if you are using JWT instead of Sanctum
// use Laravel\Sanctum\HasApiTokens;
// Add the JWTSubject interface
use Tymon\JWTAuth\Contracts\JWTSubject;
// Import the EncryptionService
// use App\Services\EncryptionService; // Don't import here, instantiate inside the method
// Import HasMany relationship
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

// Implement JWTSubject interface
class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    // Remove HasApiTokens if using JWT
    // use HasApiTokens, HasFactory, Notifiable;
    use HasFactory, Notifiable; // Make sure this line is clean

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        // Add 'role' to fillable attributes
        'role',
        // Add RSA key fields to fillable for storage
        'rsa_public_key',
        'rsa_private_key',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        // IMPORTANT: Hide the private key from API responses!
        'rsa_private_key',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            // Optional: Cast keys for encryption at rest (requires APP_KEY to be set)
            // 'rsa_public_key' => 'encrypted',
            // 'rsa_private_key' => 'encrypted',
        ];
    }

    // Add the methods required by the JWTSubject interface

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    /**
     * Eloquent Events: Generate RSA keys before the user is created.
     * This automatically runs when User::create() is called.
     */
    protected static function booted()
    {
        static::creating(function (User $user) {
            // Import the EncryptionService inside the closure to avoid potential issues
            // Create an instance of the EncryptionService
            $encryptionService = new \App\Services\EncryptionService(); // Use full namespace
            // Generate the RSA key pair
            $keyPair = $encryptionService->generateRsaKeyPair();

            // Assign the generated keys to the user model instance
            // These will be saved to the database when the user is created
            $user->rsa_public_key = $keyPair['public_key'];
            $user->rsa_private_key = $keyPair['private_key']; // Store securely!

            // Note: Storing the private key directly like this is not ideal for production.
            // In a real application, you'd want to encrypt it with a master key or use HSMs.
            // For this project, storing it here (and hiding it in $hidden) is acceptable
            // as it demonstrates the concept of key ownership per user.
        });
    }

    // Relationships

    /**
     * Get the files owned by the user.
     */
    public function files(): HasMany
    {
        return $this->hasMany(File::class);
    }
    public function sharedFiles(): BelongsToMany
    {
    // Gets files shared *with* this user
    return $this->belongsToMany(File::class, 'file_shares', 'shared_with_user_id', 'file_id')
                ->withPivot(['permission', 'shared_by_user_id']) // Include share details
                ->withTimestamps();
    }

    public function fileSharesGiven(): HasMany
    {
    // Gets FileShare records *created by* this user
    return $this->hasMany(FileShare::class, 'shared_by_user_id');
    }

    /**
     * Get the audit logs created by the user.
     */
    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }
}