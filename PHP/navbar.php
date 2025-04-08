<?php
session_start();
?>
<!-- This is -->
<header>
    <nav class="container">
        <div class="logo">
            <h1>Nebris Pharmacy</h1>
        </div>
        <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="products.html">Products</a></li>
            <?php if(isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true): ?>
                <li><a href="PHP/logout.php">Logout</a></li>
            <?php else: ?>
                <li><a href="login.html">Login</a></li>
                <li><a href="register.html">Register</a></li>
            <?php endif; ?>
        </ul>
    </nav>
</header> 