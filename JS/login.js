// Purpose of this file is to handle the login and logout functionality
// Check URL parameters for login success or error messages
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('register') === 'success') {
        alert('Registration successful! Please log in.');
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
    }
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
    
    // Log the form data
    console.log('Form data being sent:', {
        username: formData.get('username'),
        passwordLength: formData.get('password') ? formData.get('password').length : 0
    });

    // Log the full URL we're sending to
    const loginUrl = 'PHP/login.php?action=login';
    console.log('Sending request to:', window.location.origin + '/' + loginUrl);
    
    fetch(loginUrl, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    })
    .then(response => {
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        return response.text().then(text => {
            try {
                return JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse response as JSON:', text);
                throw new Error('Invalid JSON response from server');
            }
        });
    })
    .then(data => {
        console.log('Login response data:', data);
        if (data.success) {
            // Store login state
            localStorage.setItem('isLoggedIn', 'true');
            // Force check login status before redirect
            checkLoginStatus();
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
    console.log('Checking login status...');
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const logoutLink = document.getElementById('logoutLink');

    if (!loginLink || !registerLink || !logoutLink) {
        console.error('Navigation links not found. Login:', loginLink, 'Register:', registerLink, 'Logout:', logoutLink);
        return;
    }

    fetch('PHP/login.php?action=check', {
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Only show alerts if not on the registration page
        if (window.location.pathname.includes('register.html')) {
            // Just update UI, do not show alerts
            if (data.loggedin) {
                loginLink.style.display = 'none';
                registerLink.style.display = 'none';
                logoutLink.style.display = 'inline-block';
                localStorage.setItem('isLoggedIn', 'true');
            } else {
                loginLink.style.display = 'inline-block';
                registerLink.style.display = 'inline-block';
                logoutLink.style.display = 'none';
                localStorage.removeItem('isLoggedIn');
            }
            return;
        }
        console.log('Login status response:', data);

        if (data.loggedin) {
            console.log('User is logged in as:', data.username);
            loginLink.style.display = 'none';
            registerLink.style.display = 'none';
            logoutLink.style.display = 'inline-block';
            localStorage.setItem('isLoggedIn', 'true');
        } else {
            console.log('User is not logged in');
            loginLink.style.display = 'inline-block';
            registerLink.style.display = 'inline-block';
            logoutLink.style.display = 'none';
            localStorage.removeItem('isLoggedIn');
        }
    })
    .catch(error => {
        console.error('Error checking login status:', error);
        // Don't fallback to localStorage, always check with server
        loginLink.style.display = 'inline-block';
        registerLink.style.display = 'inline-block';
        logoutLink.style.display = 'none';
        localStorage.removeItem('isLoggedIn');
    });
}

// Function to handle logout
function handleLogout(event) {
    if (event) {
        event.preventDefault();
    }
    
    fetch('PHP/login.php?action=logout', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Logout response:', data);
        localStorage.removeItem('isLoggedIn');
        checkLoginStatus(); // Check status after logout
        window.location.href = 'index.html';
    })
    .catch(error => {
        console.error('Error during logout:', error);
        alert('An error occurred during logout.');
    });
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing login functionality');
    
    // Only check URL params on the login page
    if (window.location.pathname.includes('login.html')) {
        checkUrlParams();
    }
    // Check login status immediately
    checkLoginStatus();
    
    // Setup login form if it exists
    const loginForm = document.querySelector('.form-style');
    if (loginForm) {
        console.log('Login form found, adding submit listener');
        loginForm.addEventListener('submit', handleLogin);
    } else {
        console.log('No login form found on this page');
    }
    
    // Setup logout link
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        console.log('Logout link found, adding click listener');
        logoutLink.addEventListener('click', handleLogout);
    }
});

// Check login status periodically
setInterval(checkLoginStatus, 30000); // Check every 30 seconds 