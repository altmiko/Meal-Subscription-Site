import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FALLBACK_IMAGE =
  "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800";

export default function FloatingCart() {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [user, setUser] = useState(null);

  // Check if user is a customer
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

  // Listen for cart changes
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("cart");
      if (saved) {
        setCart(JSON.parse(saved));
      } else {
        setCart([]);
      }
    };

    // Listen for storage events (when cart changes in other tabs/components)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom cart update event
    window.addEventListener('cartUpdated', handleStorageChange);

    // Check cart on mount and periodically
    const interval = setInterval(handleStorageChange, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Don't show if user is not a customer
  if (!user || user.role !== 'customer') {
    return null;
  }

  const totalPrice = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  const removeItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('cartUpdated'));
    // Also trigger storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', { key: 'cart' }));
  };

  const updateQuantity = (index, quantity) => {
    if (quantity < 1) {
      removeItem(index);
      return;
    }
    const newCart = cart.map((item, i) =>
      i === index ? { ...item, quantity } : item
    );
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
    // Also trigger storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', { key: 'cart' }));
  };

  return (
    <div className="fixed right-2 md:right-4 bottom-20 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-50 w-[calc(100vw-1rem)] md:w-80 max-w-sm max-h-[80vh] flex flex-col bg-white rounded-lg shadow-2xl border border-gray-200">
      {/* Header */}
      <div className="bg-emerald-600 text-white p-4 rounded-t-lg">
        <h3 className="font-bold text-lg">Your Cart</h3>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {cart.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto mb-2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p>Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item, index) => (
              <div
                key={index}
                className="border-b border-gray-200 pb-3 last:border-b-0"
              >
                <div className="flex gap-2">
                  <img
                    src={item.imageUrl || FALLBACK_IMAGE}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {item.day || "N/A"} • {item.mealType || "N/A"}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            updateQuantity(index, (item.quantity || 1) - 1)
                          }
                          className="bg-gray-200 hover:bg-gray-300 rounded px-1.5 py-0.5 text-xs"
                        >
                          -
                        </button>
                        <span className="text-xs px-1">{item.quantity || 1}</span>
                        <button
                          onClick={() =>
                            updateQuantity(index, (item.quantity || 1) + 1)
                          }
                          className="bg-gray-200 hover:bg-gray-300 rounded px-1.5 py-0.5 text-xs"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-sm font-bold text-emerald-700">
                        {(item.price || 0) * (item.quantity || 1)} BDT
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-500 text-xs mt-1 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {cart.length > 0 && (
        <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold text-gray-900">Total:</span>
            <span className="text-lg font-bold text-emerald-700">
              {totalPrice.toFixed(2)} BDT
            </span>
          </div>
          <Link
            to="/cart"
            className="block w-full bg-emerald-600 text-white text-center py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
          >
            View Cart & Checkout
          </Link>
        </div>
      )}
    </div>
  );
}

