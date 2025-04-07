<?php
session_start();
require_once 'config.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log function for debugging
function logError($message) {
    error_log(date('Y-m-d H:i:s') . " - Cart Error: " . $message);
}

// Initialize cart if it doesn't exist
if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = array();
}

// Function to add item to cart
function addToCart($product_id, $quantity = 1) {
    if (isset($_SESSION['cart'][$product_id])) {
        $_SESSION['cart'][$product_id] += $quantity;
    } else {
        $_SESSION['cart'][$product_id] = $quantity;
    }
    return true;
}

// Function to remove item from cart
function removeFromCart($product_id) {
    if (isset($_SESSION['cart'][$product_id])) {
        unset($_SESSION['cart'][$product_id]);
        return true;
    }
    return false;
}

// Function to update cart item quantity
function updateCartQuantity($product_id, $quantity) {
    if ($quantity > 0) {
        $_SESSION['cart'][$product_id] = $quantity;
        return true;
    } else {
        return removeFromCart($product_id);
    }
}

// Function to get cart contents with product details
function getCartContents($conn) {
    if (empty($_SESSION['cart'])) {
        return array(
            'items' => array(),
            'total' => 0,
            'count' => 0
        );
    }

    $items = array();
    $total = 0;
    $count = 0;

    foreach ($_SESSION['cart'] as $product_id => $quantity) {
        try {
            $stmt = $conn->prepare("SELECT product_id, name, price, image_url FROM products WHERE product_id = ?");
            if (!$stmt) {
                logError("Failed to prepare statement: " . $conn->error);
                throw new Exception("Failed to prepare statement: " . $conn->error);
            }
            
            $stmt->bind_param("i", $product_id);
            if (!$stmt->execute()) {
                logError("Failed to execute statement: " . $stmt->error);
                throw new Exception("Failed to execute statement: " . $stmt->error);
            }
            
            $result = $stmt->get_result();
            if (!$result) {
                logError("Failed to get result: " . $stmt->error);
                throw new Exception("Failed to get result: " . $stmt->error);
            }
            
            if ($product = $result->fetch_assoc()) {
                // Convert price to float
                $price = floatval($product['price']);
                $subtotal = $price * $quantity;
                $items[] = array(
                    'id' => intval($product['product_id']),
                    'name' => $product['name'],
                    'price' => $price,
                    'image_url' => $product['image_url'],
                    'quantity' => intval($quantity),
                    'subtotal' => $subtotal
                );
                $total += $subtotal;
                $count += $quantity;
            } else {
                logError("Product not found: " . $product_id);
            }
            
            $stmt->close();
        } catch (Exception $e) {
            logError("Error in getCartContents: " . $e->getMessage());
            continue;
        }
    }

    return array(
        'items' => $items,
        'total' => floatval($total),
        'count' => intval($count)
    );
}

