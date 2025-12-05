import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';

export default function CustomerDashboard() {
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const userData = localStorage.getItem('user');
		if (!userData) {
			navigate('/login');
			return;
		}

		try {
			const parsedUser = JSON.parse(userData);
			if (parsedUser.role !== 'customer') {
				navigate('/');
				return;
			}
			setUser(parsedUser);
		} catch (err) {
			console.error('Error parsing user data:', err);
			navigate('/login');
		} finally {
			setLoading(false);
		}
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
					<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
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
								Welcome, {user?.name}!
							</h1>
							<p className="text-gray-600">Customer Dashboard</p>
						</div>
						<button
							onClick={handleLogout}
							className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
						>
							Logout
						</button>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
					<button
						onClick={() => navigate('/restaurants')}
						className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 hover:border-blue-400 hover:shadow-lg hover:scale-105 transition-all text-left"
					>
						<div className="text-4xl mb-3">🍽️</div>
						<h3 className="text-xl font-bold text-gray-900 mb-2">
							Browse Restaurants
						</h3>
						<p className="text-gray-600">
							Discover delicious meals from restaurants
						</p>
					</button>

					<button className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 hover:border-green-400 hover:shadow-lg hover:scale-105 transition-all text-left">
						<div className="text-4xl mb-3">📦</div>
						<h3 className="text-xl font-bold text-gray-900 mb-2">
							My Orders
						</h3>
						<p className="text-gray-600">View your order history</p>
					</button>

					<button className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent hover:bg-gradient-to-br hover:from-pink-50 hover:to-pink-100 hover:border-pink-400 hover:shadow-lg hover:scale-105 transition-all text-left">
						<div className="text-4xl mb-3">❤️</div>
						<h3 className="text-xl font-bold text-gray-900 mb-2">
							Favorites
						</h3>
						<p className="text-gray-600">
							Your favorite restaurants
						</p>
					</button>
				</div>

				{/* Account Info */}
				<div className="bg-white rounded-xl shadow-md p-6">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">
						Account Information
					</h2>
					<div className="space-y-3">
						<div>
							<span className="text-gray-600">Name:</span>
							<span className="ml-2 font-semibold">
								{user?.name}
							</span>
						</div>
						<div>
							<span className="text-gray-600">Email:</span>
							<span className="ml-2 font-semibold">
								{user?.email}
							</span>
						</div>
						<div>
							<span className="text-gray-600">Phone:</span>
							<span className="ml-2 font-semibold">
								{user?.phone}
							</span>
						</div>
						<div>
							<span className="text-gray-600">Role:</span>
							<span className="ml-2 font-semibold capitalize">
								{user?.role}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
