<?php
// Start the session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Include database configuration
require_once 'config.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log file path
$log_file = 'login_debug.log';

// Function to log debug information
function logDebug($message, $data = null) {
    global $log_file;
    $timestamp = date('Y-m-d H:i:s');
    $log_message = "[$timestamp] $message";
    if ($data !== null) {
        $log_message .= ": " . print_r($data, true);
    }
    file_put_contents($log_file, $log_message . "\n", FILE_APPEND);
}

// Function to check login status
function checkLoginStatus() {
    header('Content-Type: application/json');
    
    // Debug information
    $debug = [
        'session_id' => session_id(),
        'session_status' => session_status(),
        'session_data' => $_SESSION,
        'cookies' => $_COOKIE
    ];
    
    $response = [
        'loggedin' => isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true,
        'username' => isset($_SESSION["username"]) ? $_SESSION["username"] : null,
        'debug' => $debug
    ];
    
    echo json_encode($response);
    exit;
}

// Function to handle login
function handleLogin() {
    global $conn;
    
    header('Content-Type: application/json');
    
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        // Validate input exists
        if (!isset($_POST["username"]) || !isset($_POST["password"])) {
            echo json_encode(['success' => false, 'error' => 'Username and password are required']);
            exit;
        }
        
        $username = trim($_POST["username"]);
        $password = $_POST["password"];
        
        if(empty($username) || empty($password)) {
            echo json_encode(['success' => false, 'error' => 'Please enter both username and password']);
            exit;
        }
        
        try {
            // Prepare a select statement
            $sql = "SELECT id, username, password FROM users WHERE username = ?";
            
            if($stmt = mysqli_prepare($conn, $sql)) {
                mysqli_stmt_bind_param($stmt, "s", $username);
                
                if(mysqli_stmt_execute($stmt)) {
                    mysqli_stmt_store_result($stmt);
                    
                    if(mysqli_stmt_num_rows($stmt) == 1) {
                        mysqli_stmt_bind_result($stmt, $id, $username, $hashed_password);
                        if(mysqli_stmt_fetch($stmt)) {
                            if(password_verify($password, $hashed_password)) {
                                // Password is correct, start a new session
                                session_regenerate_id(true);
                                
                                // Store data in session variables
                                $_SESSION["loggedin"] = true;
                                $_SESSION["id"] = $id;
                                $_SESSION["username"] = $username;
                                
                                // Debug information
                                $debug = [
                                    'session_id' => session_id(),
                                    'session_status' => session_status(),
                                    'session_data' => $_SESSION,
                                    'cookies' => $_COOKIE
                                ];
                                
                                echo json_encode([
                                    'success' => true,
                                    'debug' => $debug
                                ]);
                                exit;
                            } else {
                                echo json_encode(['success' => false, 'error' => 'Invalid password']);
                                exit;
                            }
                        }
                    } else {
                        echo json_encode(['success' => false, 'error' => 'Username not found']);
                        exit;
                    }
                } else {
                    throw new Exception(mysqli_error($conn));
                }
                
                mysqli_stmt_close($stmt);
            } else {
                throw new Exception(mysqli_error($conn));
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
            exit;
        }
    }
    
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit;
}

// Function to handle logout
function handleLogout() {
    // Clear all session variables
    $_SESSION = array();
    
    // Destroy the session cookie
    if (isset($_COOKIE[session_name()])) {
        setcookie(session_name(), '', time() - 3600, '/');
    }
    
    // Destroy the session
    session_destroy();
    
    // Send JSON response
    header('Content-Type: application/json');
    echo json_encode(['success' => true]);
    exit;
}

// Determine which action to take based on the request
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch($action) {
    case 'check':
        checkLoginStatus();
        break;
    case 'login':
        handleLogin();
        break;
    case 'logout':
        handleLogout();
        break;
    default:
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
        exit;
}
?> 