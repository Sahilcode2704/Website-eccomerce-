/*
  # E-commerce Database Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `image_url` (text)
      - `slug` (text, unique)
      - `created_at` (timestamp)
    
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `sale_price` (numeric, optional)
      - `sku` (text, unique)
      - `stock_quantity` (integer)
      - `category_id` (uuid, foreign key)
      - `images` (jsonb array)
      - `slug` (text, unique)
      - `featured` (boolean)
      - `status` (text, active/inactive)
      - `seo_title` (text)
      - `seo_description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `customers`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `phone` (text)
      - `created_at` (timestamp)
    
    - `addresses`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key)
      - `type` (text, billing/shipping)
      - `first_name` (text)
      - `last_name` (text)
      - `company` (text)
      - `address_line_1` (text)
      - `address_line_2` (text)
      - `city` (text)
      - `state` (text)
      - `postal_code` (text)
      - `country` (text)
      - `is_default` (boolean)
    
    - `orders`
      - `id` (uuid, primary key)
      - `order_number` (text, unique)
      - `customer_id` (uuid, foreign key)
      - `status` (text)
      - `total_amount` (numeric)
      - `subtotal` (numeric)
      - `tax_amount` (numeric)
      - `shipping_amount` (numeric)
      - `billing_address` (jsonb)
      - `shipping_address` (jsonb)
      - `payment_status` (text)
      - `payment_method` (text)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `quantity` (integer)
      - `price` (numeric)
      - `total` (numeric)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and admin access
*/

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  sale_price numeric(10,2),
  sku text UNIQUE NOT NULL,
  stock_quantity integer DEFAULT 0,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  images jsonb DEFAULT '[]'::jsonb,
  slug text UNIQUE NOT NULL,
  featured boolean DEFAULT false,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  seo_title text,
  seo_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('billing', 'shipping')),
  first_name text NOT NULL,
  last_name text NOT NULL,
  company text,
  address_line_1 text NOT NULL,
  address_line_2 text,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL DEFAULT 'US',
  is_default boolean DEFAULT false
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount numeric(10,2) NOT NULL,
  subtotal numeric(10,2) NOT NULL,
  tax_amount numeric(10,2) DEFAULT 0,
  shipping_amount numeric(10,2) DEFAULT 0,
  billing_address jsonb NOT NULL,
  shipping_address jsonb NOT NULL,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric(10,2) NOT NULL,
  total numeric(10,2) NOT NULL
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public read access for categories and active products
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read active products" ON products FOR SELECT USING (status = 'active');

-- Customers can read/update their own data
CREATE POLICY "Customers read own data" ON customers FOR SELECT USING (auth.jwt() ->> 'email' = email);
CREATE POLICY "Customers update own data" ON customers FOR UPDATE USING (auth.jwt() ->> 'email' = email);

-- Customers can manage their own addresses
CREATE POLICY "Customers manage own addresses" ON addresses FOR ALL USING (
  EXISTS (
    SELECT 1 FROM customers 
    WHERE id = addresses.customer_id 
    AND email = auth.jwt() ->> 'email'
  )
);

-- Customers can read their own orders
CREATE POLICY "Customers read own orders" ON orders FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM customers 
    WHERE id = orders.customer_id 
    AND email = auth.jwt() ->> 'email'
  )
);

-- Order items are readable with orders
CREATE POLICY "Read order items" ON order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE o.id = order_items.order_id
    AND (c.email = auth.jwt() ->> 'email' OR auth.role() = 'authenticated')
  )
);

-- Insert sample data
INSERT INTO categories (name, description, slug) VALUES
  ('Electronics', 'Latest electronic devices and gadgets', 'electronics'),
  ('Clothing', 'Fashion and apparel for all occasions', 'clothing'),
  ('Home & Garden', 'Everything for your home and garden', 'home-garden'),
  ('Sports & Outdoors', 'Sports equipment and outdoor gear', 'sports-outdoors');

INSERT INTO products (name, description, price, sale_price, sku, stock_quantity, category_id, slug, featured, seo_title, seo_description, images) VALUES
  (
    'Wireless Bluetooth Headphones',
    'Premium quality wireless headphones with noise cancellation and 30-hour battery life.',
    299.99,
    249.99,
    'WBH-001',
    50,
    (SELECT id FROM categories WHERE slug = 'electronics'),
    'wireless-bluetooth-headphones',
    true,
    'Premium Wireless Bluetooth Headphones - Noise Cancelling',
    'Shop premium wireless Bluetooth headphones with advanced noise cancellation technology and extended battery life.',
    '["https://images.pexels.com/photos/3587478/pexels-photo-3587478.jpeg"]'::jsonb
  ),
  (
    'Smart Fitness Watch',
    'Advanced fitness tracking watch with heart rate monitor, GPS, and smartphone connectivity.',
    199.99,
    NULL,
    'SFW-002',
    75,
    (SELECT id FROM categories WHERE slug = 'electronics'),
    'smart-fitness-watch',
    true,
    'Smart Fitness Watch with GPS & Heart Rate Monitor',
    'Track your fitness goals with our advanced smart watch featuring GPS, heart rate monitoring, and smartphone integration.',
    '["https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg"]'::jsonb
  ),
  (
    'Casual Cotton T-Shirt',
    'Comfortable 100% organic cotton t-shirt available in multiple colors and sizes.',
    29.99,
    24.99,
    'CCT-003',
    200,
    (SELECT id FROM categories WHERE slug = 'clothing'),
    'casual-cotton-t-shirt',
    false,
    'Organic Cotton T-Shirt - Comfortable & Sustainable',
    'Shop our comfortable organic cotton t-shirts, perfect for casual wear and available in various colors.',
    '["https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg"]'::jsonb
  ),
  (
    'Modern Coffee Table',
    'Sleek modern coffee table with tempered glass top and solid wood base.',
    449.99,
    399.99,
    'MCT-004',
    25,
    (SELECT id FROM categories WHERE slug = 'home-garden'),
    'modern-coffee-table',
    true,
    'Modern Glass Coffee Table with Wood Base',
    'Enhance your living space with our stylish modern coffee table featuring tempered glass and solid wood construction.',
    '["https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg"]'::jsonb
  ),
  (
    'Yoga Mat Premium',
    'Non-slip premium yoga mat with extra cushioning for comfort during practice.',
    79.99,
    NULL,
    'YMP-005',
    100,
    (SELECT id FROM categories WHERE slug = 'sports-outdoors'),
    'yoga-mat-premium',
    false,
    'Premium Non-Slip Yoga Mat - Extra Comfort & Grip',
    'Experience ultimate comfort with our premium yoga mat featuring non-slip surface and extra cushioning.',
    '["https://images.pexels.com/photos/1884454/pexels-photo-1884454.jpeg"]'::jsonb
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_addresses_customer_id ON addresses(customer_id);