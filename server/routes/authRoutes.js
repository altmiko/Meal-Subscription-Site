import express from 'express';
import { register, login } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../middleware/validate.js';
import { protect } from '../middleware/authMiddleware.js';
import { updateRestaurantAddress, updateRestaurantStatus } from '../controllers/restaurantController.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.put('/update-restaurant', protect, updateRestaurantAddress);
router.put('/update-restaurant-status', protect, updateRestaurantStatus);

export default router;