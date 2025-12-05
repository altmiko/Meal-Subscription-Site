import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';

export default function RestaurantDashboard() {
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const [restaurant, setRestaurant] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const userData = localStorage.getItem('user');
		if (!userData) {
			navigate('/login');
			return;
		}

		const fetchRestaurantData = async () => {
			try {
				const parsedUser = JSON.parse(userData);
				if (parsedUser.role !== 'restaurant') {
					navigate('/');
					return;
				}
				setUser(parsedUser);

				// Fetch full restaurant data - get all restaurants and find this one
				// In the future, you can add a GET /api/restaurants/:id endpoint
				const response = await axiosInstance.get('/api/restaurants');
				const foundRestaurant = response.data.find(
					(r) => r._id === parsedUser.id || r.email === parsedUser.email
				);
				if (foundRestaurant) {
					setRestaurant(foundRestaurant);
				} else {
					// Use user data as fallback
					setRestaurant({
						restaurantName: parsedUser.name,
						email: parsedUser.email,
						phone: parsedUser.phone,
					});
				}
			} catch (err) {
				console.error('Error fetching restaurant data:', err);
				// Still show user data even if restaurant fetch fails
				const parsedUser = JSON.parse(userData);
				setUser(parsedUser);
				setRestaurant({
					restaurantName: parsedUser.name,
					email: parsedUser.email,
					phone: parsedUser.phone,
				});
			} finally {
				setLoading(false);
			}
		};

		fetchRestaurantData();
	}, [navigate]);

	const handleLogout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		window.dispatchEvent(new Event('userLogout'));
		navigate('/');
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
					<p className="text-gray-600 text-lg">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 pt-24">
			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* Header */}
				<div className="bg-white rounded-xl shadow-md p-6 mb-6">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-3xl font-bold text-gray-900 mb-2">
								{restaurant?.restaurantName || user?.name} 🍽️
							</h1>
							<p className="text-gray-600">Restaurant Dashboard</p>
						</div>
						<button
							onClick={handleLogout}
							className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
						>
							Logout
						</button>
					</div>
				</div>

				{/* Quick Stats */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
					<div className="bg-white rounded-xl shadow-md p-6">
						<div className="text-3xl mb-2">⭐</div>
						<div className="text-2xl font-bold text-gray-900">
							{restaurant?.rating?.toFixed(1) || '0.0'}
						</div>
						<div className="text-sm text-gray-600">Rating</div>
					</div>

					<div className="bg-white rounded-xl shadow-md p-6">
						<div className="text-3xl mb-2">📊</div>
						<div className="text-2xl font-bold text-gray-900">
							{restaurant?.totalRatings || 0}
						</div>
						<div className="text-sm text-gray-600">Total Reviews</div>
					</div>

					<div className="bg-white rounded-xl shadow-md p-6">
						<div className="text-3xl mb-2">
							{restaurant?.isOpen ? '🟢' : '🔴'}
						</div>
						<div className="text-2xl font-bold text-gray-900">
							{restaurant?.isOpen ? 'Open' : 'Closed'}
						</div>
						<div className="text-sm text-gray-600">Status</div>
					</div>

					<div className="bg-white rounded-xl shadow-md p-6">
						<div className="text-3xl mb-2">🍴</div>
						<div className="text-2xl font-bold text-gray-900">
							{restaurant?.menu?.length || 0}
						</div>
						<div className="text-sm text-gray-600">Menu Items</div>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
					<div className="bg-white rounded-xl shadow-md p-6">
						<div className="text-4xl mb-3">📝</div>
						<h3 className="text-xl font-bold text-gray-900 mb-2">
							Manage Menu
						</h3>
						<p className="text-gray-600">Add or edit menu items</p>
					</div>

					<div className="bg-white rounded-xl shadow-md p-6">
						<div className="text-4xl mb-3">📦</div>
						<h3 className="text-xl font-bold text-gray-900 mb-2">
							Orders
						</h3>
						<p className="text-gray-600">View and manage orders</p>
					</div>

					<div className="bg-white rounded-xl shadow-md p-6">
						<div className="text-4xl mb-3">⚙️</div>
						<h3 className="text-xl font-bold text-gray-900 mb-2">
							Settings
						</h3>
						<p className="text-gray-600">Update restaurant info</p>
					</div>
				</div>

				{/* Restaurant Info */}
				<div className="bg-white rounded-xl shadow-md p-6">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">
						Restaurant Information
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<span className="text-gray-600">Restaurant Name:</span>
							<span className="ml-2 font-semibold">
								{restaurant?.restaurantName || 'Not set'}
							</span>
						</div>
						<div>
							<span className="text-gray-600">Email:</span>
							<span className="ml-2 font-semibold">{user?.email}</span>
						</div>
						<div>
							<span className="text-gray-600">Phone:</span>
							<span className="ml-2 font-semibold">{user?.phone}</span>
						</div>
						<div>
							<span className="text-gray-600">Location:</span>
							<span className="ml-2 font-semibold">
								{restaurant?.location?.city || 'Not set'}
							</span>
						</div>
						<div>
							<span className="text-gray-600">Cuisine Types:</span>
							<span className="ml-2 font-semibold">
								{restaurant?.cuisineTypes?.join(', ') || 'Not set'}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

