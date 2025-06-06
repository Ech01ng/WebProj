<?php
session_start();
require_once 'config.php';
header('Content-Type: application/json');

function sendJson($success, $data = []) {
    echo json_encode(array_merge(['success' => $success], $data));
    exit;
}

if (!isset($_SESSION['id'])) {
    sendJson(false, ['message' => 'Please login to view your orders!']);
}
$user_id = $_SESSION['id'];

// Handle POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    if ($action === 'get_orders') {
        // Fetch all orders for this user, newest first
        $orders = [];
        // Prepare the SQL statement
        $stmt = $conn->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC");
        // Bind the user ID to the statement
        $stmt->bind_param('i', $user_id);
        // Execute the statement
        $stmt->execute();
        // Get the result
        $result = $stmt->get_result();
        // Loop through the orders
        while ($order = $result->fetch_assoc()) {
            // Fetch items for this order
            $items = [];
            // Prepare the SQL statement
            $item_stmt = $conn->prepare("SELECT oi.*, p.name, p.image_url FROM order_items oi JOIN products p ON oi.product_id = p.product_id WHERE oi.order_id = ?");
            // Bind the order ID to the statement
            $item_stmt->bind_param('i', $order['order_id']);
            // Execute the statement
            $item_stmt->execute();
            // Get the result
            $item_result = $item_stmt->get_result();
            while ($item = $item_result->fetch_assoc()) {
                $items[] = [
                    // Add the product name to the items
                    'name' => $item['name'],
                    // Add the quantity of the item to the items
                    'quantity' => $item['quantity'],
                    // Add the price of the item to the items
                    'price' => $item['price'],
                    // Add the image URL of the item to the items
                    'image_url' => $item['image_url']
                ];
            }
            $orders[] = [
                // Add the order ID to the orders
                'id' => $order['order_id'],
                // Add the created at date to the orders
                'created_at' => $order['created_at'],
                // Add the total amount of the order to the orders
                'total_amount' => $order['total_amount'],
                // Add the status of the order to the orders
                'status' => $order['status'],
                // Add the items to the orders
                'items' => $items
            ];
        }
        // Send the orders to the client
        sendJson(true, ['orders' => $orders]);
    } elseif ($action === 'cancel_order' && isset($_POST['order_id'])) {
        $order_id = intval($_POST['order_id']);
        // Check if order belongs to user
        $stmt = $conn->prepare("SELECT * FROM orders WHERE order_id = ? AND user_id = ?");
        // Bind the order ID and user ID to the statement
        $stmt->bind_param('ii', $order_id, $user_id);
        // Execute the statement
        $stmt->execute();
        // Get the result
        $result = $stmt->get_result();
        if ($result->num_rows === 0) {
            sendJson(false, ['message' => 'Cannot find that order!']);
        }
        // Delete order items first
        $conn->query("DELETE FROM order_items WHERE order_id = $order_id");
        // Delete order
        $conn->query("DELETE FROM orders WHERE order_id = $order_id");
        // Send a JSON response
        sendJson(true, ['message' => 'Order has been cancelled and deleted.']);
    } elseif ($action === 'get_order_details' && isset($_POST['order_id'])) {
        $order_id = intval($_POST['order_id']);
        // Check if order belongs to user
        $stmt = $conn->prepare("SELECT * FROM orders WHERE order_id = ? AND user_id = ?");
        // Bind the order ID and user ID to the statement
        $stmt->bind_param('ii', $order_id, $user_id);
        // Execute the statement
        $stmt->execute();
        // Get the result
        $result = $stmt->get_result();
        if ($result->num_rows === 0) {
            sendJson(false, ['message' => 'Cannot find that order or it may not be yours!']);
        }
        // Get the order
        $order = $result->fetch_assoc();
        // Send a JSON response
        sendJson(true, ['order' => $order]);
    } elseif ($action === 'update_order' && isset($_POST['order_id'])) {
        $order_id = intval($_POST['order_id']);
        // Check if order belongs to user
        $stmt = $conn->prepare("SELECT * FROM orders WHERE order_id = ? AND user_id = ?");
        // Bind the order ID and user ID to the statement
        $stmt->bind_param('ii', $order_id, $user_id);
        // Execute the statement
        $stmt->execute();
        // Get the result
        $result = $stmt->get_result();
        if ($result->num_rows === 0) {
            sendJson(false, ['message' => 'Cannot find that order or it may not be yours!']);
        }

        // Update order details
        $stmt = $conn->prepare("UPDATE orders SET 
            billing_address = ?
            WHERE order_id = ? AND user_id = ?");
        
        $stmt->bind_param('sii', 
            $_POST['billing_address'],
            $order_id,
            $user_id
        );

        if ($stmt->execute()) {
            sendJson(true, ['message' => 'Order has been updated successfully.']);
        } else {
            sendJson(false, ['message' => 'Could not update order.']);
        }
    } else {
        sendJson(false, ['message' => 'Invalid action or missing parameters!']);
    }
} else {
    sendJson(false, ['message' => 'Invalid request method!']);
} 