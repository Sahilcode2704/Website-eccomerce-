import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingCart, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../hooks/useCart';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!isOpen || !product) return null;

  const currentPrice = product.sale_price || product.price;
  const hasDiscount = !!product.sale_price;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock_quantity) {
      setQuantity(newQuantity);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-4 md:inset-8 bg-white rounded-lg z-50 overflow-hidden shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold">Product Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid md:grid-cols-2 gap-8 p-6">
              {/* Product Images */}
              <div className="space-y-4">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={product.images[selectedImageIndex] || 'https://images.pexels.com/photos/1275229/pexels-photo-1275229.jpeg'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {product.images.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                          selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                    <span className="text-gray-600">(4.8) • 124 reviews</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>

                {/* Price */}
                <div className="border-t border-b py-4">
                  <div className="flex items-center space-x-4 mb-2">
                    <span className="text-3xl font-bold text-gray-900">
                      ${currentPrice.toFixed(2)}
                    </span>
                    {hasDiscount && (
                      <>
                        <span className="text-xl text-gray-500 line-through">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                          {Math.round(((product.price - currentPrice) / product.price) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-green-600 font-medium">
                    {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                  </p>
                </div>

                {/* Quantity & Add to Cart */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="font-medium">Quantity:</label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-medium">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity === 0}
                    className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>{product.stock_quantity > 0 ? `Add ${quantity} to Cart` : 'Out of Stock'}</span>
                  </button>
                </div>

                {/* Features */}
                <div className="space-y-4 pt-6 border-t">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Truck className="w-5 h-5" />
                    <span>Free shipping on orders over $50</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Shield className="w-5 h-5" />
                    <span>Secure checkout & payment protection</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <RotateCcw className="w-5 h-5" />
                    <span>30-day return policy</span>
                  </div>
                </div>

                {/* Product Details */}
                <div className="pt-6 border-t">
                  <h3 className="font-semibold mb-2">Product Details</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>SKU:</strong> {product.sku}</p>
                    <p><strong>Category:</strong> {product.category?.name}</p>
                    {product.seo_title && <p><strong>Brand:</strong> ShopPro</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};