import express from "express";
import Order from "../models/Order.js";
import jwt from "jsonwebtoken";

const router = express.Router();

/* ----------------------------------
   Middleware: Protect Routes
---------------------------------- */
const protect = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
    if (!token) return res.status(401).json({ message: "Unauthorized: No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

/* ----------------------------------
   POST /api/orders
   Create a new order with delivery date & time
---------------------------------- */
router.post("/", protect, async (req, res) => {
  try {
    const { restaurantId, items, total, deliveryDateTime } = req.body;

    if (!restaurantId || !items || !items.length || !total || !deliveryDateTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Convert deliveryDateTime to Date object
    const deliveryDate = new Date(deliveryDateTime);

    const order = new Order({
      restaurantId,
      userId: req.userId, // always from JWT
      items,
      total,
      status: "pending",
      deliveryDateTime: deliveryDate,
    });

    const saved = await order.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
});

/* ----------------------------------
   GET /api/orders/user/:userId
---------------------------------- */
router.get("/user/:userId", protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("items.itemId", "name price");

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user orders" });
  }
});

/* ----------------------------------
   GET /api/orders/restaurant/:restaurantId
---------------------------------- */
router.get("/restaurant/:restaurantId", protect, async (req, res) => {
  try {
    const orders = await Order.find({ restaurantId: req.params.restaurantId })
      .populate("userId", "name email phone")  // customer info
      .populate("items.itemId", "name price"); // menu item info

    res.json(orders);
  } catch (err) {
    console.error("Error fetching restaurant orders:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ----------------------------------
   PATCH /api/orders/:orderId/status
---------------------------------- */
router.patch("/:orderId/status", protect, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!["pending", "accepted", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (error) {
    console.error("Failed to update order status:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
});


router.delete("/:orderId", protect, async (req, res) => {
  const { orderId } = req.params;
  try {
    const deleted = await Order.findByIdAndDelete(orderId);
    if (!deleted) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete order" });
  }
});

export default router;
