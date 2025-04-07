// Load cart contents when the page loads
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatusAndLoadCart();
});

// Function to check login status and load cart
function checkLoginStatusAndLoadCart() {
    console.log('Checking login status...');
    
    fetch('PHP/login.php?action=check')
        .then(response => {
            console.log('Login check response:', response);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Login check data:', data);
            // Log debug information if available
            if (data.debug) {
                console.log('Session debug info:', data.debug);
            }
            
            const checkoutSection = document.querySelector('.checkout-section');
            const originalCheckoutForm = document.getElementById('checkout-form');
            
            if (!data.loggedin) {
                console.log('User is not logged in');
                // Hide checkout form and show login message
                if (checkoutSection) {
                    // Store the original checkout form if it hasn't been stored yet
                    if (originalCheckoutForm && !checkoutSection.dataset.hasOriginalForm) {
                        checkoutSection.dataset.hasOriginalForm = 'true';
                        originalCheckoutForm.style.display = 'none';
                    }
                    
                    // Show login message
                    const loginMessage = document.createElement('div');
                    loginMessage.className = 'login-message';
                    loginMessage.innerHTML = `
                        <h2>Please Login to Checkout</h2>
                        <p>You need to be logged in to complete your purchase.</p>
                        <div class="login-buttons">
                            <a href="login.html" class="btn btn-primary">Login</a>
                            <a href="register.html" class="btn btn-secondary">Register</a>
                        </div>
                    `;
                    
                    // Remove any existing login message
                    const existingMessage = checkoutSection.querySelector('.login-message');
                    if (existingMessage) {
                        existingMessage.remove();
                    }
                    
                    checkoutSection.appendChild(loginMessage);
                }
            } else {
                console.log('User is logged in as:', data.username);
                if (checkoutSection && originalCheckoutForm) {
                    // Remove any login message
                    const loginMessage = checkoutSection.querySelector('.login-message');
                    if (loginMessage) {
                        loginMessage.remove();
                    }
                    
                    // Show the checkout form
                    originalCheckoutForm.style.display = 'block';
                    setupCheckoutForm();
                }
            }
            
            // Load cart regardless of login status
            loadCart();
        })
        .catch(error => {
            console.error('Error checking login status:', error);
            // Show error message and load cart
            if (checkoutSection) {
                checkoutSection.innerHTML = `
                    <h2>Error Checking Login Status</h2>
                    <p>There was an error verifying your login status. Please try refreshing the page.</p>
                    <p>Error details: ${error.message}</p>
                `;
            }
            loadCart();
        });
}

// Function to load cart contents
function loadCart() {
    const formData = new FormData();
    formData.append('action', 'get');

    fetch('PHP/cart.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayCart(data);
            updateSummary(data);
        } else {
            console.error('Failed to load cart:', data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while loading the cart.');
    });
}

