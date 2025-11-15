import mongoose, { mongo } from "mongoose";
import { User } from "./User.js";

const DeliveryStaffSchema = new mongoose.Schema(
    {
        deliveryZone: {type: String, required: true},
        isAvailable: {type: Boolean, default: true}
    }
);

export const DeliveryStaff = User.discriminator('deliveryStaff', DeliveryStaffSchema);