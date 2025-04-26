// JS/orders.js

document.addEventListener('DOMContentLoaded', function() {
    fetchOrders();
});

function fetchOrders() {
    fetch('PHP/orders.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=get_orders'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            renderOrders(data.orders);
        } else {
            showOrdersMessage(data.message || 'Could not load orders.');
        }
    })
    .catch(() => showOrdersMessage('Could not load orders.'));
}

function renderOrders(orders) {
    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = '';
    if (!orders || orders.length === 0) {
        showOrdersMessage('You have no orders.');
        return;
    }
    orders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order-card';
        orderDiv.innerHTML = `
            <div class="order-header">
                <span><strong>Order #${order.id}</strong></span>
                <span>${order.created_at}</span>
                <span>Total: $${parseFloat(order.total_amount).toFixed(2)}</span>
                <span>Status: <strong>${order.status}</strong></span>
                ${order.status !== 'cancelled' ? `<button class="btn btn-danger btn-cancel-order" data-order-id="${order.id}">Cancel</button>` : ''}
            </div>
            <div class="order-items">
                <ul>
                    ${order.items.map(item => `<li>${item.name} x${item.quantity} ($${parseFloat(item.price).toFixed(2)})</li>`).join('')}
                </ul>
            </div>
        `;
        ordersList.appendChild(orderDiv);
    });
    attachCancelHandlers();
}

function attachCancelHandlers() {
    document.querySelectorAll('.btn-cancel-order').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.getAttribute('data-order-id');
            if (confirm('Are you sure you want to cancel this order?')) {
                cancelOrder(orderId, this.closest('.order-card'));
            }
        });
    });
}

function cancelOrder(orderId, orderElement) {
    fetch('PHP/orders.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=cancel_order&order_id=${encodeURIComponent(orderId)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            orderElement.remove();
            showOrdersMessage('Order cancelled successfully.');
        } else {
            showOrdersMessage(data.message || 'Could not cancel order.');
        }
    })
    .catch(() => showOrdersMessage('Could not cancel order.'));
}

function showOrdersMessage(msg) {
    const msgDiv = document.getElementById('orders-message');
    msgDiv.textContent = msg;
} 