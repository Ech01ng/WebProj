<?php
require_once 'config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = trim($_POST["name"]);
    $email = trim($_POST["email"]);
    $subject = trim($_POST["subject"]);
    $message = trim($_POST["message"]);
    
    // Create contacts table if it doesn't exist
    $sql = "CREATE TABLE IF NOT EXISTS contacts (
        contact_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    
    if(mysqli_query($conn, $sql)) {
        // Insert the contact message
        $sql = "INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)";
        
        if($stmt = mysqli_prepare($conn, $sql)) {
            mysqli_stmt_bind_param($stmt, "ssss", $name, $email, $subject, $message);
            
            if(mysqli_stmt_execute($stmt)) {
                // Send email notification (you would need to configure your email settings)
                $to = "admin@pharmacyshop.com";
                $email_subject = "New Contact Form Submission: " . $subject;
                $email_body = "Name: $name\n";
                $email_body .= "Email: $email\n";
                $email_body .= "Subject: $subject\n\n";
                $email_body .= "Message:\n$message";
                
                $headers = "From: $email";
                
                mail($to, $email_subject, $email_body, $headers);
                
                // Redirect back to contact page with success message
                header("location: ../contact.html?status=success");
            } else {
                echo "Something went wrong. Please try again later.";
            }
            mysqli_stmt_close($stmt);
        }
    } else {
        echo "Error creating table: " . mysqli_error($conn);
    }
}

mysqli_close($conn);
?> 