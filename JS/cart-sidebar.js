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
        console.error('Cart elements not found');
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
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Cart data:', data); // Debug log
        if (data.success) {
            displayCartSidebar(data);
            updateCartCount(data.count);
        } else {
            console.error('Failed to load cart:', data);
        }
    })
    .catch(error => {
        console.error('Error loading cart:', error);
    });
}

// Display cart items in the sidebar
function displayCartSidebar(data) {
    const cartItems = document.getElementById('cart-sidebar-items');
    const cartTotal = document.getElementById('cart-sidebar-total');
    
    if (!cartItems || !cartTotal) {
        console.error('Cart elements not found');
        return;
    }
    
    cartItems.innerHTML = '';

    // Show empty cart message if no items
    if (!data.items || data.items.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
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
        console.log('Updated cart count:', count); // Debug log
    } else {
        console.error('Cart count element not found');
    }
}

// Add item to cart
function addToCart(productId, quantity = 1) {
    console.log('Adding to cart:', { productId, quantity }); // Debug log
    
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
        console.log('Response status:', response.status); // Debug log
        if (!response.ok) {
            return response.text().then(text => {
                console.error('Error response:', text); // Debug log
                throw new Error('Network response was not ok: ' + text);
            });
        }
        return response.json().catch(error => {
            console.error('JSON parse error:', error); // Debug log
            throw new Error('Invalid JSON response');
        });
    })
    .then(data => {
        console.log('Add to cart response:', data); // Debug log
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
            console.error('Failed to add to cart:', data.error || 'Unknown error');
            alert('Failed to add product to cart: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error adding to cart:', error.message);
        alert('An error occurred while adding to cart: ' + error.message);
    });
} 