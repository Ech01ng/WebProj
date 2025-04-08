// This is the contact form
document.addEventListener('DOMContentLoaded', function() {
    // Get the form
    const contactForm = document.querySelector('.contact-form');
    if (!contactForm) {
        console.error('Contact form not found');
        return;
    }
    
    const submitButton = contactForm.querySelector('button[type="submit"]');
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'form-notification';
    // Insert notification after the submit button's parent div
    submitButton.parentElement.after(notification);
    
    // Function to show notification
    function showNotification(message, type) {
        notification.textContent = message;
        notification.className = `form-notification ${type}`;
        // Trigger reflow to ensure animation works
        notification.offsetHeight;
        notification.classList.add('show');
        
        // Hide notification after delay
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // Prevent form from submitting normally
        
        // Disable submit button to prevent double submission
        submitButton.disabled = true;
        
        // Get form data
        const formData = new FormData(this);
        
        try {
            const response = await fetch('PHP/contact.php', {
                method: 'POST',
                body: formData
            });
            
            // Show success message
            showNotification("Message sent successfully!", "success");
            
            // Clear form
            this.reset();
            
        } catch (error) {
            console.error('Error:', error);
            showNotification('An error occurred. Please try again later.', 'error');
        }
        
        // Re-enable submit button
        submitButton.disabled = false;
    });
    
    // Real-time validation
    const emailInput = contactForm.querySelector('input[name="email"]');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const isValid = emailInput.checkValidity();
            emailInput.classList.toggle('is-invalid', !isValid);
        });
    }
    
    const requiredInputs = contactForm.querySelectorAll('input[required], textarea[required]');
    requiredInputs.forEach(input => {
        input.addEventListener('blur', function() {
            const isValid = input.value.trim() !== '';
            input.classList.toggle('is-invalid', !isValid);
        });
    });
}); 