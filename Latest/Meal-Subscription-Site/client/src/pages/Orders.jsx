import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showCompletionTimeModal, setShowCompletionTimeModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [completionTime, setCompletionTime] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const restaurantId = user?.id;

        if (!restaurantId) {
          setError("User ID missing. Please log in again.");
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        const { data } = await axiosInstance.get(
          `/api/orders/restaurant/${restaurantId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // NEW — separate arrays
        const upcomingOrders = data.filter(
          (order) => order.status === "pending" || order.status === "accepted"
        );

        const completed = data.filter((order) => order.status === "completed");

        setOrders(upcomingOrders);
        setCompletedOrders(completed);

      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Failed to fetch orders. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleAcceptOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setShowCompletionTimeModal(true);
  };

  const submitAcceptOrder = async () => {
    if (!completionTime) {
      alert("Please provide completion time");
      return;
    }

    setUpdatingId(selectedOrderId);
    const token = localStorage.getItem("token");

    try {
      await axiosInstance.patch(
        `/api/orders/${selectedOrderId}/status`,
        { status: "accepted", completionTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) =>
        prev.map((order) =>
          order._id === selectedOrderId ? { ...order, status: "accepted" } : order
        )
      );

      setShowCompletionTimeModal(false);
      setCompletionTime("");
      setSelectedOrderId(null);
      alert("Order accepted successfully!");
    } catch (err) {
      console.error("Failed to accept order:", err);
      alert(err.response?.data?.message || "Failed to accept order. Try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const updateStatus = async (orderId, currentStatus) => {
    setUpdatingId(orderId);
    const token = localStorage.getItem("token");

    try {
      if (currentStatus === "accepted") {
        await axiosInstance.patch(
          `/api/orders/${orderId}/status`,
          { status: "completed" },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Remove from upcoming, add to completed
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
        setCompletedOrders((prev) => [
          ...prev,
          { ...prev.find((o) => o._id === orderId), status: "completed" },
        ]);
      }
    } catch (err) {
      console.error("Failed to update order:", err);
      alert("Failed to update order. Try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const rejectOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to reject this order?")) return;

    setUpdatingId(orderId);
    const token = localStorage.getItem("token");

    try {
      await axiosInstance.delete(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (err) {
      console.error("Failed to reject order:", err);
      alert("Failed to reject order. Try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const displayList = showCompleted ? completedOrders : orders;

  if (loading) return <p className="p-6 text-center">Loading...</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;

  return (
    <div className="p-6 pt-24">

      {/*  Toggle Button  */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg"
        >
          {showCompleted ? "Show Upcoming Orders" : "Show Completed Orders"}
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-4">
        {showCompleted ? "Completed Orders" : "Upcoming Orders"}
      </h2>

      {displayList.length === 0 && (
        <p className="p-6 text-center">
          {showCompleted ? "No completed orders." : "No upcoming orders."}
        </p>
      )}

      <div className="space-y-4">
        {displayList.map((order) => {
          const deliveryDate = order.deliveryDateTime
            ? new Date(order.deliveryDateTime).toLocaleDateString()
            : "N/A";

          const deliveryTime = order.deliveryDateTime
            ? new Date(order.deliveryDateTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
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
                    {item.itemId?.name} — Qty: {item.quantity} — {item.price} BDT
                  </li>
                ))}
              </ul>

              <p className="mt-2 text-sm text-gray-600">
                Ordered At: {new Date(order.createdAt).toLocaleString()}
              </p>

              {!showCompleted && (
                <div className="flex gap-2 mt-2">
                  {order.status === "pending" ? (
                    <>
                      <button
                        onClick={() => handleAcceptOrder(order._id)}
                        disabled={updatingId === order._id}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Accept Order
                      </button>
                      <button
                        onClick={() => rejectOrder(order._id)}
                        disabled={updatingId === order._id}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Reject Order
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => updateStatus(order._id, order.status)}
                      disabled={updatingId === order._id}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Time Modal */}
      {showCompletionTimeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Set Completion Time</h3>
            <p className="text-gray-600 mb-4">
              When will this order be ready for pickup?
            </p>
            <input
              type="datetime-local"
              value={completionTime}
              onChange={(e) => setCompletionTime(e.target.value)}
              className="w-full px-4 py-2 border rounded mb-4"
              min={new Date().toISOString().slice(0, 16)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowCompletionTimeModal(false);
                  setCompletionTime("");
                  setSelectedOrderId(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={submitAcceptOrder}
                disabled={!completionTime || updatingId === selectedOrderId}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {updatingId === selectedOrderId ? "Accepting..." : "Accept Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
