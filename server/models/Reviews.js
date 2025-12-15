import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // restaurant user
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // customer
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

// One review per user per restaurant
reviewSchema.index({ restaurant: 1, user: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
