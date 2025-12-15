import express from 'express';
import { register, login } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../middleware/validate.js';
import { protect } from '../middleware/authMiddleware.js';
import { updateRestaurantAddress, updateRestaurantStatus } from '../controllers/restaurantController.js';
import { addFavorite, removeFavorite, getFavorites } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.put('/update-restaurant', protect, updateRestaurantAddress);
router.put('/update-restaurant-status', protect, updateRestaurantStatus);

router.post('/favorites/:restaurantId', protect, addFavorite);
router.delete('/favorites/:restaurantId', protect, removeFavorite);
router.get('/favorites', protect, getFavorites);


export default router;