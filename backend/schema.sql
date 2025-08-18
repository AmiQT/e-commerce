-- E-commerce Database Schema

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create shopping_cart table
CREATE TABLE IF NOT EXISTS shopping_cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price_at_time DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Insert sample data for StyleHub Fashion E-commerce
INSERT INTO categories (name, description) VALUES 
    ('New Arrivals', 'Latest fashion trends and new releases'),
    ('Men', 'Men\'s clothing and accessories'),
    ('Women', 'Women\'s fashion and style'),
    ('Accessories', 'Fashion accessories and jewelry'),
    ('Sale', 'Discounted fashion items');

INSERT INTO products (name, description, price, stock, category_id, image_url) VALUES 
    ('Classic White Sneakers', 'Versatile white sneakers perfect for any outfit', 89.99, 75, 1, 'https://via.placeholder.com/300x300?text=White+Sneakers'),
    ('Denim Jacket', 'Timeless denim jacket with modern fit', 129.99, 45, 2, 'https://via.placeholder.com/300x300?text=Denim+Jacket'),
    ('Floral Summer Dress', 'Beautiful floral print dress perfect for summer', 79.99, 60, 3, 'https://via.placeholder.com/300x300?text=Summer+Dress'),
    ('Leather Crossbody Bag', 'Stylish leather bag with adjustable strap', 149.99, 35, 4, 'https://via.placeholder.com/300x300?text=Leather+Bag'),
    ('Premium Cotton T-Shirt', 'Soft cotton t-shirt in multiple colors', 29.99, 120, 2, 'https://via.placeholder.com/300x300?text=Cotton+T-Shirt'),
    ('Designer Sunglasses', 'Trendy sunglasses with UV protection', 199.99, 25, 4, 'https://via.placeholder.com/300x300?text=Sunglasses'),
    ('High-Waist Jeans', 'Fashionable high-waist jeans for women', 99.99, 55, 3, 'https://via.placeholder.com/300x300?text=High+Waist+Jeans'),
    ('Casual Blazer', 'Professional yet casual blazer for men', 179.99, 40, 2, 'https://via.placeholder.com/300x300?text=Casual+Blazer');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_shopping_cart_user ON shopping_cart(user_id);
