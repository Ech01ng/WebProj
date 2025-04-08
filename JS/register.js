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

        if (isUsernameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid) {
            try {
                const formData = new FormData(this);
                const response = await fetch('PHP/register.php', {
                    method: 'POST',
                    body: formData
                });

                const text = await response.text();
                
                // Check if response contains any error messages
                if (text.includes('already taken') || text.includes('already registered')) {
                    // Handle server-side validation errors
                    if (text.includes('username is already taken')) {
                        showValidationMessage(username, 'This username is already taken', false);
                    }
                    if (text.includes('email is already registered')) {
                        showValidationMessage(email, 'This email is already registered', false);
                    }
                } else if (text.includes('login.html')) {
                    // Registration successful, redirect to login
                    window.location.href = 'login.html';
                } else {
                    // Handle other errors
                    alert('An error occurred. Please try again later.');
                }
            } catch (error) {
                console.error('Error:', error);
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