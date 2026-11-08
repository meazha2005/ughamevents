<?php
/**
 * UGHAM Events - Image Upload Backend API
 * Host location: https://ztoitech.com/events/uc/upload.php
 */

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(json_encode(["status" => "ok"]));
}

// Ensure POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "error" => "Method not allowed. Only POST is accepted."
    ]);
    exit;
}

// Base directory for uploads
$baseDir = __DIR__ . '/uploads/';

// Subfolder type: 'events', 'profiles', 'general'
$type = isset($_POST['type']) ? preg_replace('/[^a-zA-Z0-9_-]/', '', $_POST['type']) : 'general';
if (empty($type)) {
    $type = 'general';
}

$targetDir = $baseDir . $type . '/';

// Create directories if they do not exist
if (!is_dir($targetDir)) {
    if (!mkdir($targetDir, 0755, true)) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "error" => "Failed to create target upload directory."
        ]);
        exit;
    }
}

// Find uploaded file from $_FILES ('file' or 'image')
$fileKey = null;
if (isset($_FILES['file']) && $_FILES['file']['error'] !== UPLOAD_ERR_NO_FILE) {
    $fileKey = 'file';
} elseif (isset($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE) {
    $fileKey = 'image';
}

if (!$fileKey) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "No file uploaded. Expected 'file' or 'image' field."
    ]);
    exit;
}

$uploadedFile = $_FILES[$fileKey];

// Check for PHP upload errors
if ($uploadedFile['error'] !== UPLOAD_ERR_OK) {
    $errorMessages = [
        UPLOAD_ERR_INI_SIZE   => "The uploaded file exceeds the upload_max_filesize directive in php.ini.",
        UPLOAD_ERR_FORM_SIZE  => "The uploaded file exceeds the MAX_FILE_SIZE directive in the HTML form.",
        UPLOAD_ERR_PARTIAL    => "The uploaded file was only partially uploaded.",
        UPLOAD_ERR_NO_FILE    => "No file was uploaded.",
        UPLOAD_ERR_NO_TMP_DIR => "Missing a temporary folder.",
        UPLOAD_ERR_CANT_WRITE => "Failed to write file to disk.",
        UPLOAD_ERR_EXTENSION  => "A PHP extension stopped the file upload."
    ];
    $msg = $errorMessages[$uploadedFile['error']] ?? "Unknown upload error code: " . $uploadedFile['error'];
    http_response_code(400);
    echo json_encode(["success" => false, "error" => $msg]);
    exit;
}

// Max 10MB
$maxSize = 10 * 1024 * 1024;
if ($uploadedFile['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "File size exceeds 10MB limit."]);
    exit;
}

// Validate file type
$allowedTypes = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif',
    'image/svg+xml' => 'svg'
];

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($uploadedFile['tmp_name']);

if (!array_key_exists($mimeType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Invalid file type: $mimeType. Allowed types are JPG, PNG, WEBP, GIF, SVG."
    ]);
    exit;
}

$ext = $allowedTypes[$mimeType];
$originalName = pathinfo($uploadedFile['name'], PATHINFO_FILENAME);
$safeOriginalName = preg_replace('/[^a-zA-Z0-9_-]/', '', $originalName);
if (empty($safeOriginalName)) {
    $safeOriginalName = 'img';
}

// Generate unique filename
$uniqueName = $type . '_' . time() . '_' . bin2hex(random_bytes(6)) . '.' . $ext;
$targetFilePath = $targetDir . $uniqueName;

// Move file
if (!move_uploaded_file($uploadedFile['tmp_name'], $targetFilePath)) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Failed to move uploaded file to destination."
    ]);
    exit;
}

// Determine protocol and host
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == 443 ? "https://" : "http://";
$host = $_SERVER['HTTP_HOST'];
$scriptDir = dirname($_SERVER['SCRIPT_NAME']);
if ($scriptDir === '/' || $scriptDir === '\\') {
    $scriptDir = '';
}

$publicUrl = $protocol . $host . $scriptDir . '/uploads/' . $type . '/' . $uniqueName;

// Response
http_response_code(200);
echo json_encode([
    "success" => true,
    "url" => $publicUrl,
    "filename" => $uniqueName,
    "type" => $type,
    "mime" => $mimeType,
    "size" => $uploadedFile['size'],
    "message" => "Image uploaded successfully."
]);
