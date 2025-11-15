import mongoose from "mongoose";
import { User } from "./User.js";

const CustomerSchema = new mongoose.Schema(
    {
        address: [
            {
                label: {type: String, default: 'None'},
                line1: String,
                line2: String,
                city: String,
                postalCode: String,
                isDefault: { type: Boolean, default: false },
            }
        ],

        mealPreference: {
            dietaryType: { 
            type: String,
            enum: ["veg", "non-veg", "vegan", "any"],
            default: "any"
            },
            allergies: [String],
        },

        referral: {
            myCode: {
                type: String,
                unique: true,
                sparse: true,
                default: Math.random().toString(36).substring(2, 10).toUpperCase()
            },
            referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
            referredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}],
            totalReferrals: { type: Number, default: 0 },
            rewardsEarned: { type: Number, default: 0 },
        },
    }
);

export const Customer = User.discriminator("customer", CustomerSchema);