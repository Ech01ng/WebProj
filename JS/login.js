// Purpose of this file is to handle the login and logout functionality
// Check URL parameters for login success or error messages
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('login') === 'success') {
        alert('Login successful!');
        window.history.replaceState({}, document.title, window.location.pathname);
        checkLoginStatus(); // Check login status immediately after successful login
    } else if (urlParams.get('error') === 'invalid') {
        alert('Invalid username or password!');
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Function to handle login form submission
function handleLogin(event) {
    event.preventDefault();
    console.log('Login form submitted');
    
    const formData = new FormData(event.target);
    console.log('Form data:', {
        username: formData.get('username'),
        password: formData.get('password') ? '[PRESENT]' : '[MISSING]'
    });
    
    fetch('PHP/login.php?action=login', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Login response:', data);
        if (data.success) {
            // Store login state
            localStorage.setItem('isLoggedIn', 'true');
            window.location.href = 'index.html';
        } else {
            alert(data.error || 'Invalid username or password');
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        alert('An error occurred during login. Please check your database connection.');
    });
}

// Function to check login status and update UI
function checkLoginStatus() {
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const logoutLink = document.getElementById('logoutLink');
    
    if (!loginLink || !registerLink || !logoutLink) {
        console.error('Navigation links not found');
        return;
    }

    // Check if user is logged in
    fetch('PHP/login.php?action=check')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.loggedin) {
                loginLink.style.display = 'none';
                registerLink.style.display = 'none';
                logoutLink.style.display = 'block';
                localStorage.setItem('isLoggedIn', 'true');
            } else {
                loginLink.style.display = 'block';
                registerLink.style.display = 'block';
                logoutLink.style.display = 'none';
                localStorage.removeItem('isLoggedIn');
            }
        })
        .catch(error => {
            console.error('Error checking login status:', error);
            // Fallback to localStorage if server check fails
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            loginLink.style.display = isLoggedIn ? 'none' : 'block';
            registerLink.style.display = isLoggedIn ? 'none' : 'block';
            logoutLink.style.display = isLoggedIn ? 'block' : 'none';
        });
}

// Function to handle logout
function handleLogout(event) {
    if (event) {
        event.preventDefault();
    }
    
    fetch('PHP/login.php?action=logout')
        .then(response => {
            window.location.href = 'index.html';
        })
        .catch(error => {
            console.error('Error during logout:', error);
            alert('An error occurred during logout.');
        });
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check login status immediately since navbar is in the HTML
    checkLoginStatus();
    
    // Setup login form if it exists
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Setup logout link
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', handleLogout);
    }
});

// Check login status periodically
setInterval(checkLoginStatus, 60000); // Check every minute 