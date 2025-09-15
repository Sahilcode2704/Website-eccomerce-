import { supabase } from '../lib/supabase';
import { Category, Product, Order, OrderItem, Customer, CheckoutData } from '../types';

export const api = {
  // Categories
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  // Products
  async getProducts(filters?: {
    category?: string;
    featured?: boolean;
    limit?: number;
    search?: string;
  }): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('status', 'active');

    if (filters?.category) {
      query = query.eq('category_id', filters.category);
    }

    if (filters?.featured) {
      query = query.eq('featured', true);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  async getProduct(slug: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  // Orders
  async createOrder(orderData: {
    customer: Partial<Customer>;
    items: Array<{ product_id: string; quantity: number; price: number }>;
    addresses: { billing: any; shipping: any };
    totals: { subtotal: number; tax: number; shipping: number; total: number };
    payment_method: string;
  }): Promise<Order> {
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create or get customer
    let customer: Customer;
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('*')
      .eq('email', orderData.customer.email!)
      .single();

    if (existingCustomer) {
      customer = existingCustomer;
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          email: orderData.customer.email!,
          first_name: orderData.customer.first_name!,
          last_name: orderData.customer.last_name!,
          phone: orderData.customer.phone,
        })
        .select()
        .single();

      if (customerError) throw customerError;
      customer = newCustomer;
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: customer.id,
        status: 'pending',
        total_amount: orderData.totals.total,
        subtotal: orderData.totals.subtotal,
        tax_amount: orderData.totals.tax,
        shipping_amount: orderData.totals.shipping,
        billing_address: orderData.addresses.billing,
        shipping_address: orderData.addresses.shipping,
        payment_status: 'pending',
        payment_method: orderData.payment_method,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return order;
  },

  async getOrder(orderNumber: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        order_items(
          *,
          product:products(*)
        )
      `)
      .eq('order_number', orderNumber)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },
};