<?php
// File: /public/check_config.php

// Bootstrap the Laravel application to access its functions
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Http\Kernel::class)->bootstrap();

// --- THE TEST BEGINS ---

header('Content-Type: text/html');
echo "<!DOCTYPE html><html lang='en'><head><title>Config Check</title>";
echo "<style>body { font-family: sans-serif; padding: 2rem; background: #f7f7f7; } pre { background: #eee; padding: 1rem; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word; } .success { color: green; font-weight: bold; } .failure { color: red; font-weight: bold; }</style>";
echo "</head><body>";

echo "<h1>PrepAI Configuration & Path Diagnostic</h1>";

// TEST 1: Get the configured path from Laravel's config
echo "<h2>1. Reading Config Path</h2>";
$configuredPath = config('services.google.credentials_path');
echo "<p>Laravel's configuration system believes the path is:</p>";
echo "<pre>" . htmlspecialchars($configuredPath) . "</pre>";

if (empty($configuredPath)) {
    echo "<p class='failure'>FAILURE: The configuration path is empty. This means your `.env` variable or `config/services.php` file is not set up correctly.</p>";
    die("</body></html>");
}

// TEST 2: Check if a file actually exists at that path
echo "<h2>2. Checking if File Exists</h2>";
if (file_exists($configuredPath)) {
    echo "<p class='success'>SUCCESS: A file was found at the configured path.</p>";
} else {
    echo "<p class='failure'>FAILURE: No file was found at the configured path.</p>";
    echo "<h3>Next Steps:</h3>";
    echo "<ol><li><strong>Verify the path:</strong> Is the path above (`" . htmlspecialchars($configuredPath) . "`) the 100% correct and absolute path to your file?</li>";
    echo "<li><strong>Verify the file location:</strong> Make sure you have moved `gcloud-credentials.json` into the correct directory (`/storage/app/`).</li></ol>";
    die("</body></html>");
}

// TEST 3: If the file exists, check if it is readable by the web server
echo "<h2>3. Checking File Permissions</h2>";
if (is_readable($configuredPath)) {
    echo "<p class='success'>SUCCESS: The file exists AND is readable by the web server.</p>";
    echo "<h3>Conclusion:</h3><p>Your configuration appears to be correct. If the error still happens, it might be an issue inside the Google API library itself, but this is unlikely. Clear your cache (`php artisan config:clear`) and try again.</p>";
} else {
    echo "<p class='failure'>FAILURE: The file exists, but it is NOT readable by the web server. This is a file permissions issue.</p>";
    echo "<h3>Next Steps:</h3>";
    echo "<p>Run the following commands in your Ubuntu terminal from your project root (`~/devyamo/prep-ai`):</p>";
    echo "<pre><code>sudo chown -R www-data:www-data storage\nsudo chmod -R 775 storage</code></pre>";
    echo "<p>This will give the web server ownership and permission to read the file.</p>";
}

echo "</body></html>";

?>