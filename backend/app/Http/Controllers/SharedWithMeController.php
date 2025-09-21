// app/Http/Controllers/SharedWithMeController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\File; // Ensure you have a File model

class SharedWithMeController extends Controller
{
    public function index(Request $request)
    {
        // Get the authenticated user
        $user = $request->user();

        // Query the database for files where the current user's ID is in the 'shared_with' relationship
        // This assumes you have a 'file_shares' table linking users to files
        $files = $user->sharedFiles()->with('owner')->get();

        return response()->json($files);
    }
}