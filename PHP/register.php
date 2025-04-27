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
        // Bind the username to the statement
        mysqli_stmt_bind_param($stmt, "s", $username);
        // Execute the statement
        if(mysqli_stmt_execute($stmt)) {
            // Store the result
            mysqli_stmt_store_result($stmt);
            // Check if the username is already taken
            if(mysqli_stmt_num_rows($stmt) > 0) {
                $errors[] = "This username is already taken.";
            }
        }
        mysqli_stmt_close($stmt);
    }
    
    // Check if email exists
    $sql = "SELECT id FROM users WHERE email = ?";
    if($stmt = mysqli_prepare($conn, $sql)) {
        // Bind the email to the statement
        mysqli_stmt_bind_param($stmt, "s", $email);
        // Execute the statement
        if(mysqli_stmt_execute($stmt)) {
            // Store the result
            mysqli_stmt_store_result($stmt);
            // Check if the email is already registered
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
                // Close the statement
                mysqli_stmt_close($stmt);
                // Close the connection
                mysqli_close($conn);
                // Send a JSON response
                echo json_encode([
                    'success' => true,
                    'message' => 'Registration successful',
                    // Redirect to the login page has a parameter of register=success due to it not being able to redirect to the login without it (I think it has to do with the pop up notification)
                    'redirect' => 'login.html?register=success'
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
            'error' => $errors
        ]);
        exit;
    }
}

mysqli_close($conn);
?> 