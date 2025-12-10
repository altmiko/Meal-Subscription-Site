import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';

export default function DeliveryStaffDashboard() {
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
			if (parsedUser.role !== 'deliveryStaff') {
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

	const toggleAvailability = async () => {
		// TODO: Implement availability toggle API call
		console.log('Toggle availability');
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 border-t-transparent mx-auto mb-4"></div>
					<p className="text-gray-600 text-lg">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white pt-24">
			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* Header */}
				<div className="bg-gray-50 rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-3xl font-semibold text-gray-900 mb-2">
								Welcome, {user?.name}!
							</h1>
							<p className="text-gray-600">Delivery Staff Dashboard</p>
						</div>
						<button
							onClick={handleLogout}
							className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:border-emerald-200 hover:bg-emerald-50"
						>
							Logout
						</button>
					</div>
				</div>

				{/* Availability Toggle */}
				<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-xl font-semibold text-gray-900 mb-1">
								Availability Status
							</h2>
							<p className="text-gray-600">
								Toggle your availability to receive delivery requests
							</p>
						</div>
						<button
							onClick={toggleAvailability}
							className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg"
						>
							Go Online
						</button>
					</div>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
					<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
						<div className="text-4xl mb-3">📦</div>
						<div className="text-3xl font-semibold text-gray-900 mb-1">0</div>
						<div className="text-sm text-gray-600">Total Deliveries</div>
					</div>

					<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
						<div className="text-4xl mb-3">🚚</div>
						<div className="text-3xl font-semibold text-gray-900 mb-1">0</div>
						<div className="text-sm text-gray-600">Active Deliveries</div>
					</div>

					<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
						<div className="text-4xl mb-3">⭐</div>
						<div className="text-3xl font-semibold text-gray-900 mb-1">0.0</div>
						<div className="text-sm text-gray-600">Rating</div>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
					<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
						<div className="text-4xl mb-3">📍</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">
							Current Location
						</h3>
						<p className="text-gray-600">Update your location</p>
					</div>

					<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
						<div className="text-4xl mb-3">📋</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">
							Delivery History
						</h3>
						<p className="text-gray-600">View past deliveries</p>
					</div>
				</div>

				{/* Account Info */}
				<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
					<h2 className="text-2xl font-semibold text-gray-900 mb-4">
						Account Information
					</h2>
					<div className="space-y-3">
						<div>
							<span className="text-gray-600">Name:</span>
							<span className="ml-2 font-semibold">{user?.name}</span>
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
							<span className="text-gray-600">Vehicle Type:</span>
							<span className="ml-2 font-semibold capitalize">
								{user?.vehicleType || 'Not set'}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

