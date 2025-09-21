<?php
// app/Http/Controllers/FileController.php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use App\Models\File;
use App\Models\AuditLog;
use App\Services\EncryptionService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class FileController extends Controller
{
    protected $encryptionService;

    public function __construct(EncryptionService $encryptionService)
    {
        // Inject the EncryptionService via the constructor
        $this->encryptionService = $encryptionService;
    }

    /**
     * Handle the secure upload of a file.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function upload(Request $request)
    {
        \Log::info('Upload request received', [
        'has_file' => $request->hasFile('file'),
        'file_input' => $request->file('file'),
        'all_inputs' => $request->all() // Log all inputs for debugging
    ]);
        // 1. Validate the request
        $request->validate([
            'file' => 'required|file|max:10240', // Max 10MB example. Adjust as needed.
        ]);

        // Get the uploaded file instance
        /** @var \Illuminate\Http\UploadedFile $uploadedFile */
        $uploadedFile = $request->file('file');

        // Get file details
        $originalName = $uploadedFile->getClientOriginalName();
        $mimeType = $uploadedFile->getMimeType();
        $fileSize = $uploadedFile->getSize();

        // --- Security: MIME Type Validation ---
        $allowedMimeTypes = [
            'text/plain',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          
        ];
        if (!in_array($mimeType, $allowedMimeTypes)) {
             Log::warning('File upload blocked due to disallowed MIME type', [
                 'mime_type' => $mimeType,
                 'original_name' => $originalName,
                 'user_id' => Auth::id()
             ]);
             return response()->json(['error' => 'File type not allowed.'], 400);
        }

        // 2. Read the file content
        $fileContent = file_get_contents($uploadedFile->getPathname());

        // 3. Generate Checksum (for integrity)
        $checksum = $this->encryptionService->generateChecksum($fileContent);

        // 4. Encrypt File Content (AES)
        $encryptionResult = $this->encryptionService->encryptFileContent($fileContent);
        $encryptedContent = $encryptionResult['encrypted_content'];
        $aesKey = $encryptionResult['aes_key'];

        // 5. Store Encrypted File
        $storedName = Str::uuid() . '.enc';
        $filePath = 'uploads/' . $storedName;

        Storage::disk('local')->put($filePath, $encryptedContent);

        // 6. Encrypt AES Key with Owner's RSA Public Key
        $user = Auth::user();
        $encryptedAesKey = $this->encryptionService->encryptAesKeyWithRsa($aesKey, $user->rsa_public_key);

        // 7. Save Metadata to Database
        $fileRecord = new File([
            'user_id' => $user->id,
            'original_name' => $originalName,
            'stored_name' => $storedName,
            'mime_type' => $mimeType,
            'size' => $fileSize,
            'file_path' => $filePath,
            'checksum' => $checksum,
            'aes_key_encrypted' => $encryptedAesKey
        ]);
        $fileRecord->save();

        // 8. Log the Action
        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'upload',
            'file_id' => $fileRecord->id,
            'ip_address' => $request->ip(),
            'details' => "Uploaded file: {$originalName} (Size: {$fileSize} bytes)"
        ]);

        // Return a success response
        return response()->json([
            'message' => 'File uploaded successfully',
            'file' => $fileRecord->makeHidden(['aes_key_encrypted'])
        ], 201);
    }

    /**
     * List files owned by the authenticated user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function listMyFiles()
    {
         $user = Auth::user();
         // Use the relationship defined in the User model to get files
         // Select only necessary fields for listing
         $files = $user->files()->select('id', 'original_name', 'mime_type', 'size', 'created_at')->get();
         return response()->json($files);
    }


    /**
     * Handle the secure download of a file.
     *
     * @param  \App\Models\File  $file (Route model binding)
     * @return \Symfony\Component\HttpFoundation\StreamedResponse | \Illuminate\Http\JsonResponse
     */
    public function download(File $file) // $file is automatically resolved by route model binding
    {
         $user = Auth::user();

         // --- Authorization Check ---
         // For now, only the owner can download.
         $isOwner = $file->user_id === $user->id;

    if (!$isOwner) {
    // Check if the file is shared with the current user
    $share = $file->shares()->where('shared_with_user_id', $user->id)->first();
    if (!$share) {
        // Log the failed access attempt
        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'access_denied',
            'file_id' => $file->id,
            'ip_address' => request()->ip(),
            'details' => "User tried to access file they don't own or have no share for: {$file->original_name}"
        ]);
        return response()->json(['error' => 'Permission denied.'], 403);
    }
    // Optionally check $share->permission here for 'view' vs 'edit' if needed later
    // For now, having a share record grants download permission
}
// --- End Authorization Check ---

         // --- Retrieve and Decrypt AES Key ---
         try {
             $decryptedAesKey = $this->encryptionService->decryptAesKeyWithRsa($file->aes_key_encrypted, $user->rsa_private_key);
         } catch (\Exception $e) {
             Log::error('Failed to decrypt AES key for file download', [
                 'file_id' => $file->id, 'user_id' => $user->id, 'error' => $e->getMessage()
             ]);
             return response()->json(['error' => 'Failed to decrypt file key.'], 500);
         }

         // --- Read Encrypted File Content ---
         if (!Storage::disk('local')->exists($file->file_path)) {
             Log::error('File not found on disk during download', [
                 'file_id' => $file->id, 'file_path' => $file->file_path
             ]);
             return response()->json(['error' => 'File not found on disk.'], 404);
         }
         $encryptedContentWithIv = Storage::disk('local')->get($file->file_path);

         // --- Decrypt File Content ---
         try {
             $decryptedContent = $this->encryptionService->decryptFileContent($encryptedContentWithIv, $decryptedAesKey);
         } catch (\Exception $e) {
             Log::error('Failed to decrypt file content', [
                 'file_id' => $file->id, 'user_id' => $user->id, 'error' => $e->getMessage()
             ]);
             return response()->json(['error' => 'Failed to decrypt file content.'], 500);
         }

         // --- Integrity Check ---
         $currentChecksum = $this->encryptionService->generateChecksum($decryptedContent);
         if ($currentChecksum !== $file->checksum) {
             // Log potential tampering
             AuditLog::create([
                 'user_id' => $user->id,
                 'action' => 'integrity_check_failed',
                 'file_id' => $file->id,
                 'ip_address' => request()->ip(),
                 'details' => "Checksum mismatch on download for file: {$file->original_name}"
             ]);
             Log::warning('File integrity check failed on download', [
                 'file_id' => $file->id, 'user_id' => $user->id,
                 'stored_checksum' => $file->checksum, 'calculated_checksum' => $currentChecksum
             ]);
             return response()->json(['error' => 'File integrity check failed. The file may be corrupted or tampered with.'], 400);
         }

         // --- Log the action ---
         AuditLog::create([
             'user_id' => $user->id,
             'action' => 'download',
             'file_id' => $file->id,
             'ip_address' => request()->ip(),
         ]);

         // --- Serve the file ---
         return response()->streamDownload(function () use ($decryptedContent, $file) {
             echo $decryptedContent;
         }, $file->original_name, [
             'Content-Type' => $file->mime_type,
             // Note: strlen might not be accurate for binary data in all cases,
             // but it's often sufficient. Storage::size() could be an alternative if needed.
             'Content-Length' => strlen($decryptedContent),
         ]);
    }
    // Inside FileController class
