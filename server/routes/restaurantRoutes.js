import express from 'express';
import {
	createRestaurant,
	getAllRestaurants,
} from '../controllers/restaurant.controller.js';

const router = express.Router();

router.post('/create', createRestaurant); // route → controller
router.get('/', getAllRestaurants);

export default router;
