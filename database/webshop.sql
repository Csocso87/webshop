CREATE DATABASE webshop;
USE webshop;

-- Felhasználók
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kategóriák
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Termékek (image_url a borítóképet tárolja, de ezt a galéria alapján állítjuk be)
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price INT NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    image_url VARCHAR(255),  -- ide kerül a galériában kijelölt borítókép URL-je
    category_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Termékképek galériája
CREATE TABLE product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Kosár
CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_item (user_id, product_id)
);

-- Rendelések
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount INT NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_name VARCHAR(100),
    shipping_address TEXT,
    shipping_city VARCHAR(100),
    shipping_zip VARCHAR(20),
    shipping_country VARCHAR(100),
    payment_method VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Rendelési tételek
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Admin felhasználó (jelszó: admin123)
INSERT INTO users (name, email, password, is_admin) VALUES ('Admin', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1);

-- Minta kategóriák
INSERT INTO categories (name, description) VALUES ('Elektronika', 'Műszaki cikkek');
INSERT INTO categories (name, description) VALUES ('Ruha', 'Divat és ruházat');
INSERT INTO categories (name, description) VALUES ('Könyvek', 'Olvasnivaló');

-- Minta termékek (image_url ideiglenes, később a galériából frissül)
INSERT INTO products (name, description, price, stock, image_url, category_id) VALUES 
('Okostelefon', 'Legújabb modell', 120000, 50, NULL, 1),
('Laptop', 'Nagy teljesítmény', 350000, 30, NULL, 1),
('Póló', 'Pamut póló', 5000, 100, NULL, 2),
('Farmer', 'Kék farmer', 15000, 75, NULL, 2),
('Regény', 'Sikerkönyv', 4000, 200, NULL, 3);