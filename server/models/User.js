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
		enum: ['customer', 'restaurant', 'deliveryStaff'],
		required: true,
	},
	vehicleType: {
		type: String,
		enum: ['Car', 'Bike', 'Bicycle', 'Other'],
		sparse: true,
	},
	// Restaurant-specific fields
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
