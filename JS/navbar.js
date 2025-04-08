document.addEventListener('DOMContentLoaded', function() {
    // Load the navbar
    fetch('navbar.html')
        .then(response => response.text())
        .then(data => {
            // Insert the navbar at the start of the body
            document.body.insertAdjacentHTML('afterbegin', data);
            
            // Now that navbar is loaded, initialize login functionality
            checkLoginStatus();
        })
        .catch(error => console.error('Error loading navbar:', error));
}); 