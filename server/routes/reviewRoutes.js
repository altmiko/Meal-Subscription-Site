import express from "express";
import Review from "../models/Reviews.js";
import { User } from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();

// CREATE or UPDATE review
router.post("/:restaurantId", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { restaurantId } = req.params;

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: "Rating must be between 1 and 5" });

    const review = await Review.findOneAndUpdate(
      { restaurant: restaurantId, user: req.user.id },
      { rating, comment },
      { upsert: true, new: true, runValidators: true }
    );

    // Recalculate rating
    const stats = await Review.aggregate([
      { $match: { restaurant: review.restaurant } },
      {
        $group: {
          _id: "$restaurant",
          avgRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    await User.findByIdAndUpdate(restaurantId, {
      rating: stats[0] ? Number(stats[0].avgRating.toFixed(1)) : 0,
      totalRatings: stats[0] ? stats[0].totalRatings : 0
    });

    res.status(200).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit review" });
  }
});

// GET reviews for a restaurant
router.get("/:restaurantId", async (req, res) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.restaurantId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});


router.get("/:restaurantId", async (req, res) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.restaurantId })
      .populate("user", "name") // show user name instead of ObjectId
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

export default router;
