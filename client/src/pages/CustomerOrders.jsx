import { useEffect, useState } from "react";
import axiosInstance from "../api/axios";

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.id;

        if (!userId) {
          setError("User ID missing. Please log in again.");
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        const { data } = await axiosInstance.get(
          `/api/orders/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setOrders(data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Failed to fetch orders. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const cancelOrder = async (orderId) => {
    setUpdatingId(orderId);
    const token = localStorage.getItem("token");

    try {
      // Option 1: If your backend supports DELETE
      await axiosInstance.delete(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove from local state
      setOrders((prev) => prev.filter((order) => order._id !== orderId));
    } catch (err) {
      console.error("Failed to cancel order:", err.response?.data || err);
      alert("Failed to cancel order. Try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <p className="p-6 text-center text-gray-600">Loading orders...</p>;
  if (error) return <p className="p-6 text-center text-red-500 font-semibold">{error}</p>;

  const upcomingOrders = orders.filter(o => o.status === "pending" || o.status === "accepted");
  const previousOrders = orders.filter(o => o.status === "completed");

  const renderOrderCard = (order) => {
    const deliveryDate = order.deliveryDateTime
      ? new Date(order.deliveryDateTime).toLocaleDateString()
      : "N/A";
    const deliveryTime = order.deliveryDateTime
      ? new Date(order.deliveryDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "N/A";

    return (
      <div key={order._id} className="border rounded-lg p-4 bg-white shadow">
        <p className="font-semibold">Order ID: {order._id}</p>
        <p>Status: {order.status}</p>
        <p>Total: {order.total} BDT</p>
        <p className="text-gray-700">
          <span className="font-medium">Delivery Date:</span> {deliveryDate} <br />
          <span className="font-medium">Delivery Time:</span> {deliveryTime}
        </p>

        <h4 className="mt-2 font-semibold">Items:</h4>
        <ul className="list-disc ml-5">
          {order.items.map((item, i) => (
            <li key={i}>
              {item.itemId?.name || "Item"} — Qty: {item.quantity} — {item.price} BDT
            </li>
          ))}
        </ul>

        <p className="mt-2 text-sm text-gray-600">
          Ordered At: {new Date(order.createdAt).toLocaleString()}
        </p>

        {/* Cancel button for pending orders */}
        {order.status === "pending" && (
          <button
            onClick={() => cancelOrder(order._id)}
            disabled={updatingId === order._id}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {updatingId === order._id ? "Cancelling..." : "Cancel Order"}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 pt-24">
      <h2 className="text-2xl font-bold mb-4">Upcoming Orders</h2>
      {upcomingOrders.length > 0 ? (
        <div className="space-y-4">
          {upcomingOrders.map(renderOrderCard)}
        </div>
      ) : (
        <p className="text-gray-600">No upcoming orders.</p>
      )}

      <h2 className="text-2xl font-bold mt-10 mb-4">Previous Orders</h2>
      {previousOrders.length > 0 ? (
        <div className="space-y-4">
          {previousOrders.map(renderOrderCard)}
        </div>
      ) : (
        <p className="text-gray-600">No previous orders.</p>
      )}
    </div>
  );
};

export default CustomerOrders;
