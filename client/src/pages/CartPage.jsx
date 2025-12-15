import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";

const FALLBACK_IMAGE =
  "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800";

const CartPage = () => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const removeItem = (index) => setCart((prev) => prev.filter((_, i) => i !== index));
  const clearCart = () => setCart([]);

  const updateQuantity = (index, quantity) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity } : item))
    );
  };

  // Update delivery hour
  const toggleDeliveryHour = (index) => {
    setCart((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        // Default hour if undefined
        const currentHour = item.deliveryHour ?? (item.mealType === "lunch" ? 13 : 20);

        // Toggle lunch: 13 <-> 14, dinner: 20 <-> 21
        const newHour =
          item.mealType === "lunch"
            ? currentHour === 13
              ? 14
              : 13
            : currentHour === 20
            ? 21
            : 20;

        return { ...item, deliveryHour: newHour };
      })
    );
  };

  const totalPrice = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user || user.role !== "customer") {
      alert("You must be logged in as a customer to place an order.");
      return;
    }

    try {
      setLoading(true);

      for (const item of cart) {
        if (!item._id || !item.restaurant) continue;

        // Fixed date + selected delivery hour
        const deliveryDateTime = new Date(item.date);
        deliveryDateTime.setHours(item.deliveryHour ?? (item.mealType === "lunch" ? 13 : 20), 0, 0, 0);

        const orderData = {
          restaurantId: item.restaurant,
          items: [
            {
              itemId: item._id,
              quantity: item.quantity || 1,
              price: item.price,
              mealType: item.mealType || "lunch",
              day: item.day || null,
            },
          ],
          total: (item.price || 0) * (item.quantity || 1),
          deliveryDateTime,
        };

        await axiosInstance.post("/api/orders", orderData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      alert("All orders have been placed successfully!");
      clearCart();
    } catch (err) {
      console.error("Checkout failed:", err.response?.data || err);
      alert("Failed to place one or more orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 pt-24">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
        <p className="text-gray-600">Add some delicious meals to your cart!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Cart</h2>

        <div className="space-y-4">
          {cart.map((item, index) => {
            const hour = item.deliveryHour ?? (item.mealType === "lunch" ? 13 : 20);
            const formattedTime = `${hour}:00`;

            return (
              <div key={index} className="flex flex-col md:flex-row items-center justify-between border-b pb-4 gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={item.imageUrl || FALLBACK_IMAGE}
                    alt={item.name}
                    className="w-24 h-20 object-cover rounded-lg"
                  />
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>

                    <p className="text-gray-500 text-sm mt-1">
                      <span className="font-medium">Day:</span> {item.day || "N/A"} &nbsp;|&nbsp;
                      <span className="font-medium">Date:</span>{" "}
                      {item.date ? new Date(item.date).toLocaleDateString() : "N/A"} &nbsp;|&nbsp;
                      <span className="font-medium">Meal Type:</span> {item.mealType || "N/A"}
                    </p>

                    <div className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                      <span className="font-medium">Delivery Time:</span>
                      <button
                        onClick={() => toggleDeliveryHour(index)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        {formattedTime}
                      </button>
                      <span className="text-xs text-gray-400">(click to toggle)</span>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(index, (item.quantity || 1) - 1)}
                        className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="px-2">{item.quantity || 1}</span>
                      <button
                        onClick={() => updateQuantity(index, (item.quantity || 1) + 1)}
                        className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-lg font-bold text-emerald-700">
                    {(item.price || 0) * (item.quantity || 1)} BDT
                  </p>
                  <button
                    onClick={() => removeItem(index)}
                    className="text-red-500 text-sm mt-1 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <button
            onClick={clearCart}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-semibold"
          >
            Clear Cart
          </button>
          <p className="text-xl font-bold text-gray-900">Total: {totalPrice} BDT</p>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold disabled:opacity-50"
          >
            {loading ? "Placing Order..." : "Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
