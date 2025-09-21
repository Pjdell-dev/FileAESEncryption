<?php
// test_encryption.php
require_once 'vendor/autoload.php'; // Load Composer autoloader

use App\Services\EncryptionService;

try {
    echo "Testing EncryptionService...\n";

    $service = new EncryptionService();

    echo "1. Generating RSA Key Pair...\n";
    $keyPair = $service->generateRsaKeyPair();
    echo "   Public Key Length: " . strlen($keyPair['public_key']) . "\n";
    echo "   Private Key Length: " . strlen($keyPair['private_key']) . "\n";

    echo "2. Encrypting File Content...\n";
    $originalContent = "This is a test file content for encryption.";
    $encryptionResult = $service->encryptFileContent($originalContent);
    echo "   Encrypted Content Length: " . strlen($encryptionResult['encrypted_content']) . "\n";
    echo "   AES Key Length: " . strlen($encryptionResult['aes_key']) . "\n";

    echo "3. Encrypting AES Key with RSA Public Key...\n";
    $encryptedAesKey = $service->encryptAesKeyWithRsa($encryptionResult['aes_key'], $keyPair['public_key']);
    echo "   Encrypted AES Key (Base64): " . substr($encryptedAesKey, 0, 50) . "...\n";

    echo "4. Decrypting AES Key with RSA Private Key...\n";
    $decryptedAesKey = $service->decryptAesKeyWithRsa($encryptedAesKey, $keyPair['private_key']);
    echo "   Decrypted AES Key Length: " . strlen($decryptedAesKey) . "\n";
    echo "   Keys Match: " . (($decryptedAesKey === $encryptionResult['aes_key']) ? "YES" : "NO") . "\n";

    echo "5. Decrypting File Content...\n";
    $decryptedContent = $service->decryptFileContent($encryptionResult['encrypted_content'], $decryptedAesKey);
    echo "   Original Content: $originalContent\n";
    echo "   Decrypted Content: $decryptedContent\n";
    echo "   Content Match: " . (($originalContent === $decryptedContent) ? "YES" : "NO") . "\n";

    echo "6. Generating Checksum...\n";
    $checksum = $service->generateChecksum($originalContent);
    echo "   SHA-256 Checksum: $checksum\n";

    echo "\n--- Test Completed Successfully ---\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
} catch (Error $e) {
    echo "FATAL ERROR: " . $e->getMessage() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
}
