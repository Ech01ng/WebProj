// Purpose of this file is to handle the cart functionality

// Function to load cart contents
function loadedCart() {
    fetch('PHP/cart.php', {
        // Set the method to POST
        method: 'POST',
        // Set the content type to application/x-www-form-urlencoded
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        // Set the body to the action get
        body: 'action=get'
    })
    // Get the response
    .then(response => response.json())
    // Parse the response
    .then(data => {
        // Check if the cart was loaded successfully
        if (data.success) {
            // Update the cart display
            updateCartDisplay(data);
        } else {
            // Show the error message
            console.error('Oops! Can\'t load your cart right now:', data.error);
        }
    })
    .catch(error => {
        // Show the error message
        console.error('Hmm, something went wrong:', error);
    });
}

// Load cart on page load
document.addEventListener('DOMContentLoaded', function() {
    loadedCart();

    // Add event listeners for cart actions
    document.addEventListener('click', function(e) {
        // Check if the target has the class add-to-cart
        if (e.target.classList.contains('add-to-cart')) {
            // Get the product ID from the data-product-id attribute
            const productId = e.target.dataset.productId;
            // Get the quantity from the quantity input
            const quantity = document.querySelector(`#quantity-${productId}`).value;
            // Add the item to the cart
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

            // Validate the card number
            const validation = validateCardNumber(this.value);
            // Show the validation message
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

    // Validate the billing address
    if (billingAddressInput) {
        billingAddressInput.addEventListener('input', function() {
            const validation = validateBillingAddress(this.value);
            // Show the validation message
            showValidationMessage(this, validation.message, validation.isValid);
        });
    }

    // Validate the payment method
    if (paymentMethodInput) {
        paymentMethodInput.addEventListener('change', function() {
            const validation = validatePaymentMethod(this.value);
            // Show the validation message
            showValidationMessage(this, validation.message, validation.isValid);
        });
    }

    // Update checkout form submission handler
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Hey, someone\'s trying to check out!');

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
                console.log('Hmm, some fields need attention');
                return;
            }

            // If all validations pass, proceed with checkout
            console.log('All good! Let\'s process your order');
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
            alert('Added to your cart! 🛒');
        } else {
            alert('Oops! Couldn\'t add that to your cart: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Hmm, something went wrong:', error);
        alert('Sorry, having trouble with your cart right now');
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
            alert('Hmm, couldn\'t remove that item: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Oops! Something went wrong:', error);
        alert('Sorry, having trouble with your cart right now');
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
            alert('Oops! Couldn\'t update the quantity: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Hmm, something went wrong:', error);
        alert('Sorry, having trouble with your cart right now');
    });
}

// Update cart display
function updateCartDisplay(data) {
    const cartItems = document.getElementById('cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');

    if (!cartItems || !data.items) {
        console.error('Hmm, can\'t find your cart items');
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
        alert('Hey! You forgot to fill in some details. Please check all fields and try again.');
        return;
    }

    // Validate card number (must be 16 digits)
    if (!/^\d{16}$/.test(cardNumber)) {
        alert('Oops! Your card number needs to be 16 digits.');
        return;
    }

    // Validate CVV (must be 3 digits)
    if (!/^\d{3}$/.test(cardCVV)) {
        alert('Hey! Your CVV needs to be 3 digits.');
        return;
    }

    // Validate expiry date (MM/YY format)
    if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(cardExpiry)) {
        alert('Oops! Your expiry date should be in MM/YY format.');
        return;
    }

    // Check if card is expired
    const [expiryMonth, expiryYear] = cardExpiry.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (parseInt(expiryYear) < currentYear || 
        (parseInt(expiryYear) === currentYear && parseInt(expiryMonth) < currentMonth)) {
        alert('Oops! Looks like your card has expired.');
        return;
    }

    // Validate payment method
    if (!['credit', 'debit'].includes(paymentMethod)) {
        alert('Hmm, that payment method doesn\'t look right.');
        return;
    }

    // Validate billing address
    if (billingAddress.trim().length < 10) {
        alert('Hey! Your billing address needs to be a bit longer.');
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
    console.log('Here\'s what we\'re sending to the server:');
    for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
    }
    
    fetch('PHP/cart.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log('Server says:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Here\'s what the server said:', data);
        if (data.success) {
            alert('Your order is on its way! 🎉');
            window.location.href = 'index.html';
        } else {
            alert(data.message || 'Oops! Something went wrong with your order.');
        }
    })
    .catch(error => {
        console.error('Hmm, something went wrong:', error);
        alert('Sorry, having trouble processing your order right now');
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
        return { isValid: false, message: 'Hey! We need your card number' };
    }
    if (!regex.test(cardNumber)) {
        return { isValid: false, message: 'Oops! Card number needs to be 16 digits' };
    }
    return { isValid: true, message: 'Card number looks good!' };
}

// Function to validate CVV
function validateCVV(cvv) {
    const regex = /^\d{3}$/;
    if (!cvv) {
        return { isValid: false, message: 'Hey! We need your CVV' };
    }
    if (!regex.test(cvv)) {
        return { isValid: false, message: 'Oops! CVV needs to be 3 digits' };
    }
    return { isValid: true, message: 'CVV looks good!' };
}

// Function to validate expiry date
function validateExpiry(expiry) {
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiry) {
        return { isValid: false, message: 'Hey! We need your card\'s expiry date' };
    }
    if (!regex.test(expiry)) {
        return { isValid: false, message: 'Oops! Expiry date should be in the MM/YY format' };
    }

    const [month, year] = expiry.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (parseInt(year) < currentYear || 
        (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        return { isValid: false, message: 'Oops! Your card has expired' };
    }

    return { isValid: true, message: 'Expiry date looks good!' };
}

// Function to validate billing address
function validateBillingAddress(address) {
    if (!address) {
        return { isValid: false, message: 'Hey! We need your billing address' };
    }
    if (address.trim().length < 10) {
        return { isValid: false, message: 'Oops! Address needs to be longer' };
    }
    return { isValid: true, message: 'Address looks good!' };
}

// Function to validate payment method
function validatePaymentMethod(method) {
    if (!method) {
        return { isValid: false, message: 'Hey! Choose a payment method' };
    }
    if (!['credit', 'debit'].includes(method)) {
        return { isValid: false, message: 'Oops! That payment method isn\'t right' };
    }
    return { isValid: true, message: 'Payment method looks good!' };
} 