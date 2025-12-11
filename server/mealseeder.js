import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { MenuItem } from './models/MenuItem.js';

dotenv.config();

// ---------- MEAL DATA MAPPED BY RESTAURANT NAME ----------
const mealsByRestaurant = {
	'Dhaka Daily Kitchen': [
		{
			name: 'Bhuna Khichuri with Chicken Roast',
			price: 220,
			calories: 650,
			ingredients: ['rice', 'lentils', 'chicken', 'spices'],
			imageUrl:
				'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
		},
		{
			name: 'Beef Tehari Meal Box',
			price: 260,
			calories: 780,
			ingredients: ['rice', 'beef', 'mustard oil'],
			imageUrl:
				'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800',
		},
		{
			name: 'Panta Platter (Microwavable)',
			price: 150,
			calories: 300,
			ingredients: ['rice', 'chili', 'onion'],
			imageUrl:
				'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800',
		},
		{
			name: 'Morog Polao Ready Pack',
			price: 250,
			calories: 720,
			ingredients: ['chicken', 'rice', 'ghee'],
			imageUrl:
				'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800',
		},
		{
			name: 'Veg Mixed Bhorta Set',
			price: 180,
			calories: 500,
			ingredients: ['potato', 'eggplant', 'lentils'],
			imageUrl:
				'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800',
		},
	],

	'Bengal Heat Meals': [
		{
			name: 'Kacchi Biriyani (Pre-cooked)',
			price: 350,
			calories: 900,
			ingredients: ['rice', 'mutton', 'spices'],
			imageUrl:
				'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800',
		},
		{
			name: 'Masala Chicken Meal Prep',
			price: 240,
			calories: 650,
			ingredients: ['chicken', 'spices'],
			imageUrl:
				'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800',
		},
		{
			name: 'Mezban Beef Bowl',
			price: 280,
			calories: 800,
			ingredients: ['beef', 'rice'],
			imageUrl:
				'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800',
		},
		{
			name: 'Chingri Malai Curry Box',
			price: 330,
			calories: 700,
			ingredients: ['shrimp', 'coconut milk'],
			imageUrl:
				'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=800',
		},
		{
			name: 'Rice & Dal Comfort Pack',
			price: 130,
			calories: 450,
			ingredients: ['lentils', 'rice'],
			imageUrl:
				'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800',
		},
	],

	'Spice Route Express': [
		{
			name: 'Butter Chicken Meal Kit',
			price: 300,
			calories: 720,
			ingredients: ['chicken', 'cream'],
			imageUrl:
				'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800',
		},
		{
			name: 'Paneer Tikka Box',
			price: 240,
			calories: 600,
			ingredients: ['paneer', 'spices'],
			imageUrl:
				'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800',
		},
		{
			name: 'Hyderabadi Biriyani Combo',
			price: 330,
			calories: 850,
			ingredients: ['rice', 'chicken'],
			imageUrl:
				'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800',
		},
		{
			name: 'Masala Dosa Ready Mix',
			price: 180,
			calories: 400,
			ingredients: ['lentils', 'rice'],
			imageUrl:
				'https://images.unsplash.com/photo-1630383249896-424e482df921?w=800',
		},
		{
			name: 'Rajma-Chawal Meal',
			price: 200,
			calories: 550,
			ingredients: ['kidney beans', 'rice'],
			imageUrl:
				'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
		},
	],

	'Mediterraneo Fresh Box': [
		{
			name: 'Creamy Alfredo Pasta Box',
			price: 260,
			calories: 690,
			ingredients: ['pasta', 'cream'],
			imageUrl:
				'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
		},
		{
			name: 'Mediterranean Chicken Bowl',
			price: 280,
			calories: 710,
			ingredients: ['chicken', 'vegetables'],
			imageUrl:
				'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
		},
		{
			name: 'Italian Herb Meal Kit',
			price: 300,
			calories: 650,
			ingredients: ['herbs', 'pasta'],
			imageUrl:
				'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800',
		},
		{
			name: 'Veg Lasagna (Pre-baked)',
			price: 320,
			calories: 780,
			ingredients: ['cheese', 'pasta'],
			imageUrl:
				'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800',
		},
		{
			name: 'Garlic Bread Snack Pack',
			price: 150,
			calories: 350,
			ingredients: ['bread', 'garlic'],
			imageUrl:
				'https://images.unsplash.com/photo-1573140401552-388e7c098f46?w=800',
		},
	],

	'Asian Bowl Factory': [
		{
			name: 'Thai Basil Chicken Bowl',
			price: 260,
			calories: 680,
			ingredients: ['chicken', 'basil'],
			imageUrl:
				'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
		},
		{
			name: 'Kung Pao Chicken Box',
			price: 280,
			calories: 720,
			ingredients: ['chicken', 'peanuts'],
			imageUrl:
				'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800',
		},
		{
			name: 'Teriyaki Rice Meal',
			price: 240,
			calories: 650,
			ingredients: ['rice', 'soy sauce'],
			imageUrl:
				'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800',
		},
		{
			name: 'Ramen Meal Kit',
			price: 300,
			calories: 700,
			ingredients: ['noodles', 'broth'],
			imageUrl:
				'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
		},
		{
			name: 'Veg Stir Fry Box',
			price: 200,
			calories: 550,
			ingredients: ['vegetables', 'soy sauce'],
			imageUrl:
				'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800',
		},
	],

	'Urban Fit Meal Prep': [
		{
			name: 'High-Protein Chicken Bowl',
			price: 280,
			calories: 550,
			ingredients: ['chicken', 'broccoli'],
			imageUrl:
				'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
		},
		{
			name: 'Quinoa Veg Power Meal',
			price: 260,
			calories: 480,
			ingredients: ['quinoa', 'vegetables'],
			imageUrl:
				'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
		},
		{
			name: 'Low-Cal Pasta Pack',
			price: 230,
			calories: 420,
			ingredients: ['pasta', 'vegetables'],
			imageUrl:
				'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
		},
		{
			name: 'Keto Beef Box',
			price: 320,
			calories: 600,
			ingredients: ['beef', 'butter'],
			imageUrl:
				'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800',
		},
		{
			name: 'Detox Vegetable Mix',
			price: 180,
			calories: 250,
			ingredients: ['vegetables'],
			imageUrl:
				'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800',
		},
	],
};

