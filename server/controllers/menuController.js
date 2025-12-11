import { MenuItem } from '../models/MenuItem.js';
import { User } from '../models/User.js';

const FALLBACK_IMAGE =
	'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800';

async function fetchPexelsImage(query) {
	try {
		if (!process.env.PEXELS_API_KEY) {
			console.warn('⚠️ PEXELS_API_KEY not found, using fallback image');
			return FALLBACK_IMAGE;
		}

		// Add food context to search query
		const searchQuery = `${query} food meal`;
		const q = encodeURIComponent(searchQuery);
		const url = `https://api.pexels.com/v1/search?query=${q}`;

		const res = await fetch(url, {
			headers: {
				Authorization: process.env.PEXELS_API_KEY,
			},
		});

		if (!res.ok) {
			console.error('❌ Pexels API Error:', res.status);
			return FALLBACK_IMAGE;
		}

		const data = await res.json();

		if (!data.photos || data.photos.length === 0) {
			console.warn('⚠️ No images found for:', searchQuery);
			return FALLBACK_IMAGE;
		}

		const photo = data.photos[0];
		// Use large size for better quality
		return photo.src.large || photo.src.original || FALLBACK_IMAGE;
	} catch (err) {
		console.error('❌ Error fetching Pexels image:', err.message);
		return FALLBACK_IMAGE;
	}
}

export const createMenuItem = async (req, res) => {
	try {
		const userId = req.user?.id;
		if (!userId)
			return res
				.status(401)
				.json({ success: false, message: 'Unauthorized' });

		const user = await User.findById(userId);
		if (!user || user.role !== 'restaurant') {
			return res.status(403).json({
				success: false,
				message: 'Only restaurants can manage menu',
			});
		}

		const {
			name,
			description = '',
			price,
			calories,
			ingredients,
		} = req.body;
		if (!name || typeof price !== 'number' || price < 0) {
			return res.status(400).json({
				success: false,
				message: 'Name and numeric price are required',
			});
		}

		// Fetch image from Pexels (best-effort). Use fallback if none found.
		console.log('🔍 Fetching image for:', name);
		const imageUrl = await fetchPexelsImage(name);

		const item = await MenuItem.create({
			name,
			description,
			price,
			calories: typeof calories === 'number' ? calories : 0,
			ingredients: Array.isArray(ingredients)
				? ingredients
				: typeof ingredients === 'string' && ingredients.length
				? ingredients.split(',').map((i) => i.trim())
				: [],
			restaurant: userId,
			imageUrl,
		});

		// attach to user.menu array if present
		if (Array.isArray(user.menu)) {
			user.menu.push(item._id);
			await user.save();
		}

		console.log('✅ Menu item created with image:', imageUrl);
		res.status(201).json({ success: true, data: item });
	} catch (err) {
		console.error('❌ Error creating menu item:', err);
		res.status(500).json({ success: false, message: err.message });
	}
};

export const getMenuForRestaurant = async (req, res) => {
	try {
		const userId = req.user?.id;
		if (!userId)
			return res
				.status(401)
				.json({ success: false, message: 'Unauthorized' });

		const items = await MenuItem.find({ restaurant: userId }).sort({
			createdAt: -1,
		});
		res.json({ success: true, data: items });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

export const getMenuByRestaurantId = async (req, res) => {
	try {
		const restaurantId = req.params.restaurantId;
		const items = await MenuItem.find({ restaurant: restaurantId }).sort({
			createdAt: -1,
		});
		res.json({ success: true, data: items });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

export const updateMenuItem = async (req, res) => {
	try {
		const userId = req.user?.id;
		const itemId = req.params.id;
		if (!userId)
			return res
				.status(401)
				.json({ success: false, message: 'Unauthorized' });

		const item = await MenuItem.findById(itemId);
		if (!item)
			return res
				.status(404)
				.json({ success: false, message: 'Menu item not found' });
		if (item.restaurant.toString() !== userId)
			return res
				.status(403)
				.json({ success: false, message: 'Not allowed' });

		const {
			name,
			description,
			price,
			calories,
			ingredients,
			refetchImage,
		} = req.body;

		if (name !== undefined) item.name = name;
		if (description !== undefined) item.description = description;
		if (typeof price === 'number') item.price = price;
		if (typeof calories === 'number') item.calories = calories;
		if (ingredients !== undefined) {
			item.ingredients = Array.isArray(ingredients)
				? ingredients
				: typeof ingredients === 'string' && ingredients.length
				? ingredients.split(',').map((i) => i.trim())
				: [];
		}

		// Optionally refetch image when name changes or when refetchImage flag passed
		if (
			refetchImage === true ||
			(name && req.body.refetchImage !== false)
		) {
			console.log('🔄 Refetching image for:', item.name);
			item.imageUrl = await fetchPexelsImage(item.name);
		}

		item.updatedAt = new Date();
		await item.save();

		res.json({ success: true, data: item });
	} catch (err) {
		console.error('❌ Error updating menu item:', err);
		res.status(500).json({ success: false, message: err.message });
	}
};

export const deleteMenuItem = async (req, res) => {
	try {
		const userId = req.user?.id;
		const itemId = req.params.id;
		if (!userId)
			return res
				.status(401)
				.json({ success: false, message: 'Unauthorized' });

		const item = await MenuItem.findById(itemId);
		if (!item)
			return res
				.status(404)
				.json({ success: false, message: 'Menu item not found' });
		if (item.restaurant.toString() !== userId)
			return res
				.status(403)
				.json({ success: false, message: 'Not allowed' });

		await MenuItem.findByIdAndDelete(itemId);
		await User.findByIdAndUpdate(userId, { $pull: { menu: itemId } });

		res.json({ success: true, message: 'Deleted' });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

export const getMenuOfTheDay = async (req, res) => {
	try {
		// Get today's day of year (1-365)
		const startOfYear = new Date(new Date().getFullYear(), 0, 0);
		const today = new Date();
		const dayOfYear = Math.floor(
			(today - startOfYear) / (1000 * 60 * 60 * 24)
		);

		// Get total items
		const totalItems = await MenuItem.countDocuments();

		// Calculate starting position (shifts by 5 each day)
		const startPosition = (dayOfYear * 5) % totalItems;

		// Get 5 items starting from that position
		const items = await MenuItem.find()
			.skip(startPosition)
			.limit(5)
			.populate('restaurant', 'name');

		res.json({ success: true, items });
		console.log(items);
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};
