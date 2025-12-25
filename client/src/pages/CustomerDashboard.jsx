import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import MealCalendar from '../components/MealCalendar';
import SubscriptionManager from '../components/SubscriptionManager';

export default function CustomerDashboard() {
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [favorites, setFavorites] = useState([]);
	const [showFavorites, setShowFavorites] = useState(false);
	const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' or 'subscriptions'

	// ------------------ Load user ------------------
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

	// ------------------ Handle user updates ------------------
	const handleUserUpdate = (updatedUser) => {
		setUser(updatedUser);
	};

	// ------------------ Logout ------------------
	const handleLogout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		window.dispatchEvent(new Event('userLogout'));
		navigate('/');
	};

	// ------------------ Fetch Favorites ------------------
	const fetchFavorites = async () => {
		try {
			const res = await axiosInstance.get('/api/auth/favorites');
			const favoriteIds = res.data.favorites || [];

			const favoriteRestaurants = await Promise.all(
				favoriteIds.map((id) =>
					axiosInstance
						.get(`/api/restaurants/${id}`)
						.then((res) => res.data)
				)
			);

			setFavorites(favoriteRestaurants);
		} catch (err) {
			console.error('Failed to fetch favorites', err);
		}
	};

	useEffect(() => {
		if (user && showFavorites) fetchFavorites();
	}, [user, showFavorites]);

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
				<Header user={user} onLogout={handleLogout} />

				{/* Quick Actions */}
				<QuickActions
					navigate={navigate}
					showFavorites={showFavorites}
					setShowFavorites={setShowFavorites}
				/>

				{/* Meal Calendar & Subscriptions Tabs */}
				<div className="mb-6">
					<div className="border-b border-gray-200 mb-4">
						<nav className="flex gap-4">
							<button
								onClick={() => setActiveTab('calendar')}
								className={`px-4 py-2 font-semibold border-b-2 transition ${
									activeTab === 'calendar'
										? 'border-emerald-600 text-emerald-600'
										: 'border-transparent text-gray-600 hover:text-gray-900'
								}`}
							>
								📅 Meal Calendar
							</button>
							<button
								onClick={() => setActiveTab('subscriptions')}
								className={`px-4 py-2 font-semibold border-b-2 transition ${
									activeTab === 'subscriptions'
										? 'border-emerald-600 text-emerald-600'
										: 'border-transparent text-gray-600 hover:text-gray-900'
								}`}
							>
								📦 Manage Subscriptions
							</button>
						</nav>
					</div>

					{activeTab === 'calendar' ? (
						<MealCalendar />
					) : (
						<SubscriptionManager />
					)}
				</div>

				{/* Favorites List */}
				{showFavorites && (
					<FavoritesList favorites={favorites} navigate={navigate} />
				)}

				{/* Account Info */}
				<AccountInfo user={user} onUserUpdate={handleUserUpdate} />
			</div>
		</div>
	);
}

// ------------------ Components ------------------
const Header = ({ user, onLogout }) => (
	<div className="bg-gray-50 rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
		<div className="flex justify-between items-center">
			<div>
				<h1 className="text-3xl font-semibold text-gray-900 mb-2">
					Welcome, {user?.name}!
				</h1>
				<p className="text-gray-600">Customer Dashboard</p>
			</div>
			<button
				onClick={onLogout}
				className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:border-emerald-200 hover:bg-emerald-50"
			>
				Logout
			</button>
		</div>
	</div>
);

const QuickActions = ({ navigate, showFavorites, setShowFavorites }) => (
	<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
		<ActionCard
			icon="🍽️"
			title="Browse Restaurants"
			desc="Discover delicious meals from restaurants"
			onClick={() => navigate('/restaurants')}
		/>
		<ActionCard
			icon="📦"
			title="My Orders"
			desc="View your order history"
			onClick={() => navigate('/my-orders')}
		/>
		<ActionCard
			icon="💰"
			title="Wallet & Payments"
			desc="Recharge and view transactions"
			onClick={() => navigate('/wallet')}
		/>
		<ActionCard
			icon="❤️"
			title="Favorites"
			desc="Your favorite restaurants"
			onClick={() => setShowFavorites(!showFavorites)}
		/>
		<ActionCard
			icon="🎁"
			title="Referrals & Rewards"
			desc="Share a code and earn wallet credits"
			onClick={() => navigate('/referrals')}
		/>
	</div>
);

const ActionCard = ({ icon, title, desc, onClick }) => (
	<button
		onClick={onClick}
		className="rounded-xl border border-gray-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
	>
		<div className="text-4xl mb-3">{icon}</div>
		<h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
		<p className="text-gray-600">{desc}</p>
	</button>
);

const FavoritesList = ({ favorites, navigate }) => (
	<div className="mt-8">
		<h2 className="text-2xl font-semibold mb-4">
			Your Favorite Restaurants
		</h2>
		{favorites.length === 0 ? (
			<p className="text-gray-500">
				You have no favorite restaurants yet.
			</p>
		) : (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{favorites.map((r) => (
					<div
						key={r._id}
						onClick={() => navigate(`/restaurants/${r._id}`)}
						className="bg-white rounded-2xl border shadow-sm hover:shadow-lg cursor-pointer transition"
					>
						<div className="h-48 bg-emerald-100 rounded-t-2xl border border-black flex items-center justify-center text-6xl">
							🍽️
						</div>
						<div className="p-6">
							<h2 className="text-xl font-semibold mb-2">
								{r.name}
							</h2>
							{r.location && (
								<p className="text-sm text-gray-600 mb-4">
									📍 {r.location.city}, {r.location.area}
								</p>
							)}
							<button
								onClick={(e) => {
									e.stopPropagation();
									navigate(`/restaurants/${r._id}`);
								}}
								className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold"
							>
								View Menu
							</button>
						</div>
					</div>
				))}
			</div>
		)}
	</div>
);

