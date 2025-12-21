import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

const UserSchema = new Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	phone: { type: String, required: true },
	password: { type: String, required: true },
	role: {
		type: String,
		enum: ['customer', 'restaurant', 'deliveryStaff', 'admin'],
		required: true,
	},
	isSuperAdmin: { type: Boolean, default: false },
	isActive: { type: Boolean, default: true },
	referralCode: { type: String, unique: true, sparse: true },
	referredBy: { type: Schema.Types.ObjectId, ref: 'User' },
	// Address field for customers and restaurants
	address: {
		house: { type: String, default: '' },
		road: { type: String, default: '' },
		area: { type: String, default: '' },
		city: { type: String, default: '' },
	},
	// Delivery staff specific fields
	isAvailable: { type: Boolean, default: true },
	totalDeliveries: { type: Number, default: 0 },
	vehicleType: {
		type: String,
		enum: ['Car', 'Bike', 'Bicycle', 'Other'],
		sparse: true,
	},
	// Restaurant-specific fields (keeping location for backward compatibility)
	location: {
		house: { type: String, default: '' },
		road: { type: String, default: '' },
		area: { type: String, default: '' },
		city: { type: String, default: '' },
	},
	cuisineTypes: [String],
	menu: [{ type: Schema.Types.ObjectId, ref: 'MenuItem' }],
	isOpen: { type: Boolean, default: true },
	rating: { type: Number, default: 0 },
	totalRatings: { type: Number, default: 0 },
	favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
	// Wallet for core financial features
	walletBalance: { type: Number, default: 0 },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

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
