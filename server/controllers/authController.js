import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Referral from '../models/Referral.js';

const generateToken = (id) => {
	if (!process.env.JWT_SECRET) {
		throw new Error(
			'JWT_SECRET is not configured. Please set it in your .env file.'
		);
	}
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: '30d',
	});
};

const generateReferralCode = async () => {
	for (let i = 0; i < 10; i += 1) {
		const code = Math.floor(1000 + Math.random() * 9000).toString(); // Generate 4-digit number
		const exists = await User.exists({ referralCode: code });
		if (!exists) return code;
	}
	throw new Error('Failed to generate referral code');
};

export const register = async (req, res) => {
    try {
        console.log('Registration payload:', req.body); // Add this to debug
        
        const {
			name,
			email,
			phone,
			password,
			role: incomingRole,
			location,
			address,
			cuisineTypes,
			openingHours,
			menu,
			vehicleType,
			licenseNumber,
			currentLocation,
			referredByCode,
			referralCode: referralCodeInput,
		} = req.body;

		console.log('Location received:', location); // Add this to debug

		if (!name || !email || !phone || !password) {
			return res.status(400).json({
				success: false,
				message: 'Please provide all required fields',
			});
		}

		const userExists = await User.findOne({ email });
		if (userExists) {
			return res.status(400).json({
				success: false,
				message: 'User already exists',
			});
		}

		const role = incomingRole || 'customer';
		if (role === 'admin') {
			return res.status(403).json({
				success: false,
				message: 'Invalid role.',
			});
		}
		const userData = { name, email, phone, password, role };
		userData.referralCode = await generateReferralCode();

		// Role-specific assignments
		if (role === 'restaurant') {
			// Use the name field as restaurantName for restaurants
			userData.restaurantName = name.trim();
			if (location) userData.location = location;
			if (Array.isArray(cuisineTypes))
				userData.cuisineTypes = cuisineTypes;
			if (openingHours) userData.openingHours = openingHours;
			if (Array.isArray(menu)) userData.menu = menu;

			// Defaults for restaurants
			userData.rating = 0;
			userData.totalRatings = 0;
			userData.isOpen = true;
		} else if (role === 'deliveryStaff') {
			if (vehicleType) userData.vehicleType = vehicleType;
			if (licenseNumber) userData.licenseNumber = licenseNumber;
			if (currentLocation) userData.currentLocation = currentLocation;

			// Defaults for delivery staff
			userData.isAvailable = true;
			userData.totalDeliveries = 0;
		} else if (role === 'customer') {
			// Add address for customers
			if (address) userData.address = address;
		}

		const user = await User.create(userData);

		const incomingReferral = referredByCode || referralCodeInput;
		if (incomingReferral && role === 'customer') {
			const referrer = await User.findOne({
				referralCode: String(incomingReferral).trim().toUpperCase(),
				isActive: true,
			});
			if (!referrer) {
				await User.findByIdAndDelete(user._id);
				return res.status(400).json({
					success: false,
					message: 'Invalid referral code.',
				});
			}
			if (referrer._id.toString() === user._id.toString()) {
				await User.findByIdAndDelete(user._id);
				return res.status(400).json({
					success: false,
					message: 'Invalid referral code.',
				});
			}
			user.referredBy = referrer._id;
			await user.save();
			try {
				await Referral.create({
					referrer: referrer._id,
					referredUser: user._id,
					codeUsed: referrer.referralCode,
					status: 'pending',
				});
			} catch (err) {
				if (err.code !== 11000) throw err;
			}
		}

		const token = generateToken(user._id);

		res.status(201).json({
			success: true,
			data: {
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					phone: user.phone,
					role: user.role,
					isSuperAdmin: user.isSuperAdmin === true,
					address: user.address,
				},
				token,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: 'Please provide email and password',
			});
		}

		const user = await User.findOne({ email }).select('+password');

		if (!user) {
			return res.status(401).json({
				success: false,
				message: 'Invalid credentials',
			});
		}

		const isMatch = await user.comparePassword(password);

		if (!isMatch) {
			return res.status(401).json({
				success: false,
				message: 'Invalid credentials',
			});
		}

		const token = generateToken(user._id);

		res.status(200).json({
			success: true,
			data: {
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					phone: user.phone,
					role: user.role,
					isSuperAdmin: user.isSuperAdmin === true,
					address: user.address,
				},
				token,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};
