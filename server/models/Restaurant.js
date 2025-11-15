import mongoose from "mongoose";
import { User } from "./User.js";

const RestaurantSchema = new mongoose.Schema(
    {
        restaurantName: {type: String, required: true},
        location: {
            address: String,
            area: String,
            city: String
        },
        cuisineTypes: [String],
    }
);

export const Restaurant = User.discriminator('restaurant', RestaurantSchema);