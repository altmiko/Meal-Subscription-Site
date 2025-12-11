import { User } from '../models/User.js';

export const createRestaurant = async (req, res) => {
	try {
		const { name, email, phone, password, location, cuisineTypes, menu } =
			req.body;

		// Only include restaurant-appropriate fields
		const restaurantData = {
			name,
			email,
			phone,
			password,
			role: 'restaurant',
		};

		// Add restaurant-specific fields only if provided
		if (location) restaurantData.location = location;
		if (Array.isArray(cuisineTypes))
			restaurantData.cuisineTypes = cuisineTypes;
		if (Array.isArray(menu)) restaurantData.menu = menu;
		restaurantData.rating = 0;
		restaurantData.totalRatings = 0;
		restaurantData.isOpen = true;

		const restaurant = await User.create(restaurantData);
		res.status(201).json(restaurant);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

export const getAllRestaurants = async (req, res) => {
	try {
		const restaurants = await User.find({ role: 'restaurant' });
		res.json(restaurants);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

export const getRestaurantById = async (req, res) => {
	try {
		const restaurant = await User.findById(req.params.id);
		if (!restaurant) {
			return res.status(404).json({ error: 'Restaurant not found' });
		}
		res.json(restaurant);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

export const updateRestaurantStatus = async (req, res) => {
	try {
		const userId = req.user?.id;
		const { isOpen } = req.body;

		if (!userId) {
			return res.status(400).json({ error: 'User ID is required' });
		}

		if (typeof isOpen !== 'boolean') {
			return res.status(400).json({ error: 'isOpen must be a boolean' });
		}

		const restaurant = await User.findByIdAndUpdate(
			userId,
			{ isOpen },
			{ new: true, runValidators: true }
		);

		if (!restaurant) {
			return res.status(404).json({ error: 'Restaurant not found' });
		}

		res.status(200).json({
			success: true,
			message: `Restaurant is now ${isOpen ? 'open' : 'closed'}`,
			data: restaurant,
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			error: err.message,
		});
	}
};

export const updateRestaurantAddress = async (req, res) => {
	try {
		const userId = req.user?.id;
		const { restaurantName, phone, location, cuisineTypes } = req.body;

		console.log('Update payload received:', {
			restaurantName,
			phone,
			location,
			cuisineTypes,
		}); // Debug

		if (!userId) {
			return res.status(400).json({ error: 'User ID is required' });
		}

		const updateData = {};
		if (restaurantName) updateData.name = restaurantName;
		if (phone) updateData.phone = phone;
		if (location) {
			updateData.location = {
				house: location.house || '',
				road: location.road || '',
				area: location.area || '',
				city: location.city || '',
			};
		}
		if (cuisineTypes && Array.isArray(cuisineTypes)) {
			updateData.cuisineTypes = cuisineTypes;
		}

		const restaurant = await User.findByIdAndUpdate(userId, updateData, {
			new: true,
			runValidators: true,
		});

		if (!restaurant) {
			return res.status(404).json({ error: 'Restaurant not found' });
		}

		res.status(200).json({
			success: true,
			message: 'Restaurant updated successfully',
			data: restaurant,
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			error: err.message,
		});
	}
};
