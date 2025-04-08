// Purpose of this file is to handle the cart functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load cart on page load
    loadCart();

    // Add event listeners for cart actions
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = e.target.dataset.productId;
            const quantity = document.querySelector(`#quantity-${productId}`).value;
            addToCart(productId, quantity);
        }
    });

    // Get form elements once
    const checkoutForm = document.getElementById('checkout-form');
    const cardNumberInput = document.getElementById('card-number');
    const cardExpiryInput = document.getElementById('card-expiry');
    const cardCVVInput = document.getElementById('card-cvv');
    const billingAddressInput = document.getElementById('billing-address');
    const paymentMethodInput = document.getElementById('payment-method');

    // Add event listeners for real-time validation
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function() {
            // Remove any non-digit characters
            this.value = this.value.replace(/\D/g, '');
            
            // Limit to 16 digits
            if (this.value.length > 16) {
                this.value = this.value.slice(0, 16);
            }

            const validation = validateCardNumber(this.value);
            showValidationMessage(this, validation.message, validation.isValid);
        });
    }

    if (cardCVVInput) {
        cardCVVInput.addEventListener('input', function() {
            // Remove any non-digit characters
            this.value = this.value.replace(/\D/g, '');
            
            // Limit to 3 digits
            if (this.value.length > 3) {
                this.value = this.value.slice(0, 3);
            }

            const validation = validateCVV(this.value);
            showValidationMessage(this, validation.message, validation.isValid);
        });
    }

    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function() {
            // Format as MM/YY
            let value = this.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2);
            }
            this.value = value.slice(0, 5);

            const validation = validateExpiry(this.value);
            showValidationMessage(this, validation.message, validation.isValid);
        });
    }

    if (billingAddressInput) {
        billingAddressInput.addEventListener('input', function() {
            const validation = validateBillingAddress(this.value);
            showValidationMessage(this, validation.message, validation.isValid);
        });
    }

    if (paymentMethodInput) {
        paymentMethodInput.addEventListener('change', function() {
            const validation = validatePaymentMethod(this.value);
            showValidationMessage(this, validation.message, validation.isValid);
        });
    }

    // Update checkout form submission handler
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submission intercepted');

            // Validate all fields
            const cardNumberValidation = validateCardNumber(cardNumberInput.value);
            const cardExpiryValidation = validateExpiry(cardExpiryInput.value);
            const cardCVVValidation = validateCVV(cardCVVInput.value);
            const billingAddressValidation = validateBillingAddress(billingAddressInput.value);
            const paymentMethodValidation = validatePaymentMethod(paymentMethodInput.value);

            // Show validation messages
            showValidationMessage(cardNumberInput, cardNumberValidation.message, cardNumberValidation.isValid);
            showValidationMessage(cardExpiryInput, cardExpiryValidation.message, cardExpiryValidation.isValid);
            showValidationMessage(cardCVVInput, cardCVVValidation.message, cardCVVValidation.isValid);
            showValidationMessage(billingAddressInput, billingAddressValidation.message, billingAddressValidation.isValid);
            showValidationMessage(paymentMethodInput, paymentMethodValidation.message, paymentMethodValidation.isValid);

            // Check if all validations pass
            if (!cardNumberValidation.isValid || 
                !cardExpiryValidation.isValid || 
                !cardCVVValidation.isValid || 
                !billingAddressValidation.isValid || 
                !paymentMethodValidation.isValid) {
                console.log('Validation failed');
                return;
            }

            // If all validations pass, proceed with checkout
            console.log('All validations passed, proceeding with checkout');
            checkout(
                cardNumberInput.value,
                cardExpiryInput.value,
                cardCVVInput.value,
                billingAddressInput.value,
                paymentMethodInput.value
            );
        });
    }
});

// Function to load cart contents
function loadCart() {
    fetch('PHP/cart.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'action=get'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateCartDisplay(data);
        } else {
            console.error('Error loading cart:', data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Function to add item to cart
function addToCart(productId, quantity) {
    fetch('PHP/cart.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=add&product_id=${productId}&quantity=${quantity}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateCartDisplay(data);
            alert('Product added to cart!');
        } else {
            alert('Error adding product to cart: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error adding product to cart');
    });
}

// Function to remove item from cart
function removeFromCart(productId) {
    fetch('PHP/cart.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=remove&product_id=${productId}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateCartDisplay(data);
        } else {
            alert('Error removing item from cart: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error removing item from cart');
    });
}

// Function to update cart item quantity
function updateQuantity(productId, quantity) {
    fetch('PHP/cart.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=update&product_id=${productId}&quantity=${quantity}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateCartDisplay(data);
        } else {
            alert('Error updating quantity: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error updating quantity');
    });
}