/**
 * Search for files by name, accessible by the authenticated user.
 *
 * @param  \Illuminate\Http\Request  $request
 * @return \Illuminate\Http\JsonResponse
 */
public function search(Request $request)
{
    $user = Auth::user();
    $queryTerm = $request->input('q');

    if (!$queryTerm) {
        return response()->json(['files' => []]); // Return empty if no query
    }

    // Get user's own files matching the query
    $ownFilesQuery = $user->files()->where('original_name', 'LIKE', "%{$queryTerm}%");

    // Get files shared with the user matching the query
    $sharedFilesQuery = File::whereHas('shares', function ($q) use ($user) {
        $q->where('shared_with_user_id', $user->id);
    })->where('original_name', 'LIKE', "%{$queryTerm}%");

    // Combine queries using union and get results
    // Note: Eager loading relationships in a union can be tricky.
    // Fetching IDs first and then loading models is often safer for complex relationships.
    $ownFileIds = $ownFilesQuery->pluck('id');
    $sharedFileIds = $sharedFilesQuery->pluck('id');
    $allFileIds = $ownFileIds->merge($sharedFileIds)->unique();

    $files = File::whereIn('id', $allFileIds)
                 ->with(['user']) // Eager load owner info if needed in results
                 ->orderBy('created_at', 'desc')
                 ->get(['id', 'user_id', 'original_name', 'mime_type', 'size', 'created_at']); // Select specific fields

    return response()->json(['files' => $files]);
}

}