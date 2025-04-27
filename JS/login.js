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
    console.log('Hey, someone\'s trying to log in!');
    
    const formData = new FormData(event.target);
    
    // Log the form data
    console.log('Here\'s what they typed:', {
        username: formData.get('username'),
        passwordLength: formData.get('password') ? formData.get('password').length : 0
    });

    // Log the full URL we're sending to
    const loginUrl = 'PHP/login.php?action=login';
    console.log('Sending this info to:', window.location.origin + '/' + loginUrl);
    
    fetch(loginUrl, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    })
    .then(response => {
        console.log('Server says:', response.status);
        console.log('Server headers:', response.headers);
        return response.text().then(text => {
            try {
                return JSON.parse(text);
            } catch (e) {
                console.error('Oops, server sent something weird:', text);
                throw new Error('Server sent back something we can\'t understand');
            }
        });
    })
    .then(data => {
        // Log the server response
        console.log('Server response:', data);
        // Check if the login was successful
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
        // Log the error
        console.error('Something went wrong:', error);
        // Show an alert
        alert('Oops! Can\'t connect to the server right now. Try again later?');
    });
}

// Function to check login status and update UI
function checkLoginStatus() {
    console.log('Let\'s see if you\'re logged in...');
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const logoutLink = document.getElementById('logoutLink');

    if (!loginLink || !registerLink || !logoutLink) {
        console.error('Hmm, can\'t find the navigation buttons. Login:', loginLink, 'Register:', registerLink, 'Logout:', logoutLink);
        return;
    }

    // Fetch the login status from the server
    fetch('PHP/login.php?action=check', {
        credentials: 'include'
    })
    .then(response => {
        // Check if the response is ok
        if (!response.ok) {
            throw new Error('Server\'s not happy right now');
        }
        // Parse the response as JSON
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
        console.log('Server says about your login:', data);

        // Check if the user is logged in
        if (data.loggedin) {
            console.log(`Hey, you're logged in as ${data.username}!`);
            loginLink.style.display = 'none';
            registerLink.style.display = 'none';
            logoutLink.style.display = 'inline-block';
            localStorage.setItem('isLoggedIn', 'true');
        } else {
            console.log('Nope, not logged in yet');
            loginLink.style.display = 'inline-block';
            registerLink.style.display = 'inline-block';
            logoutLink.style.display = 'none';
            localStorage.removeItem('isLoggedIn');
        }
    })
    // Log any errors
    .catch(error => {
        console.error('Trouble checking if you\'re logged in:', error);
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
        console.log('Bye! Server says:', data);
        localStorage.removeItem('isLoggedIn');
        checkLoginStatus(); // Check status after logout
        window.location.href = 'index.html';
    })
    .catch(error => {
        console.error('Trouble logging out:', error);
        alert('Hmm, having trouble logging you out. Try again?');
    });
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, getting ready to handle logins');
    
    // Only check URL params on the login page
    if (window.location.pathname.includes('login.html')) {
        checkUrlParams();
    }
    // Check login status immediately
    checkLoginStatus();
    
    // Setup login form if it exists
    const loginForm = document.querySelector('.form-style');
    if (loginForm) {
        console.log('Found the login form, ready to go!');
        loginForm.addEventListener('submit', handleLogin);
    } else {
        console.log('No login form here, must be on a different page');
    }
    
    // Setup logout link
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        console.log('Found the logout button, all set!');
        logoutLink.addEventListener('click', handleLogout);
    }
});

// Check login status periodically
setInterval(checkLoginStatus, 30000); // Check every 30 seconds 