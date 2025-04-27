<?php
// Start session for cart data persistence
session_start();
require_once 'config.php';

// Enable error reporting for development environment
error_reporting(E_ALL);
ini_set('display_errors', 1);

/**
 * Log error messages to the server's error log
 * parameters:
 * string $message Error message to log
 */
function logError($message) {
    error_log(date('Y-m-d H:i:s') . " - Cart Error: " . $message);
}

// Initialize empty cart in session if it doesn't exist
if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = array();
}

// Add a product to the cart
function addToCart($product_id, $quantity = 1) {
    if (isset($_SESSION['cart'][$product_id])) {
        $_SESSION['cart'][$product_id] += $quantity; // Increment existing quantity
    } else {
        $_SESSION['cart'][$product_id] = $quantity; // Add new item
    }
    return true;
}

// Remove a product from the cart
function removeFromCart($product_id) {
    if (isset($_SESSION['cart'][$product_id])) {
        unset($_SESSION['cart'][$product_id]);
        return true;
    }
    return false;
}

// Update quantity of a cart item
function updateCartQuantity($product_id, $quantity) {
    if ($quantity > 0) {
        $_SESSION['cart'][$product_id] = $quantity;
        return true;
    } else {
        return removeFromCart($product_id); // Remove if quantity is 0
    }
}

// Format price with 2 decimal places
function formatPrice($price) {
    return number_format(floatval($price), 2, '.', '');
}

