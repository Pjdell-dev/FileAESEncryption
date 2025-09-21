<?php
// app/Services/EncryptionService.php

namespace App\Services;

use phpseclib3\Crypt\AES;
use phpseclib3\Crypt\RSA;
use Illuminate\Support\Str;

class EncryptionService
{

    /**
     * Encrypts file content with a random AES key.
     *
     * @param string $fileContent
     * @return array ['encrypted_content' => ..., 'aes_key' => ...]
     */
    public function encryptFileContent(string $fileContent): array
    {
        // Use AES-256 in CTR mode for encryption
        $aes = new AES('ctr');
        // Generate a random 256-bit (32 bytes) key for AES
        $aesKey = random_bytes(32);
        $aes->setKey($aesKey);

        // Generate a random Initialization Vector (IV)
        $iv = random_bytes($aes->getBlockLength() >> 3); // Get IV size in bytes
        $aes->setIV($iv);

        // Encrypt the file content
        $encryptedContent = $aes->encrypt($fileContent);

        // Prepend the IV to the encrypted content so it can be retrieved during decryption
        $finalContent = $iv . $encryptedContent;

        return [
            'encrypted_content' => $finalContent,
            'aes_key' => $aesKey // Return the raw AES key for further processing (e.g., RSA encryption)
        ];
    }

    /**
     * Decrypts file content using the provided AES key.
     *
     * @param string $encryptedContentWithIv (The content with the prepended IV)
     * @param string $aesKey (The raw AES key)
     * @return string
     */
    public function decryptFileContent(string $encryptedContentWithIv, string $aesKey): string
    {
        $aes = new AES('ctr');
        $aes->setKey($aesKey);

        // Determine the IV length based on the cipher
        $ivLength = $aes->getBlockLength() >> 3;
        // Extract the IV from the beginning of the data
        $iv = substr($encryptedContentWithIv, 0, $ivLength);
        // Extract the actual encrypted content
        $encryptedContent = substr($encryptedContentWithIv, $ivLength);

        $aes->setIV($iv);

        // Decrypt and return the original file content
        return $aes->decrypt($encryptedContent);
    }

    /**
     * Generates an RSA key pair.
     *
     * @return array ['private_key' => ..., 'public_key' => ...]
     */
    public function generateRsaKeyPair(): array
    {
        // Generate a 2048-bit RSA key pair
        $rsa = RSA::createKey(2048);
        return [
            // Return the private key in PKCS8 format
            'private_key' => $rsa->toString('PKCS8'),
            // Return the public key in PKCS8 format
            'public_key' => $rsa->getPublicKey()->toString('PKCS8')
        ];
    }

    /**
     * Encrypts an AES key using an RSA public key.
     *
     * @param string $aesKey (The raw AES key)
     * @param string $rsaPublicKey (PEM format)
     * @return string Encrypted AES key (base64 encoded)
     */
    public function encryptAesKeyWithRsa(string $aesKey, string $rsaPublicKey): string
    {
        // Load the provided RSA public key
        $rsa = RSA::loadPublicKey($rsaPublicKey);
        // Encrypt the AES key using the RSA public key
        $encryptedKey = $rsa->encrypt($aesKey);
        // Base64 encode the result for safe storage/transmission
        return base64_encode($encryptedKey);
    }

    /**
     * Decrypts an AES key using an RSA private key.
     *
     * @param string $encryptedAesKey (base64 encoded)
     * @param string $rsaPrivateKey (PEM format)
     * @return string Decrypted AES key
     */
    public function decryptAesKeyWithRsa(string $encryptedAesKey, string $rsaPrivateKey): string
    {
        // Load the provided RSA private key
        $rsa = RSA::loadPrivateKey($rsaPrivateKey);
        // Decode the base64 encoded encrypted key
        $encryptedKey = base64_decode($encryptedAesKey);
        // Decrypt the AES key using the RSA private key
        return $rsa->decrypt($encryptedKey);
    }

    /**
     * Generates a SHA-256 checksum for content.
     *
     * @param string $content
     * @return string
     */
    public function generateChecksum(string $content): string
    {
        // Calculate and return the SHA-256 hash of the content
        return hash('sha256', $content);
    }
}