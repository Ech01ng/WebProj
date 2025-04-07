<?php
require_once 'config.php';

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
                // Redirect to login page
                header("location: ../login.html");
            } else {
                echo "Something went wrong. Please try again later.";
            }
            mysqli_stmt_close($stmt);
        }
    } else {
        // Display errors
        foreach($errors as $error) {
            echo $error . "<br>";
        }
    }
}

mysqli_close($conn);
?> 