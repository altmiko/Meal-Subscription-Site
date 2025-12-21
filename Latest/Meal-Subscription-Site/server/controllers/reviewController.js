import Review from "../models/Reviews.js";
import DeliveryStaffReview from "../models/DeliveryStaffReview.js";
import { User } from "../models/User.js";

export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { restaurantId } = req.params; // <- get from URL param
    const userId = req.user.id;

    if (!restaurantId) {
      return res.status(400).json({ error: "Restaurant ID is required" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Create or update review
    const review = await Review.findOneAndUpdate(
      { restaurant: restaurantId, user: userId },
      { rating, comment },
      { new: true, upsert: true, runValidators: true }
    );

    // Recalculate restaurant rating
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
      rating: stats[0] ? stats[0].avgRating : 0,
      totalRatings: stats[0] ? stats[0].totalRatings : 0
    });

    res.status(201).json({ success: true, review });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