// Update cart display
function updateCartDisplay(data) {
    const cartItems = document.getElementById('cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');

    if (!cartItems || !data.items) {
        console.error('Cart elements or data not found');
        return;
    }

    cartItems.innerHTML = '';

    data.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        const price = parseFloat(item.price).toFixed(2);
        const subtotal = parseFloat(item.subtotal).toFixed(2);
        
        itemElement.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image_url}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span class="quantity-input">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <p class="price-line">$${price} × ${item.quantity}</p>
                <p class="subtotal">Subtotal: $${subtotal}</p>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">&times;</button>
        `;
        cartItems.appendChild(itemElement);
    });

    // Update summary section
    // This is the subtotal of the cart
    if (subtotalElement) {
        const subtotal = parseFloat(data.total).toFixed(2);
        subtotalElement.textContent = `$${subtotal}`;
    }

    // This is the tax of the cart
    if (taxElement) {
        const tax = (parseFloat(data.total) * 0.1).toFixed(2);
        taxElement.textContent = `$${tax}`;
    }

    // This is the total of the cart
    if (totalElement) {
        const total = (parseFloat(data.total) * 1.1).toFixed(2);
        totalElement.textContent = `$${total}`;
    }
}

// Function to handle checkout
function checkout(cardNumber, cardExpiry, cardCVV, billingAddress, paymentMethod) {
    // Validate all required fields
    if (!cardNumber || !cardExpiry || !cardCVV || !billingAddress || !paymentMethod) {
        alert('Error: All fields are required. Please fill in all fields and try again.');
        return;
    }

    // Validate card number (must be 16 digits)
    if (!/^\d{16}$/.test(cardNumber)) {
        alert('Error: Card number must be 16 digits.');
        return;
    }

    // Validate CVV (must be 3 digits)
    if (!/^\d{3}$/.test(cardCVV)) {
        alert('Error: CVV must be 3 digits.');
        return;
    }

    // Validate expiry date (MM/YY format)
    if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(cardExpiry)) {
        alert('Error: Expiry date must be in MM/YY format.');
        return;
    }

    // Check if card is expired
    const [expiryMonth, expiryYear] = cardExpiry.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (parseInt(expiryYear) < currentYear || 
        (parseInt(expiryYear) === currentYear && parseInt(expiryMonth) < currentMonth)) {
        alert('Error: Card has expired.');
        return;
    }

    // Validate payment method
    if (!['credit', 'debit'].includes(paymentMethod)) {
        alert('Error: Invalid payment method.');
        return;
    }

    // Validate billing address
    if (billingAddress.trim().length < 10) {
        alert('Error: Billing address must be at least 10 characters long.');
        return;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('action', 'checkout');
    formData.append('card-number', cardNumber);
    formData.append('card-expiry', cardExpiry);
    formData.append('card-cvv', cardCVV);
    formData.append('billing-address', billingAddress);
    formData.append('payment-method', paymentMethod);
    
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
        return response.json();
    })
    .then(data => {
        console.log('Checkout response:', data);
        if (data.success) {
            alert('Order placed successfully!');
            window.location.href = 'index.html';
        } else {
            alert(data.message || 'Error processing checkout');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error processing checkout');
    });
}

// Function to display validation message
function showValidationMessage(inputElement, message, isValid = false) {
    const messageDiv = inputElement.nextElementSibling;
    if (messageDiv && messageDiv.classList.contains('validation-message')) {
        messageDiv.textContent = message;
        messageDiv.style.color = isValid ? '#28a745' : '#dc3545';
        inputElement.style.borderColor = isValid ? '#28a745' : '#dc3545';
    }
}

// Function to clear validation message
function clearValidationMessage(inputElement) {
    const messageDiv = inputElement.nextElementSibling;
    if (messageDiv && messageDiv.classList.contains('validation-message')) {
        messageDiv.textContent = '';
        inputElement.style.borderColor = '';
    }
}

// Function to validate card number
function validateCardNumber(cardNumber) {
    const regex = /^\d{16}$/;
    if (!cardNumber) {
        return { isValid: false, message: 'Card number is required' };
    }
    if (!regex.test(cardNumber)) {
        return { isValid: false, message: 'Card number must be exactly 16 digits' };
    }
    return { isValid: true, message: 'Valid card number' };
}

// Function to validate CVV
function validateCVV(cvv) {
    const regex = /^\d{3}$/;
    if (!cvv) {
        return { isValid: false, message: 'CVV is required' };
    }
    if (!regex.test(cvv)) {
        return { isValid: false, message: 'CVV must be exactly 3 digits' };
    }
    return { isValid: true, message: 'Valid CVV' };
}

// Function to validate expiry date
function validateExpiry(expiry) {
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiry) {
        return { isValid: false, message: 'Expiry date is required' };
    }
    if (!regex.test(expiry)) {
        return { isValid: false, message: 'Expiry date must be in MM/YY format' };
    }

    const [month, year] = expiry.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (parseInt(year) < currentYear || 
        (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        return { isValid: false, message: 'Card has expired' };
    }

    return { isValid: true, message: 'Valid expiry date' };
}

// Function to validate billing address
function validateBillingAddress(address) {
    if (!address) {
        return { isValid: false, message: 'Billing address is required' };
    }
    if (address.trim().length < 10) {
        return { isValid: false, message: 'Billing address must be at least 10 characters' };
    }
    return { isValid: true, message: 'Valid billing address' };
}

// Function to validate payment method
function validatePaymentMethod(method) {
    if (!method) {
        return { isValid: false, message: 'Payment method is required' };
    }
    if (!['credit', 'debit'].includes(method)) {
        return { isValid: false, message: 'Invalid payment method' };
    }
    return { isValid: true, message: 'Valid payment method' };
} 