// Function to display cart items
function displayCart(data) {
    const cartItems = document.getElementById('cart-items');
    
    if (!cartItems) {
        console.error('Cart items container not found');
        return;
    }
    
    cartItems.innerHTML = '';

    if (!data.items || data.items.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
        return;
    }

    data.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image_url || 'images/placeholder.png'}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p class="price">$${formatPrice(item.price)}</p>
                <div class="quantity-controls">
                    <button class="quantity-btn minus-btn" data-id="${item.id}" data-quantity="${item.quantity - 1}">-</button>
                    <input type="number" value="${item.quantity}" min="1" class="quantity-input" data-id="${item.id}">
                    <button class="quantity-btn plus-btn" data-id="${item.id}" data-quantity="${item.quantity + 1}">+</button>
                </div>
                <p class="subtotal">Subtotal: $${formatPrice(item.subtotal)}</p>
            </div>
            <button class="remove-btn" data-id="${item.id}">&times;</button>
        `;

        // Add event listeners after creating the element
        const minusBtn = itemElement.querySelector('.minus-btn');
        const plusBtn = itemElement.querySelector('.plus-btn');
        const quantityInput = itemElement.querySelector('.quantity-input');
        const removeBtn = itemElement.querySelector('.remove-btn');

        minusBtn.addEventListener('click', () => {
            const newQuantity = parseInt(minusBtn.dataset.quantity);
            if (newQuantity >= 1) {
                updateQuantity(minusBtn.dataset.id, newQuantity);
            }
        });

        plusBtn.addEventListener('click', () => {
            updateQuantity(plusBtn.dataset.id, parseInt(plusBtn.dataset.quantity));
        });

        quantityInput.addEventListener('change', (e) => {
            updateQuantity(e.target.dataset.id, e.target.value);
        });

        removeBtn.addEventListener('click', () => {
            removeItem(removeBtn.dataset.id);
        });

        cartItems.appendChild(itemElement);
    });
}

// Function to update cart summary
function updateSummary(data) {
    const subtotal = document.getElementById('subtotal');
    const tax = document.getElementById('tax');
    const total = document.getElementById('total');

    if (subtotal && tax && total) {
        const subtotalAmount = data.total || 0;
        const taxAmount = subtotalAmount * 0.1; // 10% tax
        const totalAmount = subtotalAmount + taxAmount;

        subtotal.textContent = `$${formatPrice(subtotalAmount)}`;
        tax.textContent = `$${formatPrice(taxAmount)}`;
        total.textContent = `$${formatPrice(totalAmount)}`;
    }
}

// Function to format price
function formatPrice(price) {
    const num = parseFloat(price);
    return isNaN(num) ? '0.00' : num.toFixed(2);
}

// Function to update item quantity
function updateQuantity(productId, quantity) {
    quantity = parseInt(quantity);
    if (isNaN(quantity) || quantity < 1) {
        alert('Please enter a valid quantity');
        loadCart(); // Reload cart to reset invalid input
        return;
    }

    const formData = new FormData();
    formData.append('action', 'update');
    formData.append('product_id', productId);
    formData.append('quantity', quantity);

    fetch('PHP/cart.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayCart(data);
            updateSummary(data);
        } else {
            console.error('Failed to update quantity:', data.error);
            alert('Failed to update quantity');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while updating the quantity');
    });
}

// Function to remove item from cart
function removeItem(productId) {
    if (!confirm('Are you sure you want to remove this item from your cart?')) {
        return;
    }

    const formData = new FormData();
    formData.append('action', 'remove');
    formData.append('product_id', productId);

    fetch('PHP/cart.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayCart(data);
            updateSummary(data);
        } else {
            console.error('Failed to remove item:', data.error);
            alert('Failed to remove item from cart');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while removing the item');
    });
}

// Function to setup checkout form
function setupCheckoutForm() {
    console.log('Setting up checkout form...');
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Checkout form submitted, verifying login...');
            
            // Double check login status before proceeding
            fetch('PHP/login.php?action=check')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Login verification data:', data);
                    if (!data.loggedin) {
                        console.log('User not logged in, redirecting to login page');
                        alert('Please login to complete your purchase');
                        window.location.href = 'login.html';
                        return;
                    }
                    
                    console.log('User is logged in, proceeding with checkout');
                    const formData = new FormData(checkoutForm);
                    formData.append('action', 'checkout');

                    // Log form data for debugging
                    console.log('Form data being sent:');
                    for (let pair of formData.entries()) {
                        console.log(pair[0] + ': ' + pair[1]);
                    }

                    fetch('PHP/cart.php', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => {
                        console.log('Checkout response status:', response.status);
                        if (!response.ok) {
                            return response.text().then(text => {
                                console.error('Error response:', text);
                                throw new Error('Network response was not ok: ' + text);
                            });
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Checkout response:', data);
                        if (data.success) {
                            alert('Order placed successfully!');
                            window.location.href = 'index.html';
                        } else {
                            alert(data.message || 'Failed to place order. Please ensure you are logged in.');
                        }
                    })
                    .catch(error => {
                        console.error('Error during checkout:', error);
                        alert('An error occurred while processing your order');
                    });
                })
                .catch(error => {
                    console.error('Error verifying login status:', error);
                    alert('An error occurred while verifying login status');
                });
        });
    }
} 