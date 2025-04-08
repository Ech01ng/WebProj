-- Create the database
CREATE DATABASE IF NOT EXISTS pharmacy_db;
USE pharmacy_db;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50),
    image_url VARCHAR(255),
    stock INT NOT NULL DEFAULT 0
);

-- Create categories table
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Create orders table
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    billing_address TEXT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    card_number VARCHAR(255) NOT NULL,
    card_expiry VARCHAR(10) NOT NULL,
    card_cvv VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create order_items table
CREATE TABLE order_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Create contact_messages table
CREATE TABLE contact_messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample products
INSERT INTO products (name, description, price, category, image_url, stock) VALUES
('Vitamin C 1000mg', 'High-strength vitamin C supplement', 19.99, 'Vitamins', 'images/PJarr.png', 100),
('Pain Relief Tablets 500mg', 'Effective pain relief medication', 12.99, 'Pain Relief', 'images/PPill.png', 150),
('First Aid Kit', 'Complete first aid kit for emergencies', 29.99, 'Medical Supplies', 'images/PAid.png', 50),
('Hand Sanitizer 500ml', 'Antibacterial hand sanitizer', 8.99, 'Personal Care', 'images/PHand.png', 200),
('Multivitamins', 'Daily multivitamin supplement for overall health', 24.99, 'Vitamins and Supplements', 'images/PMult.png', 75),
('Blood Pressure Monitor', 'Digital blood pressure monitor for home use', 49.99, 'Medical Supplies', 'images/PBlood.png', 30);

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
('Prescription Medicines', 'Medicines that require a prescription'),
('Over-the-Counter', 'Medicines available without prescription'),
('Vitamins & Supplements', 'Nutritional supplements and vitamins'),
('Personal Care', 'Personal care and hygiene products'),
('Medical Supplies', 'Medical equipment and supplies');

-- Insert Test User
INSERT INTO users (username, email, password, role) VALUES
('testuser', 'testuser@example.com', 'test123', 'test');
