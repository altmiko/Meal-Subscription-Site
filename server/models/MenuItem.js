import mongoose from 'mongoose';

const { Schema } = mongoose;

const MenuItemSchema = new Schema({
	name: { type: String, required: true },
	description: { type: String, default: '' },
	price: { type: Number, required: true },
	restaurant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	calories: { type: Number, default: 0 },
	ingredients: [{ type: String }],
	imageUrl: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

export const MenuItem = mongoose.model('MenuItem', MenuItemSchema);