const AccountInfo = ({ user, onUserUpdate }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [editForm, setEditForm] = useState({
		name: user?.name || '',
		email: user?.email || '',
		phone: user?.phone || '',
		address: user?.address || {
			house: '',
			road: '',
			area: '',
			city: '',
		},
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	// Update form when user prop changes
	useEffect(() => {
		setEditForm({
			name: user?.name || '',
			email: user?.email || '',
			phone: user?.phone || '',
			address: user?.address || {
				house: '',
				road: '',
				area: '',
				city: '',
			},
		});
	}, [user]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		if (name.startsWith('address.')) {
			const addressField = name.split('.')[1];
			setEditForm((prev) => ({
				...prev,
				address: {
					...prev.address,
					[addressField]: value,
				},
			}));
		} else {
			setEditForm((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	const handleSave = async () => {
		setLoading(true);
		setError('');

		try {
			const response = await axiosInstance.put('/api/auth/profile', {
				name: editForm.name,
				email: editForm.email,
				phone: editForm.phone,
				address: editForm.address,
			});

			if (response.data.success) {
				// Update user data in localStorage
				const updatedUser = {
					...user,
					...response.data.data.user,
					id: response.data.data.user.id, // Ensure ID is preserved
				};
				localStorage.setItem('user', JSON.stringify(updatedUser));

				// Update parent component state
				if (onUserUpdate) {
					onUserUpdate(updatedUser);
				}

				// Exit edit mode
				setIsEditing(false);
			} else {
				setError(response.data.message || 'Failed to update profile');
			}
		} catch (err) {
			setError(
				err.response?.data?.message ||
					'An error occurred while updating profile'
			);
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		setEditForm({
			name: user?.name || '',
			email: user?.email || '',
			phone: user?.phone || '',
			address: user?.address || {
				house: '',
				road: '',
				area: '',
				city: '',
			},
		});
		setIsEditing(false);
		setError('');
	};

	const formatAddress = (address) => {
		if (!address) return 'Not set';

		const parts = [
			address.house && `House ${address.house}`,
			address.road && address.road,
			address.area && address.area,
			address.city && address.city,
		].filter(Boolean);

		return parts.length > 0 ? parts.join(', ') : 'Not set';
	};

	if (isEditing) {
		return (
			<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mt-8">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-2xl font-semibold text-gray-900">
						Edit Account Information
					</h2>
					<button
						onClick={() => setIsEditing(false)}
						className="text-gray-500 hover:text-gray-700 text-xl"
					>
						✕
					</button>
				</div>

				{error && (
					<div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
						{error}
					</div>
				)}

				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Name
						</label>
						<input
							type="text"
							name="name"
							value={editForm.name}
							onChange={handleInputChange}
							className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 transition-all focus:border-emerald-500 focus:outline-none"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Email
						</label>
						<input
							type="email"
							name="email"
							value={editForm.email}
							onChange={handleInputChange}
							className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 transition-all focus:border-emerald-500 focus:outline-none"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Phone
						</label>
						<input
							type="tel"
							name="phone"
							value={editForm.phone}
							onChange={handleInputChange}
							className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 transition-all focus:border-emerald-500 focus:outline-none"
						/>
					</div>

					<div className="border-t pt-4">
						<h3 className="text-lg font-semibold text-gray-900 mb-3">
							Address
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									House Number
								</label>
								<input
									type="text"
									name="address.house"
									value={editForm.address.house}
									onChange={handleInputChange}
									className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 transition-all focus:border-emerald-500 focus:outline-none"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Road/Street
								</label>
								<input
									type="text"
									name="address.road"
									value={editForm.address.road}
									onChange={handleInputChange}
									className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 transition-all focus:border-emerald-500 focus:outline-none"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Area/District
								</label>
								<input
									type="text"
									name="address.area"
									value={editForm.address.area}
									onChange={handleInputChange}
									className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 transition-all focus:border-emerald-500 focus:outline-none"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									City
								</label>
								<input
									type="text"
									name="address.city"
									value={editForm.address.city}
									onChange={handleInputChange}
									className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 transition-all focus:border-emerald-500 focus:outline-none"
								/>
							</div>
						</div>
					</div>
				</div>

				<div className="flex gap-3 mt-6">
					<button
						onClick={handleSave}
						disabled={loading}
						className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50"
					>
						{loading ? 'Saving...' : 'Save Changes'}
					</button>
					<button
						onClick={handleCancel}
						disabled={loading}
						className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
					>
						Cancel
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mt-8">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-2xl font-semibold text-gray-900">
					Account Information
				</h2>
				<button
					onClick={() => setIsEditing(true)}
					className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition"
				>
					Edit Account
				</button>
			</div>
			<div className="space-y-3">
				<InfoItem label="Name" value={user?.name} />
				<InfoItem label="Email" value={user?.email} />
				<InfoItem label="Phone" value={user?.phone} />
				<InfoItem label="Role" value={user?.role} />
				<InfoItem
					label="Address"
					value={formatAddress(user?.address)}
				/>
			</div>
		</div>
	);
};

const InfoItem = ({ label, value }) => (
	<div>
		<span className="text-gray-600">{label}:</span>
		<span className="ml-2 font-semibold">{value || 'Not set'}</span>
	</div>
);
