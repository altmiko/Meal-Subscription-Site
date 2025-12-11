import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models/User.js';

dotenv.config();

async function seedRestaurants() {
	try {
		await mongoose.connect(process.env.ATLAS_URI);

		await User.deleteMany({ role: 'restaurant' });

		const rawPassword = 'password';
		const hashedPassword = await bcrypt.hash(rawPassword, 10);

		const restaurants = [
			{
				name: 'Dhaka Daily Kitchen',
				email: 'dhakakitchen@example.com',
				phone: '01710000001',
				password: hashedPassword,
				role: 'restaurant',
				cuisineTypes: ['Bangladeshi'],
				isOpen: true,
				location: {
					house: '12',
					road: '5',
					area: 'Dhanmondi',
					city: 'Dhaka',
				},
			},
			{
				name: 'Bengal Heat Meals',
				email: 'bengalheat@example.com',
				phone: '01710000002',
				password: hashedPassword,
				role: 'restaurant',
				cuisineTypes: ['Bangladeshi', 'Fusion'],
				isOpen: true,
				location: {
					house: '22',
					road: '10',
					area: 'Gulshan',
					city: 'Dhaka',
				},
			},
			{
				name: 'Spice Route Express',
				email: 'spiceroute@example.com',
				phone: '01710000003',
				password: hashedPassword,
				role: 'restaurant',
				cuisineTypes: ['Indian'],
				isOpen: true,
				location: {
					house: '45',
					road: '3',
					area: 'Banani',
					city: 'Dhaka',
				},
			},
			{
				name: 'Mediterraneo Fresh Box',
				email: 'medfresh@example.com',
				phone: '01710000004',
				password: hashedPassword,
				role: 'restaurant',
				cuisineTypes: ['Italian', 'Mediterranean'],
				isOpen: true,
				location: {
					house: '67',
					road: '8',
					area: 'Uttara',
					city: 'Dhaka',
				},
			},
			{
				name: 'Asian Bowl Factory',
				email: 'asianbowl@example.com',
				phone: '01710000005',
				password: hashedPassword,
				role: 'restaurant',
				cuisineTypes: ['Thai', 'Chinese'],
				isOpen: true,
				location: {
					house: '15',
					road: '1',
					area: 'Mirpur',
					city: 'Dhaka',
				},
			},
			{
				name: 'Urban Fit Meal Prep',
				email: 'urbanfit@example.com',
				phone: '01710000006',
				password: hashedPassword,
				role: 'restaurant',
				cuisineTypes: ['Healthy', 'Fusion'],
				isOpen: true,
				location: {
					house: '88',
					road: '11',
					area: 'Bashundhara',
					city: 'Dhaka',
				},
			},
		];

		await User.insertMany(restaurants);

		console.log('✅ Restaurants inserted with hashed passwords');
		process.exit(0);
	} catch (err) {
		console.error('❌ Seeding error:', err);
		process.exit(1);
	}
}

seedRestaurants();
