// Purpose of this file is to handle the cart sidebar functionality
// Initialize cart functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupCartSidebar();
    loadCartSidebar(); // Initial cart load
});

// Setup event listeners for cart sidebar interactions
function setupCartSidebar() {
    const cartIcon = document.getElementById('cart-icon');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-sidebar-overlay');
    const closeBtn = document.getElementById('close-cart-sidebar');

    // Verify all required elements exist
    if (!cartIcon || !cartSidebar || !cartOverlay || !closeBtn) {
        console.error('Hmm, can\'t find the cart buttons and stuff');
        return;
    }

    // Open cart sidebar when cart icon is clicked
    cartIcon.addEventListener('click', () => {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('show');
        loadCartSidebar(); // Refresh cart contents
    });

    // Close cart sidebar when close button or overlay is clicked
    closeBtn.addEventListener('click', closeCartSidebar);
    cartOverlay.addEventListener('click', closeCartSidebar);

    // Close cart sidebar when Escape key is pressed
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCartSidebar();
        }
    });
}

// Close the cart sidebar and overlay
function closeCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-sidebar-overlay');
    
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('show');
    }
}

// Load cart contents from server
function loadCartSidebar() {
    const formData = new FormData();
    formData.append('action', 'get');

    // Fetch cart data from server
    fetch('PHP/cart.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Oops! Can\'t connect to the server right now');
        }
        return response.json();
    })
    .then(data => {
        console.log('Here\'s what\'s in your cart:', data); // Debug log
        if (data.success) {
            displayCartSidebar(data);
            updateCartCount(data.count);
        } else {
            console.error('Hmm, couldn\'t load your cart:', data);
        }
    })
    .catch(error => {
        console.error('Oops! Something went wrong with your cart:', error);
    });
}

// Display cart items in the sidebar
function displayCartSidebar(data) {
    const cartItems = document.getElementById('cart-sidebar-items');
    const cartTotal = document.getElementById('cart-sidebar-total');
    
    if (!cartItems || !cartTotal) {
        console.error('Hmm, can\'t find your cart items');
        return;
    }
    
    cartItems.innerHTML = '';

    // Show empty cart message if no items
    if (!data.items || data.items.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart-message">Your cart is looking a bit empty 🛒</p>';
        cartTotal.textContent = '$0.00';
        return;
    }

    // Create HTML elements for each cart item
    data.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-sidebar-item';
        const price = parseFloat(item.price).toFixed(2);
        const subtotal = parseFloat(item.subtotal).toFixed(2);
        
        // Generate HTML for cart item
        itemElement.innerHTML = `
            <div class="cart-sidebar-item-image">
                <img src="${item.image_url || 'images/placeholder.png'}" alt="${item.name}">
            </div>
            <div class="cart-sidebar-item-details">
                <div class="cart-sidebar-item-title">${item.name}</div>
                <div class="cart-sidebar-item-price">$${price} × ${item.quantity}</div>
                <div class="cart-sidebar-item-total">Total: $${subtotal}</div>
            </div>
        `;
        cartItems.appendChild(itemElement);
    });

    // Update total price with proper formatting
    const total = parseFloat(data.total).toFixed(2);
    cartTotal.textContent = `$${total}`;
}

// Update the cart count badge
function updateCartCount(count = 0) {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = count.toString();
        console.log('Your cart now has', count, 'items'); // Debug log
    } else {
        console.error('Hmm, can\'t find the cart counter');
    }
}

// Add item to cart
function addToCart(productId, quantity = 1) {
    console.log('Adding some goodies to your cart:', { productId, quantity }); // Debug log
    
    // Prepare form data for cart addition
    const formData = new FormData();
    formData.append('action', 'add');
    formData.append('product_id', productId.toString());
    formData.append('quantity', quantity.toString());

    // Send request to add item to cart
    fetch('PHP/cart.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log('Server says:', response.status); // Debug log
        if (!response.ok) {
            return response.text().then(text => {
                console.error('Oops! Server said:', text); // Debug log
                throw new Error('Hmm, server\'s not happy: ' + text);
            });
        }
        return response.json().catch(error => {
            console.error('Hmm, got some weird data:', error); // Debug log
            throw new Error('Oops! Got some weird data back');
        });
    })
    .then(data => {
        console.log('Here\'s what the server said:', data); // Debug log
        if (data.success) {
            // Update cart display and open sidebar
            displayCartSidebar(data);
            updateCartCount(data.count);
            
            const cartSidebar = document.getElementById('cart-sidebar');
            const cartOverlay = document.getElementById('cart-sidebar-overlay');
            if (cartSidebar && cartOverlay) {
                cartSidebar.classList.add('open');
                cartOverlay.classList.add('show');
            }
        } else {
            console.error('Oops! Couldn\'t add that to your cart:', data.error || 'Something went wrong');
            alert('Hmm, couldn\'t add that to your cart: ' + (data.error || 'Something went wrong'));
        }
    })
    .catch(error => {
        console.error('Oops! Something went wrong:', error.message);
        alert('Sorry, having trouble with your cart right now: ' + error.message);
    });
} 