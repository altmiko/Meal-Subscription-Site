import mongoose from 'mongoose';

const options = { discriminatorKey: 'type' };

const UserSchema = new mongoose.Schema(
{
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    phone: {type: String, required: true},
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['customer', 'restaurant', 'deliveryStaff'],
        default: 'customer'
    },
}, options);


export const User = mongoose.model("User", UserSchema);