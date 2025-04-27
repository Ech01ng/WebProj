<?php
require_once 'config.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['success' => false, 'message' => 'Method not allowed']));
}

// Get and sanitize form data
$name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
$subject = filter_input(INPUT_POST, 'subject', FILTER_SANITIZE_STRING);
$message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING);

// Validate required fields
if (!$name || !$email || !$subject || !$message) {
    http_response_code(400);
    die(json_encode(['success' => false, 'message' => 'All fields are required']));
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    die(json_encode(['success' => false, 'message' => 'Invalid email format']));
}

try {
    // Prepare and execute the SQL query
    $stmt = $conn->prepare("INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $name, $email, $subject, $message);
    
    if ($stmt->execute()) {
        $stmt->close();
        $conn->close();
        die(json_encode(['success' => true, 'message' => 'Message sent successfully']));
    } else {
        $stmt->close();
        $conn->close();
        throw new Exception('Failed to send message');
    }
} catch (Exception $e) {
    // Close the statement and connection
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
    // Send a 500 error
    http_response_code(500);
    // Send a JSON response
    die(json_encode(['success' => false, 'message' => 'An error occurred while sending your message']));
}
?> 