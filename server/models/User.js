import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
	{
		// Base fields (required for all users)
		name: { type: String, required: true },
		email: {
			type: String,
			required: true,
			unique: true,
			match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
		},
		phone: { type: String, required: true },
		password: { type: String, required: true, select: false },
		role: {
			type: String,
			enum: ['customer', 'restaurant', 'deliveryStaff'],
			default: 'customer',
		},

		// CUSTOMER fields (optional)
		deliveryAddresses: [
			{
				label: String,
				street: String,
				city: String,
				area: String,
				postalCode: String,
			},
		],
		favoriteRestaurants: [
			{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		],

		// RESTAURANT fields (optional, except restaurantName when role is restaurant)
		restaurantName: {
			type: String,
			required: function () {
				return this.role === 'restaurant';
			},
		},
		location: {
			address: String,
			area: String,
			city: String,
			coordinates: {
				lat: Number,
				lng: Number,
			},
		},
		cuisineTypes: [String],
		rating: { type: Number, default: 0 },
		totalRatings: { type: Number, default: 0 },
		isOpen: { type: Boolean, default: true },
		openingHours: {
			monday: { open: String, close: String },
			tuesday: { open: String, close: String },
			wednesday: { open: String, close: String },
			thursday: { open: String, close: String },
			friday: { open: String, close: String },
			saturday: { open: String, close: String },
			sunday: { open: String, close: String },
		},
		menu: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],

		// DELIVERY STAFF fields (optional)
		vehicleType: {
			type: String,
			enum: ['bicycle', 'motorcycle', 'car', 'scooter'],
		},
		licenseNumber: String,
		isAvailable: { type: Boolean, default: false },
		currentLocation: {
			lat: Number,
			lng: Number,
		},
		totalDeliveries: { type: Number, default: 0 },
	},
	{ timestamps: true }
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
