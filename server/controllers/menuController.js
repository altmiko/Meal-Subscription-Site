import MenuItem from '../models/MenuItem.js';
import { User } from '../models/User.js';

export const getMenuByRestaurant = async (req, res) => {
    try {
        const restaurantId = req.params.id;
        const items = await MenuItem.find({ restaurant: restaurantId }).sort({ createdAt: 1 });
        return res.status(200).json({ success: true, data: items });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const addMenuItem = async (req, res) => {
    try {
        const restaurantId = req.params.id;
        // only restaurant owner should add — protect middleware sets req.user
        if (!req.user || req.user.id !== restaurantId) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const { name, description, price, image, isAvailable } = req.body;
        if (!name || price == null) {
            return res.status(400).json({ success: false, message: 'Name and price required' });
        }

        const item = await MenuItem.create({
            restaurant: restaurantId,
            name,
            description: description || '',
            price,
            image: image || '',
            isAvailable: isAvailable === undefined ? true : !!isAvailable,
        });

        // keep user's menu array in sync if you use it
        await User.findByIdAndUpdate(restaurantId, { $push: { menu: item._id } });

        return res.status(201).json({ success: true, data: item });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const updateMenuItem = async (req, res) => {
    try {
        const restaurantId = req.params.id;
        const itemId = req.params.itemId;

        // ensure owner
        if (!req.user || req.user.id !== restaurantId) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const update = req.body;
        const item = await MenuItem.findOneAndUpdate(
            { _id: itemId, restaurant: restaurantId },
            update,
            { new: true, runValidators: true }
        );

        if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });

        return res.status(200).json({ success: true, data: item });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteMenuItem = async (req, res) => {
    try {
        const restaurantId = req.params.id;
        const itemId = req.params.itemId;

        // ensure owner
        if (!req.user || req.user.id !== restaurantId) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const item = await MenuItem.findOneAndDelete({ _id: itemId, restaurant: restaurantId });
        if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });

        // remove from user's menu array if tracked
        await User.findByIdAndUpdate(restaurantId, { $pull: { menu: item._id } });

        return res.status(200).json({ success: true, message: 'Deleted' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};