// Get complete cart contents with product details
function getCartContents($conn) {
    // Return empty cart if no items
    if (empty($_SESSION['cart'])) {
        return array(
            'items' => array(),
            'total' => "0.00",
            'count' => 0
        );
    }

    $items = array();
    $total = 0;
    $count = 0;

    // Loop through cart items and get product details from database
    foreach ($_SESSION['cart'] as $product_id => $quantity) {
        try {
            // Prepare SQL to get product details
            $stmt = $conn->prepare("SELECT product_id, name, price, image_url FROM products WHERE product_id = ?");
            if (!$stmt) {
                logError("Failed to prepare statement: " . $conn->error);
                throw new Exception("Failed to prepare statement: " . $conn->error);
            }
            
            // Execute query with product ID
            $stmt->bind_param("i", $product_id);
            if (!$stmt->execute()) {
                logError("Failed to execute statement: " . $stmt->error);
                throw new Exception("Failed to execute statement: " . $stmt->error);
            }
            
            // Get query results
            $result = $stmt->get_result();
            if (!$result) {
                logError("Failed to get result: " . $stmt->error);
                throw new Exception("Failed to get result: " . $stmt->error);
            }
            
            // Process product data if found
            if ($product = $result->fetch_assoc()) {
                $price = $product['price'];
                $subtotal = $price * $quantity;
                
                // Add item details to cart array
                $items[] = array(
                    'id' => intval($product['product_id']),
                    'name' => $product['name'],
                    'price' => $price,
                    'image_url' => $product['image_url'],
                    'quantity' => intval($quantity),
                    'subtotal' => $subtotal
                );
                
                // Update cart totals
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

    // Return complete cart data
    return array(
        'items' => $items,
        'total' => $total,
        'count' => intval($count)
    );
}

// Send JSON response to client
function sendJsonResponse($success, $message = '', $data = array()) {
    $response = array_merge(
        array(
            'success' => $success,
            'message' => $message
        ),
        $data
    );
    
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}

// Handle AJAX requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $response = array('success' => false);

    if (isset($_POST['action'])) {
        try {
            switch ($_POST['action']) {
                // Add item to cart
                case 'add':
                    // Validate required parameters
                    if (!isset($_POST['product_id']) || !isset($_POST['quantity'])) {
                        throw new Exception('Missing product_id or quantity');
                    }
                    
                    $product_id = intval($_POST['product_id']);
                    $quantity = intval($_POST['quantity']);
                    
                    logError("Attempting to add product: " . $product_id . " with quantity: " . $quantity);
                    
                    // Validate quantity
                    if ($quantity <= 0) {
                        throw new Exception('Invalid quantity');
                    }
                    
                    // Verify product exists in database
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
                    
                    // Add to cart if product exists
                    if ($result->num_rows > 0) {
                        if (isset($_SESSION['cart'][$product_id])) {
                            $_SESSION['cart'][$product_id] += $quantity;
                        } else {
                            $_SESSION['cart'][$product_id] = $quantity;
                        }
                        
                        // Get updated cart contents
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
                    
                // Remove item from cart
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
                
                // Update cart item quantity
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
                
                // Get cart contents
                case 'get':
                    $cartData = getCartContents($conn);
                    $response = array(
                        'success' => true,
                        'items' => $cartData['items'],
                        'total' => $cartData['total'],
                        'count' => $cartData['count']
                    );
                    break;

                // Checkout
                case 'checkout':
                    // Check if user is logged in
                    if (!isset($_SESSION['id'])) {
                        sendJsonResponse(false, 'Please log in to complete your order');
                        exit;
                    }

                    // Validate required fields
                    if (!isset($_POST['card-number']) || !isset($_POST['card-expiry']) || 
                        !isset($_POST['card-cvv']) || !isset($_POST['billing-address']) || 
                        !isset($_POST['payment-method'])) {
                        sendJsonResponse(false, 'Missing required fields');
                        exit;
                    }

                    // Get the card number, expiry, CVV, billing address, and payment method
                    $cardNumber = trim($_POST['card-number']);
                    $cardExpiry = trim($_POST['card-expiry']);
                    $cardCVV = trim($_POST['card-cvv']);
                    $billingAddress = trim($_POST['billing-address']);
                    $paymentMethod = trim($_POST['payment-method']);

                    // Server-side validation
                    $errors = [];

                    // Validate card number
                    if (!preg_match('/^\d{16}$/', $cardNumber)) {
                        $errors[] = 'Card number must be 16 digits';
                    }

                    // Validate CVV
                    if (!preg_match('/^\d{3}$/', $cardCVV)) {
                        $errors[] = 'CVV must be 3 digits';
                    }

                    // Validate expiry date
                    if (!preg_match('/^(0[1-9]|1[0-2])\/([0-9]{2})$/', $cardExpiry)) {
                        $errors[] = 'Expiry date must be in MM/YY format';
                    } else {
                        list($expiryMonth, $expiryYear) = explode('/', $cardExpiry);
                        $currentYear = date('y');
                        $currentMonth = date('m');

                        if ($expiryYear < $currentYear || 
                            ($expiryYear == $currentYear && $expiryMonth < $currentMonth)) {
                            $errors[] = 'Card has expired';
                        }
                    }

                    // Validate payment method
                    if (!in_array($paymentMethod, ['credit', 'debit'])) {
                        $errors[] = 'Invalid payment method';
                    }

                    // Validate billing address
                    if (strlen($billingAddress) < 10) {
                        $errors[] = 'Billing address must be at least 10 characters long';
                    }

                    if (!empty($errors)) {
                        sendJsonResponse(false, 'Validation failed: ' . implode(', ', $errors));
                        exit;
                    }

                    // Get cart contents before checkout
                    $cartData = getCartContents($conn);
                    
                    // Calculate totals
                    $subtotal = floatval($cartData['total']);
                    $tax = formatPrice($subtotal * 0.1); // 10% tax
                    $total = formatPrice($subtotal * 1.1); // Total with tax

                    try {
                        // Start transaction
                        $conn->begin_transaction();

                        // Create order
                        $stmt = $conn->prepare("INSERT INTO orders (user_id, total_amount, billing_address, payment_method, card_number, card_expiry, card_cvv, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'pending')");
                        $stmt->bind_param("idsssss", $_SESSION['id'], $total, $billingAddress, $paymentMethod, $cardNumber, $cardExpiry, $cardCVV);
                        $stmt->execute();
                        $orderId = $conn->insert_id;

                        // Add order items
                        $stmt = $conn->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
                        foreach ($cartData['items'] as $item) {
                            $itemPrice = formatPrice($item['price']);
                            $stmt->bind_param("iiid", $orderId, $item['id'], $item['quantity'], $itemPrice);
                            $stmt->execute();
                        }

                        // Clear cart
                        $_SESSION['cart'] = array();

                        // Commit transaction
                        $conn->commit();

                        sendJsonResponse(true, 'Order placed successfully', array(
                            'order_id' => $orderId,
                            'subtotal' => formatPrice($subtotal),
                            'tax' => $tax,
                            'total' => $total
                        ));
                    } catch (Exception $e) {
                        // Rollback transaction on error
                        $conn->rollback();
                        logError("Checkout error: " . $e->getMessage());
                        sendJsonResponse(false, 'Error processing order: ' . $e->getMessage());
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