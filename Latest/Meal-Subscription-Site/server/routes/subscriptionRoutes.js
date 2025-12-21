import express from "express";
import jwt from "jsonwebtoken";
import Subscription from "../models/Subscription.js";
import { User } from "../models/User.js";
import { MenuItem } from "../models/MenuItem.js";
import Order from "../models/Order.js";

const router = express.Router();

// Middleware: Protect Routes
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized: No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("_id isActive role");
    if (!user) return res.status(401).json({ message: "Unauthorized: Invalid token" });
    if (user.isActive === false) return res.status(403).json({ message: "Account is disabled" });
    if (user.role !== "customer") return res.status(403).json({ message: "Only customers can manage subscriptions" });
    
    req.userId = user._id.toString();
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

// GET /api/subscriptions - Get user's subscriptions
router.get("/", protect, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.userId })
      .populate("restaurantId", "name")
      .populate("mealSelections.menuItemId", "name description imageUrl price")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: subscriptions });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({ success: false, message: "Failed to fetch subscriptions" });
  }
});

// POST /api/subscriptions - Create a new subscription
router.post("/", protect, async (req, res) => {
  try {
    const { restaurantId, mealSelections, planType = "weekly", isRepeating = true } = req.body;

    if (!restaurantId || !mealSelections || !Array.isArray(mealSelections) || mealSelections.length === 0) {
      return res.status(400).json({ success: false, message: "Restaurant ID and meal selections are required" });
    }

    // Validate meal selections
    for (const selection of mealSelections) {
      if (!selection.menuItemId || !selection.day || !selection.mealType || !selection.quantity) {
        return res.status(400).json({ success: false, message: "Each meal selection must have menuItemId, day, mealType, and quantity" });
      }
      
      // Fetch menu item to get current price
      const menuItem = await MenuItem.findById(selection.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ success: false, message: `Menu item ${selection.menuItemId} not found` });
      }
      
      selection.price = menuItem.price;
      selection.restaurantId = restaurantId;
    }

    const startDate = new Date();
    const endDate = isRepeating ? null : new Date(startDate);
    if (!isRepeating) {
      endDate.setDate(endDate.getDate() + 7); // One week if not repeating
    }

    const subscription = await Subscription.create({
      user: req.userId,
      restaurantId,
      planType,
      startDate,
      endDate,
      isRepeating,
      mealSelections,
      mealsPerWeek: mealSelections.length,
      status: "active",
    });

    const populated = await Subscription.findById(subscription._id)
      .populate("restaurantId", "name")
      .populate("mealSelections.menuItemId", "name description imageUrl price");

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ success: false, message: "Failed to create subscription" });
  }
});

// PATCH /api/subscriptions/:id/pause - Pause a subscription
router.patch("/:id/pause", protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ _id: req.params.id, user: req.userId });
    if (!subscription) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    if (subscription.status !== "active") {
      return res.status(400).json({ success: false, message: "Only active subscriptions can be paused" });
    }

    subscription.status = "paused";
    await subscription.save();

    const populated = await Subscription.findById(subscription._id)
      .populate("restaurantId", "name")
      .populate("mealSelections.menuItemId", "name description imageUrl price");

    res.json({ success: true, data: populated });
  } catch (error) {
    console.error("Error pausing subscription:", error);
    res.status(500).json({ success: false, message: "Failed to pause subscription" });
  }
});

// PATCH /api/subscriptions/:id/resume - Resume a paused subscription
router.patch("/:id/resume", protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ _id: req.params.id, user: req.userId });
    if (!subscription) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    if (subscription.status !== "paused") {
      return res.status(400).json({ success: false, message: "Only paused subscriptions can be resumed" });
    }

    subscription.status = "active";
    await subscription.save();

    const populated = await Subscription.findById(subscription._id)
      .populate("restaurantId", "name")
      .populate("mealSelections.menuItemId", "name description imageUrl price");

    res.json({ success: true, data: populated });
  } catch (error) {
    console.error("Error resuming subscription:", error);
    res.status(500).json({ success: false, message: "Failed to resume subscription" });
  }
});

// DELETE /api/subscriptions/:id - Cancel a subscription
router.delete("/:id", protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ _id: req.params.id, user: req.userId });
    if (!subscription) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    subscription.status = "cancelled";
    await subscription.save();

    res.json({ success: true, message: "Subscription cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    res.status(500).json({ success: false, message: "Failed to cancel subscription" });
  }
});

// PATCH /api/subscriptions/:id - Update subscription meal selections
router.patch("/:id", protect, async (req, res) => {
  try {
    const { mealSelections, isRepeating } = req.body;
    const subscription = await Subscription.findOne({ _id: req.params.id, user: req.userId });
    
    if (!subscription) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    if (subscription.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Cannot update cancelled subscription" });
    }

    if (mealSelections && Array.isArray(mealSelections)) {
      // Validate and update meal selections
      for (const selection of mealSelections) {
        if (!selection.menuItemId || !selection.day || !selection.mealType || !selection.quantity) {
          return res.status(400).json({ success: false, message: "Each meal selection must have menuItemId, day, mealType, and quantity" });
        }
        
        const menuItem = await MenuItem.findById(selection.menuItemId);
        if (!menuItem) {
          return res.status(404).json({ success: false, message: `Menu item ${selection.menuItemId} not found` });
        }
        
        selection.price = menuItem.price;
        selection.restaurantId = subscription.restaurantId;
      }
      
      subscription.mealSelections = mealSelections;
      subscription.mealsPerWeek = mealSelections.length;
    }

    if (isRepeating !== undefined) {
      subscription.isRepeating = isRepeating;
      if (!isRepeating && !subscription.endDate) {
        subscription.endDate = new Date();
        subscription.endDate.setDate(subscription.endDate.getDate() + 7);
      } else if (isRepeating) {
        subscription.endDate = null;
      }
    }

    await subscription.save();

    const populated = await Subscription.findById(subscription._id)
      .populate("restaurantId", "name")
      .populate("mealSelections.menuItemId", "name description imageUrl price");

    res.json({ success: true, data: populated });
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({ success: false, message: "Failed to update subscription" });
  }
});

export default router;

