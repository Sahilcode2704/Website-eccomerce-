export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  slug: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  sale_price?: number;
  sku: string;
  stock_quantity: number;
  category_id?: string;
  images: string[];
  slug: string;
  featured: boolean;
  status: 'active' | 'inactive';
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: string;
}

export interface Address {
  id: string;
  customer_id: string;
  type: 'billing' | 'shipping';
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  billing_address: Address;
  shipping_address: Address;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  total: number;
  product?: Product;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CheckoutData {
  customer: Partial<Customer>;
  billing_address: Partial<Address>;
  shipping_address: Partial<Address>;
  payment_method: string;
  same_as_billing: boolean;
}