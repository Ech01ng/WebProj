// This file is used to validate the register form
// It is used to validate the form before it is submitted
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.form-style');
    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm_password');

    // Add validation message divs after each input
    addValidationMessage(username);
    addValidationMessage(email);
    addValidationMessage(password);
    addValidationMessage(confirmPassword);

    // Real-time validation
    username.addEventListener('input', () => validateUsername(username));
    email.addEventListener('input', () => validateEmail(email));
    password.addEventListener('input', () => {
        validatePassword(password);
        if (confirmPassword.value) {
            validateConfirmPassword(confirmPassword, password);
        }
    });
    confirmPassword.addEventListener('input', () => validateConfirmPassword(confirmPassword, password));

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate all fields
        const isUsernameValid = validateUsername(username);
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);
        const isConfirmPasswordValid = validateConfirmPassword(confirmPassword, password);

        // Check if all fields are valid
        if (isUsernameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid) {
            try {
                // Create a FormData object from the form
                const formData = new FormData(this);
                // Send the form data to the server
                const response = await fetch('PHP/register.php', {
                    method: 'POST',
                    body: formData
                });
                // Get the response
                const data = JSON.parse(await response.text());
                // Log the response
                console.log('Registration response:', data);
                // Check if the registration was successful
                if (data.success) {
                    // Redirect to the login page
                    window.location.href = data.redirect || 'login.html';
                } else if (data.errors) {
                    // Check if the username is already taken
                    if (data.errors.some(e => e.toLowerCase().includes('username'))) {
                        showValidationMessage(username, data.errors.find(e => e.toLowerCase().includes('username')), false);
                    }
                    // Check if the email is already registered
                    if (data.errors.some(e => e.toLowerCase().includes('email'))) {
                        showValidationMessage(email, data.errors.find(e => e.toLowerCase().includes('email')), false);
                    }
                    // Check if the password is not valid
                    if (data.errors.some(e => e.toLowerCase().includes('password'))) {
                        showValidationMessage(password, data.errors.find(e => e.toLowerCase().includes('password')), false);
                    }
                    // Check if the passwords do not match
                    if (data.errors.some(e => e.toLowerCase().includes('match'))) {
                        showValidationMessage(confirmPassword, data.errors.find(e => e.toLowerCase().includes('match')), false);
                    }
                } else {
                    // Show an error message
                    alert('An error occurred. Please try again later.');
                }
            } catch (error) {
                console.error('Error:', error);
                // Show an error message
                alert('An error occurred. Please try again later.');
            }
        }
    });
});

function addValidationMessage(element) {
    if (!element.nextElementSibling?.classList.contains('validation-message')) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'validation-message';
        element.parentNode.insertBefore(messageDiv, element.nextSibling);
    }
}

function showValidationMessage(inputElement, message, isValid = false) {
    const messageDiv = inputElement.nextElementSibling;
    if (messageDiv && messageDiv.classList.contains('validation-message')) {
        messageDiv.textContent = message;
        messageDiv.style.color = isValid ? '#28a745' : '#dc3545';
        inputElement.style.borderColor = isValid ? '#28a745' : '#dc3545';
    }
    return isValid;
}

function validateUsername(username) {
    const value = username.value.trim();
    if (!value) {
        return showValidationMessage(username, 'Username is required', false);
    }
    if (value.length < 3) {
        return showValidationMessage(username, 'Username must be at least 3 characters', false);
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        return showValidationMessage(username, 'Username can only contain letters, numbers and underscores', false);
    }
    return showValidationMessage(username, '', true);
}

function validateEmail(email) {
    const value = email.value.trim();
    if (!value) {
        return showValidationMessage(email, 'Email is required', false);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
        return showValidationMessage(email, 'Please enter a valid email address', false);
    }
    return showValidationMessage(email, '', true);
}

function validatePassword(password) {
    const value = password.value;
    if (!value) {
        return showValidationMessage(password, 'Password is required', false);
    }
    if (value.length < 6) {
        return showValidationMessage(password, 'Password must be at least 6 characters', false);
    }
    return showValidationMessage(password, '', true);
}

function validateConfirmPassword(confirmPassword, password) {
    const value = confirmPassword.value;
    if (!value) {
        return showValidationMessage(confirmPassword, 'Please confirm your password', false);
    }
    if (value !== password.value) {
        return showValidationMessage(confirmPassword, 'Passwords do not match', false);
    }
    return showValidationMessage(confirmPassword, '', true);
} 