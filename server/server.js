import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from './db/connection.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import restaurantRoutes from './routes/restaurant.routes.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from server directory
config({ path: join(__dirname, '.env') });

// Check for required environment variables
if (!process.env.JWT_SECRET) {
	console.error('ERROR: JWT_SECRET is not set in .env file!');
	console.error(
		'Please add JWT_SECRET to your .env file in the server directory.'
	);
	process.exit(1);
}

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
	res.send('Backend API is running!');
});
app.use('/api/restaurants', restaurantRoutes);

app.use('/api/auth', authRoutes);

// Error handler middleware (must be last)
app.use(errorHandler);

connectDB().then(() => {
	app.listen(PORT, () => {
		console.log(`Server listening on port ${PORT}`);
	});
});
