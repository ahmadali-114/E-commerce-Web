-- Create database (if not already created)
CREATE DATABASE IF NOT EXISTS easeshop;
USE easeshop;

-- Users table (shared by Auth and User services)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(50),
    province VARCHAR(50),
    postalCode VARCHAR(20),
    isAdmin BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table (Product service)
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100),
    category VARCHAR(50),
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    originalPrice DECIMAL(10,2),
    stock INT DEFAULT 0,
    image VARCHAR(500),
    rating DECIMAL(2,1) DEFAULT 0,
    reviewCount INT DEFAULT 0,
    colors JSON,
    sizes JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table (Product service) with image column
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    image VARCHAR(500),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table (Order service)
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    orderNumber VARCHAR(50) UNIQUE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    shipping DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    paymentMethod VARCHAR(50),
    shippingAddress TEXT,
    city VARCHAR(50),
    province VARCHAR(50),
    postalCode VARCHAR(20),
    notes TEXT,
    status ENUM('Processing','Confirmed','Shipped','Delivered','Cancelled') DEFAULT 'Processing',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE RESTRICT
);

-- Order items table (Order service)
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    orderId INT NOT NULL,
    productId INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES products(id)
);

-- =============================================
-- INSERT CATEGORIES (with images)
-- =============================================
INSERT IGNORE INTO categories (name, description, image) VALUES
('electronics', 'Latest gadgets, computers, and tech accessories', 'https://images.pexels.com/photos/3568520/pexels-photo-3568520.jpeg?auto=compress&cs=tinysrgb&w=600'),
('clothing', 'Fashion for men, women, and kids', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600'),
('sports', 'Fitness equipment, activewear, and outdoor gear', 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=600'),
('books', 'Bestsellers, fiction, non‑fiction, and textbooks', 'https://images.pexels.com/photos/256450/pexels-photo-256450.jpeg?auto=compress&cs=tinysrgb&w=600'),
('beauty', 'Skincare, makeup, haircare, and fragrances', 'https://images.pexels.com/photos/3738345/pexels-photo-3738345.jpeg?auto=compress&cs=tinysrgb&w=600'),
('home-appliances', 'Kitchen gadgets and household appliances', 'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=600'),
('groceries', 'Fresh food, beverages, and pantry staples', 'https://images.pexels.com/photos/2631746/pexels-photo-2631746.jpeg?auto=compress&cs=tinysrgb&w=600'),
('toys', 'Educational toys, games, and collectibles', 'https://images.pexels.com/photos/3945657/pexels-photo-3945657.jpeg?auto=compress&cs=tinysrgb&w=600'),
('automotive', 'Car accessories, tools, and maintenance', 'https://images.pexels.com/photos/3874102/pexels-photo-3874102.jpeg?auto=compress&cs=tinysrgb&w=600'),
('furniture', 'Home and office furniture, decor, and storage', 'https://images.pexels.com/photos/265770/pexels-photo-265770.jpeg?auto=compress&cs=tinysrgb&w=600');

-- =============================================
-- INSERT PRODUCTS (2 per category, with images)
-- =============================================

-- Electronics
INSERT IGNORE INTO products (name, brand, category, description, price, originalPrice, stock, image, rating, reviewCount) VALUES
('Noise Cancelling Headphones', 'Sony', 'electronics', 'Wireless, 30-hour battery, Hi‑Res audio.', 19999, 24999, 120, 'https://images.pexels.com/photos/3394659/pexels-photo-3394659.jpeg?auto=compress&cs=tinysrgb&w=600', 4.8, 650),
('Smartphone 5G', 'Samsung', 'electronics', '6.7" AMOLED, 108MP camera, 5000mAh battery.', 79999, 89999, 85, 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=600', 4.7, 420);

-- Clothing
INSERT IGNORE INTO products (name, brand, category, description, price, originalPrice, stock, image, rating, reviewCount) VALUES
('Men’s Running Shirt', 'Nike', 'clothing', 'Breathable, moisture‑wicking, slim fit.', 1999, 2499, 300, 'https://images.pexels.com/photos/428340/pexels-photo-428340.jpeg?auto=compress&cs=tinysrgb&w=600', 4.5, 1100),
('Women’s Yoga Leggings', 'Adidas', 'clothing', 'Stretch fabric, high waist, 7/8 length.', 2499, 2999, 250, 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=600', 4.6, 890);

-- Sports
INSERT IGNORE INTO products (name, brand, category, description, price, originalPrice, stock, image, rating, reviewCount) VALUES
('Running Shoes', 'Nike', 'sports', 'Lightweight, cushioned, 8mm drop.', 5999, 6999, 180, 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=600', 4.6, 920),
('Adjustable Dumbbell Set', 'Bowflex', 'sports', '5‑25kg, compact, quick change.', 18999, 22999, 45, 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=600', 4.7, 310);

-- Books
INSERT IGNORE INTO products (name, brand, category, description, price, originalPrice, stock, image, rating, reviewCount) VALUES
('Atomic Habits', 'Penguin', 'books', 'Proven way to build good habits and break bad ones.', 599, 799, 210, 'https://images.pexels.com/photos/256450/pexels-photo-256450.jpeg?auto=compress&cs=tinysrgb&w=600', 4.9, 1800),
('The Psychology of Money', 'HarperCollins', 'books', 'Timeless lessons on wealth, greed, and happiness.', 699, 999, 160, 'https://images.pexels.com/photos/256450/pexels-photo-256450.jpeg?auto=compress&cs=tinysrgb&w=600', 4.8, 1230);

-- Beauty
INSERT IGNORE INTO products (name, brand, category, description, price, originalPrice, stock, image, rating, reviewCount) VALUES
('Vitamin C Serum', 'The Ordinary', 'beauty', 'Brightening, reduces dark spots, 30ml.', 1299, 1799, 350, 'https://images.pexels.com/photos/3738345/pexels-photo-3738345.jpeg?auto=compress&cs=tinysrgb&w=600', 4.7, 920),
('Matte Lipstick', 'MAC', 'beauty', 'Long‑lasting, highly pigmented, 12 shades.', 1499, 1999, 400, 'https://images.pexels.com/photos/3738345/pexels-photo-3738345.jpeg?auto=compress&cs=tinysrgb&w=600', 4.5, 760);

-- Home Appliances
INSERT IGNORE INTO products (name, brand, category, description, price, originalPrice, stock, image, rating, reviewCount) VALUES
('Air Fryer 4.5L', 'Philips', 'home-appliances', 'Rapid air, oil‑free, digital touchscreen.', 8999, 10999, 90, 'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=600', 4.8, 540),
('Robot Vacuum', 'iRobot', 'home-appliances', 'Wi‑Fi, mapping, self‑charging, 120min run.', 29999, 35999, 35, 'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=600', 4.7, 290);

-- Groceries
INSERT IGNORE INTO products (name, brand, category, description, price, originalPrice, stock, image, rating, reviewCount) VALUES
('Organic Extra Virgin Olive Oil', 'Bertolli', 'groceries', 'Cold‑pressed, 500ml glass bottle.', 899, 1199, 520, 'https://images.pexels.com/photos/2631746/pexels-photo-2631746.jpeg?auto=compress&cs=tinysrgb&w=600', 4.6, 430),
('Basmati Rice (Premium)', 'India Gate', 'groceries', 'Aged, 5kg pack, extra long grain.', 799, 999, 610, 'https://images.pexels.com/photos/2631746/pexels-photo-2631746.jpeg?auto=compress&cs=tinysrgb&w=600', 4.5, 370);

-- Toys
INSERT IGNORE INTO products (name, brand, category, description, price, originalPrice, stock, image, rating, reviewCount) VALUES
('LEGO Classic Creative Box', 'LEGO', 'toys', '106 pieces, endless building fun.', 1499, 1899, 220, 'https://images.pexels.com/photos/3945657/pexels-photo-3945657.jpeg?auto=compress&cs=tinysrgb&w=600', 4.9, 680),
('Remote Control Stunt Car', 'Hot Wheels', 'toys', '360° flips, 2.4GHz, rechargeable.', 2499, 2999, 130, 'https://images.pexels.com/photos/3945657/pexels-photo-3945657.jpeg?auto=compress&cs=tinysrgb&w=600', 4.5, 410);

-- Automotive
INSERT IGNORE INTO products (name, brand, category, description, price, originalPrice, stock, image, rating, reviewCount) VALUES
('Car Vacuum Cleaner', 'Black+Decker', 'automotive', '12V, 16ft cord, crevice tool included.', 2499, 3499, 160, 'https://images.pexels.com/photos/3874102/pexels-photo-3874102.jpeg?auto=compress&cs=tinysrgb&w=600', 4.6, 280),
('Dash Cam 4K', 'Nextbase', 'automotive', 'Ultra HD, night vision, G‑sensor, loop recording.', 13999, 16999, 65, 'https://images.pexels.com/photos/3874102/pexels-photo-3874102.jpeg?auto=compress&cs=tinysrgb&w=600', 4.7, 190);

-- Furniture
INSERT IGNORE INTO products (name, brand, category, description, price, originalPrice, stock, image, rating, reviewCount) VALUES
('Ergonomic Office Chair', 'Herman Miller', 'furniture', 'Adjustable lumbar, breathable mesh, 3D armrests.', 49999, 59999, 30, 'https://images.pexels.com/photos/265770/pexels-photo-265770.jpeg?auto=compress&cs=tinysrgb&w=600', 4.8, 170),
('Solid Wood Dining Table', 'IKEA', 'furniture', '6‑seater, oak finish, modern rectangular.', 29999, 39999, 25, 'https://images.pexels.com/photos/265770/pexels-photo-265770.jpeg?auto=compress&cs=tinysrgb&w=600', 4.6, 110);

INSERT IGNORE INTO users (firstName, lastName, email, phone, password, isAdmin) VALUES
('Ease', 'Shop', 'easeshop@gmail.com', '1234567890', '$2b$10$LgYQ.hFkOQwZ3u5p1kL6uBgZpLk6Mq6n5JFq0qwlX9lWqHq3lXJqW', 1);