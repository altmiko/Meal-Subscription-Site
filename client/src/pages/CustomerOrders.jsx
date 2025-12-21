import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axios";

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [tracking, setTracking] = useState({}); // orderId -> tracking info

  const formatDeliveryAddress = (address) => {
    if (!address) return "";
    const house = String(address.house ?? "").trim();
    const road = String(address.road ?? "").trim();
    const area = String(address.area ?? "").trim();
    const city = String(address.city ?? "").trim();

    const houseRoad =
      house && road
        ? /^\d+$/.test(house) && /^\d+$/.test(road)
          ? `${house}/${road}`
          : `${house} ${road}`
        : house || road;

    return [houseRoad, area, city].filter(Boolean).join(", ");
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");
        
        if (!user) {
          setError("Please log in to view your orders.");
          setLoading(false);
          return;
        }

        if (!token) {
          setError("Authentication token not found. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await axiosInstance.get("/api/orders/my");
        setOrders(response.data || []);
        setError(""); // Clear any previous errors
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        console.error("Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          statusText: err.response?.statusText,
        });

        // Provide more specific error messages
        if (err.response?.status === 401) {
          setError("Authentication failed. Please log in again.");
        } else if (err.response?.status === 404) {
          setError("Orders endpoint not found. Please check the server configuration.");
        } else if (err.response?.data?.message) {
          setError(`Failed to fetch orders: ${err.response.data.message}`);
        } else if (err.message === "Network Error" || err.code === "ECONNREFUSED") {
          setError("Cannot connect to server. Please check if the server is running.");
        } else {
          setError(`Failed to fetch orders: ${err.message || "Try again later."}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    
    setUpdatingId(orderId);
    try {
      // Update order status to cancelled (backend will handle refund if needed)
      await axiosInstance.patch(`/api/orders/${orderId}/status`, {
        status: "cancelled",
      });

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: "cancelled" } : order
        )
      );
      alert("Order cancelled successfully. Refund processed if applicable.");
    } catch (err) {
      console.error("Failed to cancel order:", err.response?.data || err);
      alert("Failed to cancel order. Try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const fetchTracking = async (orderId) => {
    try {
      // Here we assume a 1:1 relation between order and delivery with the same id or mapped in backend.
      // In a real system you'd look up delivery by order, but for this demo we call /api/deliveries/:id/track
      const { data } = await axiosInstance.get(`/api/deliveries/${orderId}/track`);
      setTracking((prev) => ({ ...prev, [orderId]: data }));
    } catch (err) {
      console.error("Failed to fetch tracking:", err);
      alert("Tracking information not available yet.");
    }
  };

  if (loading) return <p className="p-6 text-center text-gray-600">Loading orders...</p>;
  if (error) return <p className="p-6 text-center text-red-500 font-semibold">{error}</p>;

  const upcomingOrders = orders.filter(o => o.status === "pending" || o.status === "accepted");
  const previousOrders = orders.filter(o => o.status === "completed");

  const renderOrderCard = (order) => {
    const _deliveryDate = order.deliveryDateTime
      ? new Date(order.deliveryDateTime).toLocaleDateString()
      : "N/A";
    const _deliveryTime = order.deliveryDateTime
      ? new Date(order.deliveryDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "N/A";
    void _deliveryDate;
    void _deliveryTime;

    const trackingInfo = tracking[order._id];
    const hasDelivery = order.delivery && order.delivery.status;

    return (
      <div key={order._id} className="border rounded-lg p-4 bg-white shadow">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-semibold text-lg">Order #{order._id.slice(-6)}</p>
            <p className="text-sm text-gray-600">
              {order.restaurantId?.name || "Restaurant"}
            </p>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            order.status === "completed" ? "bg-green-100 text-green-800" :
            order.status === "accepted" ? "bg-blue-100 text-blue-800" :
            order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
            "bg-red-100 text-red-800"
          }`}>
            {order.status.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-1 mb-3 text-sm">
          <div>
            <span className="font-medium text-gray-600">Total:</span>{" "}
            <span className="font-semibold">{order.total} tk</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Payment:</span>{" "}
            {order.payment ? (
              <span
                className={`${
                  order.payment.status === "success" ? "text-green-600" : "text-yellow-600"
                }`}
              >
                {order.payment.status === "success"
                  ? "Successfull"
                  : `${order.payment.method} (${order.payment.status})`}
              </span>
            ) : (
              <span className="text-gray-400">Pending</span>
            )}
          </div>
        </div>

        <p className="text-gray-700 text-sm mb-2">
          <span className="font-medium">Delivery Time:</span>{" "}
          {order.delivery && order.delivery.status === "delivered"
            ? new Date(order.delivery.updatedAt).toLocaleString()
            : "Not delivered yet"}
        </p>

        {order.delivery && (
          <div className="mb-2 p-2 bg-white rounded text-sm">
            <p className="font-medium text-gray-700">Delivery Status:</p>
            <p className="text-gray-600">
              <span className={`font-semibold ${
                order.delivery.status === "unassigned" ? "text-yellow-600" :
                order.delivery.status === "assigned" ? "text-blue-600" :
                order.delivery.status === "picked_up" ? "text-purple-600" :
                order.delivery.status === "on_the_way" ? "text-indigo-600" :
                order.delivery.status === "delivered" ? "text-green-600" :
                "text-gray-600"
              }`}>
                {order.delivery.status === "unassigned" ? "UNASSIGNED" :
                 order.delivery.status === "assigned" ? "ASSIGNED" :
                 order.delivery.status.replace("_", " ").toUpperCase()}
              </span>
              {order.delivery.deliveryStaff && (
                <span className="ml-2">• Staff: {order.delivery.deliveryStaff.name}</span>
              )}
              {order.delivery.status === "unassigned" && (
                <span className="ml-2 text-yellow-600">(Waiting for delivery staff)</span>
              )}
            </p>
            {order.delivery.address && (
              <p className="text-gray-600 mt-1">
                {formatDeliveryAddress(order.delivery.address)}
              </p>
            )}
            {order.delivery.deliveryStaff?._id && order.delivery.status === "delivered" && (
              <div className="mt-2">
                <Link
                  to={`/delivery-staff/${order.delivery.deliveryStaff._id}/add-review/${order._id}`}
                  className="inline-block px-3 py-1 bg-amber-500 text-white rounded text-sm hover:bg-amber-600"
                >
                  Rate Delivery Staff
                </Link>
              </div>
            )}
          </div>
        )}

        <h4 className="mt-3 font-semibold text-sm">Items:</h4>
        <ul className="list-disc ml-5 text-sm text-gray-700">
          {order.items.map((item, i) => (
            <li key={i}>
              {item.itemId?.name || "Item"} — Qty: {item.quantity} — {item.price} BDT
            </li>
          ))}
        </ul>

        <p className="mt-2 text-xs text-gray-500">
          Ordered: {new Date(order.createdAt).toLocaleString()}
        </p>

        {/* Tracking section */}
        {hasDelivery && (
          <div className="mt-3 pt-3 border-t">
            <button
              onClick={() => fetchTracking(order._id)}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 transition"
            >
              {trackingInfo ? "Refresh Tracking" : "Track Delivery"}
            </button>
            {trackingInfo && (
              <div className="mt-2 text-sm text-gray-700 border rounded p-3 bg-white">
                <p className="font-semibold mb-1">Live Tracking:</p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <span className="capitalize">{trackingInfo.status?.replace("_", " ")}</span>
                </p>
                {trackingInfo.deliveryAddress && (
                  <p className="mt-1">
                    <span className="font-medium">Delivery Address:</span>{" "}
                    {formatDeliveryAddress(trackingInfo.deliveryAddress)}
                  </p>
                )}
                {trackingInfo.deliveryStaff && (
                  <p className="mt-1">
                    <span className="font-medium">Delivery Staff:</span> {trackingInfo.deliveryStaff.name}
                    {trackingInfo.deliveryStaff.phone && ` • ${trackingInfo.deliveryStaff.phone}`}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Cancel button for pending orders */}
        {order.status === "pending" && (
          <button
            onClick={() => cancelOrder(order._id)}
            disabled={updatingId === order._id}
            className="mt-3 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition text-sm"
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
