import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const menuItemSchema = new Schema(
    {
        restaurant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        description: { type: String, default: '' },
        price: { type: Number, required: true },
        image: { type: String, default: '' },
        isAvailable: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default model('MenuItem', menuItemSchema);