// ----------------- SEEDER FUNCTION -----------------
async function seedMenuItems() {
	try {
		await mongoose.connect(process.env.ATLAS_URI);

		console.log('🌿 Connected to MongoDB');

		// Clear all meals
		await MenuItem.deleteMany();
		console.log('🗑 Cleared old meals');

		const restaurants = await User.find({ role: 'restaurant' });

		if (!restaurants.length) {
			console.log('❌ No restaurants found. Seed restaurants first.');
			process.exit(1);
		}

		let mealsToInsert = [];

		for (const restaurant of restaurants) {
			const mealList = mealsByRestaurant[restaurant.name];

			if (!mealList) {
				console.log(
					`⚠️  No meals found for restaurant: ${restaurant.name}`
				);
				continue;
			}

			const formattedMeals = mealList.map((meal) => ({
				name: meal.name,
				price: meal.price,
				restaurant: restaurant._id,
				calories: meal.calories,
				ingredients: meal.ingredients,
				imageUrl: meal.imageUrl,
			}));

			mealsToInsert.push(...formattedMeals);
		}

		await MenuItem.insertMany(mealsToInsert);
		console.log(
			`✅ Inserted ${mealsToInsert.length} menu items for all restaurants`
		);

		process.exit(0);
	} catch (err) {
		console.error('❌ Menu seeding error:', err);
		process.exit(1);
	}
}

seedMenuItems();
