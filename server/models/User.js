import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const options = { discriminatorKey: 'type' };

const UserSchema = new mongoose.Schema(
	{
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
	},
	options
);

UserSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', UserSchema);