// Function to process checkout
function processCheckout($user_id, $billing_address, $payment_method, $card_number, $card_expiry, $card_cvv) {
    global $conn;
    
    // Get cart contents
    $cart = getCartContents($conn);
    if (empty($cart['items'])) {
        return array('success' => false, 'message' => 'Cart is empty');
    }

    // Start transaction
    $conn->begin_transaction();

    try {
        // Create order
        $stmt = $conn->prepare("INSERT INTO orders (user_id, total_amount, billing_address, payment_method, card_number, card_expiry, card_cvv) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("idsssss", $user_id, $cart['total'], $billing_address, $payment_method, $card_number, $card_expiry, $card_cvv);
        $stmt->execute();
        $order_id = $conn->insert_id;

        // Add order items
        $stmt = $conn->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
        foreach ($cart['items'] as $item) {
            $stmt->bind_param("iiid", $order_id, $item['id'], $item['quantity'], $item['price']);
            $stmt->execute();
        }

        // Clear cart
        $_SESSION['cart'] = array();

        // Commit transaction
        $conn->commit();
        return array('success' => true);
    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        return array('success' => false, 'message' => 'Error processing order: ' . $e->getMessage());
    }
}

// Handle AJAX requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $response = array('success' => false);
    
    if (isset($_POST['action'])) {
        try {
            switch ($_POST['action']) {
                case 'add':
                    if (!isset($_POST['product_id']) || !isset($_POST['quantity'])) {
                        throw new Exception('Missing product_id or quantity');
                    }
                    
                    $product_id = intval($_POST['product_id']);
                    $quantity = intval($_POST['quantity']);
                    
                    logError("Attempting to add product: " . $product_id . " with quantity: " . $quantity);
                    
                    if ($quantity <= 0) {
                        throw new Exception('Invalid quantity');
                    }
                    
                    // Check if product exists
                    $stmt = $conn->prepare("SELECT product_id FROM products WHERE product_id = ?");
                    if (!$stmt) {
                        logError("Failed to prepare statement: " . $conn->error);
                        throw new Exception("Failed to prepare statement: " . $conn->error);
                    }
                    
                    $stmt->bind_param("i", $product_id);
                    if (!$stmt->execute()) {
                        logError("Failed to execute statement: " . $stmt->error);
                        throw new Exception("Failed to execute statement: " . $stmt->error);
                    }
                    
                    $result = $stmt->get_result();
                    if (!$result) {
                        logError("Failed to get result: " . $stmt->error);
                        throw new Exception("Failed to get result: " . $stmt->error);
                    }
                    
                    if ($result->num_rows > 0) {
                        if (isset($_SESSION['cart'][$product_id])) {
                            $_SESSION['cart'][$product_id] += $quantity;
                        } else {
                            $_SESSION['cart'][$product_id] = $quantity;
                        }
                        
                        $cartData = getCartContents($conn);
                        $response = array(
                            'success' => true,
                            'message' => 'Product added to cart',
                            'items' => $cartData['items'],
                            'total' => $cartData['total'],
                            'count' => $cartData['count']
                        );
                        logError("Successfully added product to cart: " . json_encode($response));
                    } else {
                        logError("Product not found in database: " . $product_id);
                        throw new Exception('Product not found');
                    }
                    $stmt->close();
                    break;
                    
                case 'remove':
                    if (isset($_POST['product_id'])) {
                        $product_id = intval($_POST['product_id']);
                        if (isset($_SESSION['cart'][$product_id])) {
                            unset($_SESSION['cart'][$product_id]);
                            $cartData = getCartContents($conn);
                            $response = array(
                                'success' => true,
                                'message' => 'Product removed from cart',
                                'items' => $cartData['items'],
                                'total' => $cartData['total'],
                                'count' => $cartData['count']
                            );
                        }
                    }
                    break;
                
                case 'update':
                    if (isset($_POST['product_id']) && isset($_POST['quantity'])) {
                        $product_id = intval($_POST['product_id']);
                        $quantity = intval($_POST['quantity']);
                        
                        if ($quantity > 0) {
                            $_SESSION['cart'][$product_id] = $quantity;
                        } else {
                            unset($_SESSION['cart'][$product_id]);
                        }
                        
                        $cartData = getCartContents($conn);
                        $response = array(
                            'success' => true,
                            'message' => 'Cart updated',
                            'items' => $cartData['items'],
                            'total' => $cartData['total'],
                            'count' => $cartData['count']
                        );
                    }
                    break;
                
                case 'get':
                    $cartData = getCartContents($conn);
                    $response = array(
                        'success' => true,
                        'items' => $cartData['items'],
                        'total' => $cartData['total'],
                        'count' => $cartData['count']
                    );
                    break;

                case 'checkout':
                    if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
                        $response = array('success' => false, 'message' => 'Please login to checkout');
                        break;
                    }
                    
                    // Log checkout attempt
                    error_log("Checkout attempt by user: " . $_SESSION['username']);
                    
                    // Validate required fields
                    $required_fields = ['billing-address', 'payment-method', 'card-number', 'card-expiry', 'card-cvv'];
                    $missing_fields = array();
                    
                    foreach ($required_fields as $field) {
                        if (!isset($_POST[$field]) || empty($_POST[$field])) {
                            $missing_fields[] = $field;
                        }
                    }
                    
                    if (!empty($missing_fields)) {
                        error_log("Missing fields in checkout: " . implode(', ', $missing_fields));
                        $response = array(
                            'success' => false,
                            'message' => 'Missing required fields: ' . implode(', ', $missing_fields)
                        );
                        break;
                    }
                    
                    try {
                        $response = processCheckout(
                            $_SESSION['id'],
                            $_POST['billing-address'],
                            $_POST['payment-method'],
                            $_POST['card-number'],
                            $_POST['card-expiry'],
                            $_POST['card-cvv']
                        );
                        
                        if ($response['success']) {
                            error_log("Checkout successful for user: " . $_SESSION['username']);
                        } else {
                            error_log("Checkout failed for user: " . $_SESSION['username'] . ". Reason: " . ($response['message'] ?? 'Unknown error'));
                        }
                    } catch (Exception $e) {
                        error_log("Checkout error for user " . $_SESSION['username'] . ": " . $e->getMessage());
                        $response = array(
                            'success' => false,
                            'message' => 'Error processing checkout: ' . $e->getMessage()
                        );
                    }
                    break;

                default:
                    throw new Exception('Invalid action');
            }
        } catch (Exception $e) {
            $response = array(
                'success' => false,
                'error' => $e->getMessage()
            );
            logError("Cart error: " . $e->getMessage());
        }
    } else {
        $response = array(
            'success' => false,
            'error' => 'No action specified'
        );
        logError("No action specified in request");
    }
    
    // Send JSON response
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}
?> 