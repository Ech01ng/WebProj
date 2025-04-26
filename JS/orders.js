// JS/orders.js

document.addEventListener('DOMContentLoaded', function() {
    fetchOrders();
});

// Fetch the orders
function fetchOrders() {
    fetch('PHP/orders.php', {
        // Set the method to POST
        method: 'POST',
        // Set the content type to application/x-www-form-urlencoded
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        // Set the body to the action get_orders
        body: 'action=get_orders'
    })
    // Get the response
    .then(response => response.json())
    // Parse the response
    .then(data => {
        // Check if the orders were loaded successfully
        if (data.success) {
            // Render the orders
            renderOrders(data.orders);
        } else {
            // Show the error message
            showOrdersMessage(data.message || 'Could not load orders.');
        }
    })
    // Catch the error
    .catch(() => showOrdersMessage('Could not load orders.'));
}

// Render the orders
function renderOrders(orders) {
    // Get the orders list 
    const ordersList = document.getElementById('orders-list');
    // Clear the orders list
    ordersList.innerHTML = '';
    // Check if the orders were loaded successfully
    if (!orders || orders.length === 0) {
        // Show the error message
        showOrdersMessage('You have no orders.');
        return;
    }
    // Render the orders
    orders.forEach((order, idx) => {
        // Create the order number
        const displayOrderNum = `#${orders.length - idx}`;
        // Create the order div
        const orderDiv = document.createElement('div');
        // Set the class name of the order div
        orderDiv.className = 'cart-item';
        // Set the display style of the order div
        orderDiv.style.display = 'flex';
        // Set the alignment of the order div
        orderDiv.style.alignItems = 'center';
        // Set the justification of the order div
        orderDiv.style.justifyContent = 'space-between';
        // Set the margin bottom of the order div
        orderDiv.style.marginBottom = '1rem';
        // Create the order div inner HTML
        orderDiv.innerHTML = `
            <div style="flex:1; text-align:left; min-width:120px;"><strong>Order ${displayOrderNum}</strong></div>
            <div style="flex:2; text-align:left; display:flex; flex-wrap:wrap; gap:1em;">
                ${order.items.map(item => `
                    <span style='display:inline-flex; align-items:center; margin-right:1em;'>
                        <img src="${item.image_url || 'Images/placeholder.png'}" alt="${item.name}" style="height:32px; width:auto; margin-right:0.5em; border-radius:4px;">${item.name} x${item.quantity}
                    </span>
                `).join('')}
            </div>
            <div style="flex:1; text-align:right; min-width:120px;">
                $${parseFloat(order.total_amount).toFixed(2)}
                ${order.status !== 'cancelled' ? `
                    <button class="btn btn-edit btn-edit-order" data-order-id="${order.id}" style="margin-right:0.5em;">Edit Order</button>
                    <button class="btn btn-delete btn-cancel-order" data-order-id="${order.id}">Cancel</button>
                ` : ''}
            </div>
        `;
        // Append the order div to the orders list
        ordersList.appendChild(orderDiv);
    });
    // Attach the cancel handlers
    attachCancelHandlers();
    // Attach the edit handlers
    attachEditHandlers();
}

// Attach the cancel handlers
function attachCancelHandlers() {
    // Get all the cancel buttons
    document.querySelectorAll('.btn-cancel-order').forEach(btn => {
        // Add an event listener to the cancel button
        btn.addEventListener('click', function() {
            // Get the order ID from the data-order-id attribute
            const orderId = this.getAttribute('data-order-id');
            // Confirm the cancellation
            if (confirm('Are you sure you want to cancel this order?')) {
                // Cancel the order
                cancelOrder(orderId, this.closest('.cart-item'));
            }
        });
    });
}

// Cancel the order
function cancelOrder(orderId, orderElement) {
    // Fetch the order
    fetch('PHP/orders.php', {
        // Set the method to POST
        method: 'POST',
        // Set the content type to application/x-www-form-urlencoded
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        // Set the body to the order ID
        body: `action=cancel_order&order_id=${encodeURIComponent(orderId)}`
    })
    // Get the response
    .then(response => response.json())
    // Parse the response
    .then(data => {
        // Check if the order was cancelled successfully
        if (data.success) {
            // Remove the order element
            orderElement.remove();
            // Show the success message
            showOrdersMessage('Order cancelled successfully.');
        } else {
            // Show the error message
            showOrdersMessage(data.message || 'Could not cancel order.');
        }
    })
    // Catch the error
    .catch((err) => {
        // Show the error message
        console.error('Fetch error:', err);
        showOrdersMessage('Could not cancel order.');
    });
}

// Attach the edit handlers
function attachEditHandlers() {
    // Get all the edit buttons
    document.querySelectorAll('.btn-edit-order').forEach(btn => {
        // Add an event listener to the edit button
        btn.addEventListener('click', function() {
            // Get the order ID from the data-order-id attribute
            const orderId = this.getAttribute('data-order-id');
            // Get the order element
            const orderElement = this.closest('.cart-item');
            // Toggle the edit form
            toggleEditForm(orderId, orderElement);
        });
    });
}

// Toggle the edit form
function toggleEditForm(orderId, orderElement) {
    // Check if edit form already exists
    const existingForm = orderElement.querySelector('.edit-order-form');
    if (existingForm) {
        existingForm.remove();
        return;
    }

    // Fetch order details
    fetch('PHP/orders.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=get_order_details&order_id=${encodeURIComponent(orderId)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const order = data.order;
            // Create edit form
            const editForm = document.createElement('div');
            editForm.className = 'edit-order-form';
            editForm.style.marginTop = '1rem';
            editForm.style.padding = '1rem';
            editForm.style.backgroundColor = '#2c3e50';
            editForm.style.borderRadius = '8px';
            editForm.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
            editForm.style.color = 'white';
            
            editForm.innerHTML = `
                <h3>Edit Billing Address</h3>
                <form id="editOrderForm">
                    <div class="form-group">
                        <label for="billing_address">Billing Address</label>
                        <textarea class="form-control" id="billing_address" name="billing_address" required>${order.billing_address}</textarea>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.edit-order-form').remove()">Cancel</button>
                    </div>
                </form>
            `;

            // Add form after the order element
            orderElement.parentNode.insertBefore(editForm, orderElement.nextSibling);

            // Add form submit handler
            editForm.querySelector('form').addEventListener('submit', function(e) {
                e.preventDefault();
                updateOrder(orderId, this);
            });
        } else {
            showOrdersMessage(data.message || 'Could not load order details.');
        }
    })
    .catch(() => showOrdersMessage('Could not load order details.'));
}

// Update order details
function updateOrder(orderId, form) {
    const formData = new FormData(form);
    const data = {
        action: 'update_order',
        order_id: orderId,
        billing_address: formData.get('billing_address')
    };

    fetch('PHP/orders.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: Object.keys(data).map(key => 
            `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`
        ).join('&')
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showOrdersMessage('Order updated successfully.');
            form.closest('.edit-order-form').remove();
            // Refresh the orders list
            fetchOrders();
        } else {
            showOrdersMessage(data.message || 'Could not update order.');
        }
    })
    .catch(() => showOrdersMessage('Could not update order.'));
}

// Show the orders message
function showOrdersMessage(msg) {
    // Get the orders message element
    const msgDiv = document.getElementById('orders-message');
    // Set the text content of the orders message element
    msgDiv.textContent = msg;
} 