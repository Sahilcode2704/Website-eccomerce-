import React, { useState } from 'react';
import { X, CreditCard, Truck, MapPin, User, Mail, Phone } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { api } from '../services/api';
import { CheckoutData } from '../types';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ isOpen, onClose }) => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const [formData, setFormData] = useState<CheckoutData>({
    customer: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
    },
    billing_address: {
      first_name: '',
      last_name: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
    },
    shipping_address: {
      first_name: '',
      last_name: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
    },
    payment_method: 'credit_card',
    same_as_billing: true,
  });

  if (!isOpen) return null;

  const subtotal = getCartTotal();
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 50 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  const handleInputChange = (section: keyof CheckoutData, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderData = {
        customer: formData.customer,
        items: cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.sale_price || item.product.price,
        })),
        addresses: {
          billing: formData.billing_address,
          shipping: formData.same_as_billing ? formData.billing_address : formData.shipping_address,
        },
        totals: {
          subtotal,
          tax,
          shipping,
          total,
        },
        payment_method: formData.payment_method,
      };

      const order = await api.createOrder(orderData);
      setOrderNumber(order.order_number);
      setOrderComplete(true);
      clearCart();
    } catch (error) {
      console.error('Order submission failed:', error);
      alert('Failed to process order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}></div>
        <div className="fixed inset-4 md:inset-8 bg-white rounded-lg z-50 overflow-hidden shadow-2xl flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-4">Your order number is: <strong>{orderNumber}</strong></p>
            <p className="text-gray-600 mb-6">You will receive a confirmation email shortly.</p>
            <button
              onClick={() => {
                setOrderComplete(false);
                onClose();
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}></div>
      <div className="fixed inset-4 md:inset-8 bg-white rounded-lg z-50 overflow-hidden shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold">Checkout</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8 p-6">
              {/* Checkout Form */}
              <div className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      required
                      value={formData.customer.first_name}
                      onChange={(e) => handleInputChange('customer', 'first_name', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      required
                      value={formData.customer.last_name}
                      onChange={(e) => handleInputChange('customer', 'last_name', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <input
                      type="email"
                      placeholder="Email"
                      required
                      value={formData.customer.email}
                      onChange={(e) => handleInputChange('customer', 'email', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={formData.customer.phone}
                      onChange={(e) => handleInputChange('customer', 'phone', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Billing Address */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Billing Address
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="First Name"
                        required
                        value={formData.billing_address.first_name}
                        onChange={(e) => handleInputChange('billing_address', 'first_name', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        required
                        value={formData.billing_address.last_name}
                        onChange={(e) => handleInputChange('billing_address', 'last_name', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Address Line 1"
                      required
                      value={formData.billing_address.address_line_1}
                      onChange={(e) => handleInputChange('billing_address', 'address_line_1', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Address Line 2 (Optional)"
                      value={formData.billing_address.address_line_2}
                      onChange={(e) => handleInputChange('billing_address', 'address_line_2', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="City"
                        required
                        value={formData.billing_address.city}
                        onChange={(e) => handleInputChange('billing_address', 'city', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        required
                        value={formData.billing_address.state}
                        onChange={(e) => handleInputChange('billing_address', 'state', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="ZIP Code"
                        required
                        value={formData.billing_address.postal_code}
                        onChange={(e) => handleInputChange('billing_address', 'postal_code', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg flex items-center">
                      <Truck className="w-5 h-5 mr-2" />
                      Shipping Address
                    </h3>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.same_as_billing}
                        onChange={(e) => handleInputChange('', 'same_as_billing', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Same as billing</span>
                    </label>
                  </div>
                  {!formData.same_as_billing && (
                    <div className="space-y-4">
                      {/* Add shipping address fields similar to billing */}
                      <p className="text-gray-600 text-sm">Shipping address fields would go here...</p>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Method
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 p-3 border rounded-md hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment_method"
                        value="credit_card"
                        checked={formData.payment_method === 'credit_card'}
                        onChange={(e) => handleInputChange('', 'payment_method', e.target.value)}
                      />
                      <span>Credit Card</span>
                    </label>
                    <label className="flex items-center space-x-2 p-3 border rounded-md hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment_method"
                        value="paypal"
                        checked={formData.payment_method === 'paypal'}
                        onChange={(e) => handleInputChange('', 'payment_method', e.target.value)}
                      />
                      <span>PayPal</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
                
                {/* Cart Items */}
                <div className="space-y-3 mb-6">
                  {cartItems.map((item) => {
                    const currentPrice = item.product.sale_price || item.product.price;
                    return (
                      <div key={item.product.id} className="flex items-center space-x-3 bg-white p-3 rounded">
                        <img
                          src={item.product.images[0] || 'https://images.pexels.com/photos/1275229/pexels-photo-1275229.jpeg'}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.product.name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">${(currentPrice * item.quantity).toFixed(2)}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {isSubmitting ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};