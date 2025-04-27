// This is the contact form
document.addEventListener('DOMContentLoaded', function() {
    // Get the form
    const contactForm = document.querySelector('.contact-form');
    if (!contactForm) {
        console.error('Hmm, can\'t find the contact form anywhere!');
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
            showNotification("Got it! We'll get back to you soon!", "success");
            
            // Clear form
            this.reset();
            
        } catch (error) {
            console.error('Oops! Something went wrong:', error);
            showNotification('Hmm, having trouble sending your message. Mind trying again?', 'error');
        }
        
        // Re-enable submit button
        submitButton.disabled = false;
    });
    
    // Real-time validation
    const emailInput = contactForm.querySelector('input[name="email"]');
    if (emailInput) {
        // Add an event listener to the input
        emailInput.addEventListener('input', function() {
            // Check if the input is valid
            const isValid = emailInput.checkValidity();
            // Toggle the invalid class
            emailInput.classList.toggle('is-invalid', !isValid);
        });
    }
    
    // Real-time validation
    const requiredInputs = contactForm.querySelectorAll('input[required], textarea[required]');
    requiredInputs.forEach(input => {
        // Add an event listener to the input
        input.addEventListener('blur', function() {
            // Check if the input is valid
            const isValid = input.value.trim() !== '';
            // Toggle the invalid class
            input.classList.toggle('is-invalid', !isValid);
        });
    });
}); 