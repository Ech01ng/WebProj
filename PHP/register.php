<?php
require_once 'config.php';
header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST["username"]);
    $email = trim($_POST["email"]);
    $password = $_POST["password"];
    $confirm_password = $_POST["confirm_password"];
    
    // Validate input
    $errors = [];
    
    // Check if username exists
    $sql = "SELECT id FROM users WHERE username = ?";
    if($stmt = mysqli_prepare($conn, $sql)) {
        mysqli_stmt_bind_param($stmt, "s", $username);
        if(mysqli_stmt_execute($stmt)) {
            mysqli_stmt_store_result($stmt);
            if(mysqli_stmt_num_rows($stmt) > 0) {
                $errors[] = "This username is already taken.";
            }
        }
        mysqli_stmt_close($stmt);
    }
    
    // Check if email exists
    $sql = "SELECT id FROM users WHERE email = ?";
    if($stmt = mysqli_prepare($conn, $sql)) {
        mysqli_stmt_bind_param($stmt, "s", $email);
        if(mysqli_stmt_execute($stmt)) {
            mysqli_stmt_store_result($stmt);
            if(mysqli_stmt_num_rows($stmt) > 0) {
                $errors[] = "This email is already registered.";
            }
        }
        mysqli_stmt_close($stmt);
    }
    
    // Validate password
    if(strlen($password) < 6) {
        $errors[] = "Password must have at least 6 characters.";
    }
    if($password != $confirm_password) {
        $errors[] = "Passwords do not match.";
    }
    
    // If no errors, proceed with registration
    if(empty($errors)) {
        $sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
        
        if($stmt = mysqli_prepare($conn, $sql)) {
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            mysqli_stmt_bind_param($stmt, "sss", $username, $email, $hashed_password);
            
            if(mysqli_stmt_execute($stmt)) {
                mysqli_stmt_close($stmt);
                mysqli_close($conn);
                echo json_encode([
                    'success' => true,
                    'message' => 'Registration successful',
                    'redirect' => 'login.html'
                ]);
                exit;
            } else {
                $errors[] = "Something went wrong. Please try again later.";
            }
            mysqli_stmt_close($stmt);
        }
    }
    
    // If there are errors, return them as JSON
    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'errors' => $errors
        ]);
        exit;
    }
}

mysqli_close($conn);
?> 