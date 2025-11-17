import { Restaurant } from '../models/Restaurant.js';

export const createRestaurant = async (req, res) => {
	try {
		const restaurant = await Restaurant.create(req.body);
		res.status(201).json(restaurant);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

export const getAllRestaurants = async (req, res) => {
	try {
		const restaurants = await Restaurant.find();
		res.json(restaurants);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
