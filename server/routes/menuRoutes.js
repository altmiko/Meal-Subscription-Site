import express from 'express';
import {
    getMenuByRestaurant,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
} from '../controllers/menuController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: list menu for a restaurant
router.get('/:id/menu', getMenuByRestaurant);

// Protected: manage menu (restaurant owner only)
router.post('/:id/menu', protect, addMenuItem);
router.put('/:id/menu/:itemId', protect, updateMenuItem);
router.delete('/:id/menu/:itemId', protect, deleteMenuItem);

export default router;