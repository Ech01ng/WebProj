// Load cart sidebar HTML
document.addEventListener('DOMContentLoaded', () => {
    setupCartSidebar();
    loadCartSidebar(); // Load cart contents immediately
});

// Setup cart sidebar functionality
function setupCartSidebar() {
    const cartIcon = document.getElementById('cart-icon');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-sidebar-overlay');
    const closeBtn = document.getElementById('close-cart-sidebar');

    if (!cartIcon || !cartSidebar || !cartOverlay || !closeBtn) {
        console.error('Cart elements not found');
        return;
    }

    // Open cart sidebar
    cartIcon.addEventListener('click', () => {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('show');
        loadCartSidebar(); // Refresh cart contents when opened
    });

    // Close cart sidebar
    closeBtn.addEventListener('click', closeCartSidebar);
    cartOverlay.addEventListener('click', closeCartSidebar);

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCartSidebar();
        }
    });
}

// Close cart sidebar
function closeCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-sidebar-overlay');
    
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('show');
    }
}

// Load cart sidebar contents
function loadCartSidebar() {
    const formData = new FormData();
    formData.append('action', 'get');

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

// Display cart items in sidebar
function displayCartSidebar(data) {
    const cartItems = document.getElementById('cart-sidebar-items');
    const cartTotal = document.getElementById('cart-sidebar-total');
    
    if (!cartItems || !cartTotal) {
        console.error('Cart elements not found');
        return;
    }
    
    cartItems.innerHTML = '';

    if (!data.items || data.items.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
        cartTotal.textContent = '$0.00';
        return;
    }

    // Helper function to format price
    const formatPrice = (price) => {
        const num = parseFloat(price);
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    data.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-sidebar-item';
        itemElement.innerHTML = `
            <img src="${item.image_url || 'images/placeholder.png'}" alt="${item.name}" class="cart-sidebar-item-image">
            <div class="cart-sidebar-item-details">
                <div class="cart-sidebar-item-title">${item.name}</div>
                <div class="cart-sidebar-item-price">$${formatPrice(item.price)} × ${item.quantity}</div>
                <div class="cart-sidebar-item-total">Total: $${formatPrice(item.subtotal)}</div>
            </div>
        `;
        cartItems.appendChild(itemElement);
    });

    cartTotal.textContent = `$${formatPrice(data.total)}`;
}

// Update cart count badge
function updateCartCount(count = 0) {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = count.toString();
        console.log('Updated cart count:', count); // Debug log
    } else {
        console.error('Cart count element not found');
    }
}

// Add to cart function
function addToCart(productId, quantity = 1) {
    console.log('Adding to cart:', { productId, quantity }); // Debug log
    
    const formData = new FormData();
    formData.append('action', 'add');
    formData.append('product_id', productId.toString());
    formData.append('quantity', quantity.toString());

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
            displayCartSidebar(data);
            updateCartCount(data.count);
            
            // Show success message and open sidebar
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