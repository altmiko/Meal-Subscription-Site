import { User } from '../models/User.js';

export const createRestaurant = async (req, res) => {
	try {
		// Ensure role is set to restaurant
		const restaurantData = { ...req.body, role: 'restaurant' };
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
