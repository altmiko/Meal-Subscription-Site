import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';

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
			cuisineTypes,
			openingHours,
			menu,
			vehicleType,
			licenseNumber,
			currentLocation,
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

		// Build userData object explicitly based on role to prevent extra fields
		let userData;
		
		if (role === 'restaurant') {
			// Restaurant: base fields + restaurant-specific fields only
			userData = {
				name,
				email,
				phone,
				password,
				role: 'restaurant',
				rating: 0,
				totalRatings: 0,
				isOpen: true,
			};
			if (location) userData.location = location;
			if (Array.isArray(cuisineTypes) && cuisineTypes.length > 0) {
				userData.cuisineTypes = cuisineTypes;
			}
			if (Array.isArray(menu) && menu.length > 0) {
				userData.menu = menu;
			}
		} else if (role === 'deliveryStaff') {
			// DeliveryStaff: base fields + vehicleType only
			userData = {
				name,
				email,
				phone,
				password,
				role: 'deliveryStaff',
			};
			if (vehicleType) userData.vehicleType = vehicleType;
		} else {
			// Customer: only base fields, no additional fields
			userData = {
				name,
				email,
				phone,
				password,
				role: 'customer',
			};
		}

		const user = await User.create(userData);

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
