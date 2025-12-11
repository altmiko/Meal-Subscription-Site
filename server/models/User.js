import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

const UserSchema = new Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		phone: { type: String, required: true },
		password: { type: String, required: true },
		role: {
			type: String,
			enum: ['customer', 'restaurant', 'deliveryStaff'],
			required: true,
		},
		vehicleType: {
			type: String,
			enum: ['Car', 'Bike', 'Bicycle', 'Other'],
			sparse: true,
		},
		// Restaurant-specific fields (no defaults to prevent saving for other roles)
		location: {
			house: { type: String },
			road: { type: String },
			area: { type: String },
			city: { type: String },
		},
		cuisineTypes: [String],
		imageUrl: { type: String },
		menu: [{ type: Schema.Types.ObjectId, ref: 'MenuItem' }],
		isOpen: { type: Boolean },
		rating: { type: Number },
		totalRatings: { type: Number },
		createdAt: { type: Date, default: Date.now },
		updatedAt: { type: Date, default: Date.now },
	},
	{
		strict: true, // Prevent unknown fields from being saved
	}
);

// Password hashing pre-save hook
UserSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', UserSchema);
