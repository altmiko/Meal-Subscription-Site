import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';

export default function DeliveryStaffDashboard() {
	const [totalDeliveries, setTotalDeliveries] = useState(0);
	const [completedDeliveries, setCompletedDeliveries] = useState(0);
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [deliveries, setDeliveries] = useState([]);
	const [availableOffers, setAvailableOffers] = useState([]);
	const [loadingOffers, setLoadingOffers] = useState(false);
	const [isAvailable, setIsAvailable] = useState(true);
	const [reviews, setReviews] = useState([]);
	const [loadingReviews, setLoadingReviews] = useState(false);
	const staffId = user?.id || user?._id;
	const averageRating = reviews.length
		? Number(
				(
					reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) /
					reviews.length
				).toFixed(1)
			)
		: 0;
	const totalReviews = reviews.length;

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
			setIsAvailable(parsedUser.isAvailable !== false);
		} catch (err) {
			console.error('Error parsing user data:', err);
			navigate('/login');
		} finally {
			setLoading(false);
		}
	}, [navigate]);

	useEffect(() => {
		const loadDeliveries = async () => {
			try {
				const res = await axiosInstance.get('/api/deliveries/staff/my');
				if (res.data.totals) {
					setTotalDeliveries(res.data.totals.totalDeliveries || 0);
					setCompletedDeliveries(res.data.totals.completedDeliveries || 0);
				} else {
					setTotalDeliveries((res.data.deliveries || []).length);
				}
				setDeliveries(res.data.deliveries || []);
			} catch (err) {
				console.error('Failed to load deliveries', err);
			}
		};

		const loadAvailableOffers = async () => {
			// Only load offers if user is available
			if (!isAvailable) {
				setAvailableOffers([]);
				return;
			}
			setLoadingOffers(true);
			try {
				const res = await axiosInstance.get('/api/deliveries/offers/available');
				setAvailableOffers(res.data.offers || []);
			} catch (err) {
				console.error('Failed to load offers', err);
			} finally {
				setLoadingOffers(false);
			}
		};

		if (user) {
			loadDeliveries();
			loadAvailableOffers();
			// Refresh offers every 5 seconds only if available
			let interval;
			if (isAvailable) {
				interval = setInterval(loadAvailableOffers, 5000);
			}
			return () => {
				if (interval) clearInterval(interval);
			};
		}
	}, [user, isAvailable]);

	useEffect(() => {
		const loadReviews = async () => {
			setLoadingReviews(true);
			try {
				const res = await axiosInstance.get('/api/reviews/delivery-staff/me');
				setReviews(Array.isArray(res.data) ? res.data : []);
			} catch (err) {
				console.error('Failed to load reviews', err);
				setReviews([]);
			} finally {
				setLoadingReviews(false);
			}
		};

		if (user) {
			loadReviews();
		}
	}, [user]);

	const handleLogout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		window.dispatchEvent(new Event('userLogout'));
		navigate('/');
	};

	const toggleAvailability = async () => {
		try {
			const res = await axiosInstance.patch('/api/deliveries/availability/toggle');
			if (res.data.success) {
				const newAvailability = res.data.isAvailable;
				setIsAvailable(newAvailability);
				// Update user in localStorage
				const userData = localStorage.getItem('user');
				if (userData) {
					const parsedUser = JSON.parse(userData);
					parsedUser.isAvailable = newAvailability;
					localStorage.setItem('user', JSON.stringify(parsedUser));
					setUser(parsedUser);
				}
				// If going online, load offers immediately
				if (newAvailability) {
					const offersRes = await axiosInstance.get('/api/deliveries/offers/available');
					setAvailableOffers(offersRes.data.offers || []);
				} else {
					setAvailableOffers([]);
				}
			}
		} catch (err) {
			console.error('Failed to toggle availability', err);
			alert(err.response?.data?.message || 'Failed to toggle availability');
		}
	};

	const refreshDeliveries = async () => {
		try {
			const res = await axiosInstance.get('/api/deliveries/staff/my');
			setDeliveries(res.data.deliveries || []);
		} catch (err) {
			console.error('Failed to load deliveries', err);
		}
	};

	const acceptOffer = async (deliveryId) => {
		try {
			const res = await axiosInstance.post(`/api/deliveries/offers/${deliveryId}/accept`);
			if (res.data.success) {
				alert('Offer accepted successfully!');
				// Refresh deliveries and offers
				await refreshDeliveries();
				if (isAvailable) {
					const offersRes = await axiosInstance.get('/api/deliveries/offers/available');
					setAvailableOffers(offersRes.data.offers || []);
				}
			}
		} catch (err) {
			const message = err.response?.data?.message || 'Failed to accept offer';
			alert(message);
		}
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
							className={`rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${
								isAvailable
									? 'bg-red-600 hover:bg-red-700'
									: 'bg-emerald-600 hover:bg-emerald-700'
							}`}
						>
							{isAvailable ? 'Go Offline' : 'Go Online'}
						</button>
					</div>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
					<button
						type="button"
						onClick={() => navigate('/delivery-staff/my-deliveries')}
						className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-left transition hover:border-emerald-200 hover:bg-emerald-50"
					>
						<div className="text-4xl mb-3">📦</div>
						<div className="text-3xl font-semibold text-gray-900 mb-1">
							{totalDeliveries}
						</div>
						<div className="text-sm text-gray-600">
							Total Deliveries
							{completedDeliveries > 0 ? ` • ${completedDeliveries} completed` : ''}
						</div>
					</button>

					<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
						<div className="text-4xl mb-3">🚚</div>
						<div className="text-3xl font-semibold text-gray-900 mb-1">
							{
								deliveries.filter(
									(d) =>
										d.status === 'assigned' ||
										d.status === 'picked_up' ||
										d.status === 'on_the_way'
								).length
							}
						</div>
						<div className="text-sm text-gray-600">Active Deliveries</div>
					</div>

					<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
						<div className="text-4xl mb-3">⭐</div>
						<div className="text-3xl font-semibold text-gray-900 mb-1">
							{loadingReviews ? '...' : averageRating.toFixed(1)}
						</div>
						<div className="text-sm text-gray-600">
							Rating
						</div>
					</div>

					<button
						type="button"
						onClick={() => staffId && navigate(`/delivery-staff/${staffId}/reviews`)}
						className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-left transition hover:border-emerald-200 hover:bg-emerald-50"
					>
						<div className="text-4xl mb-3">📊</div>
						<div className="text-3xl font-semibold text-gray-900 mb-1">
							{loadingReviews ? '...' : totalReviews}
						</div>
						<div className="text-sm text-gray-600">Total Reviews</div>
					</button>
				</div>

				{/* Available Offers */}
				<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
					<h2 className="text-2xl font-semibold text-gray-900 mb-4">
						Available Delivery Offers
					</h2>
					{loadingOffers ? (
						<p className="text-gray-600">Loading offers...</p>
					) : availableOffers.length === 0 ? (
						<p className="text-gray-600">No available offers at the moment.</p>
					) : (
						<div className="space-y-3">
							{availableOffers.map((offer) => (
								<div
									key={offer._id}
									className="border rounded-lg p-4 bg-emerald-50 border-emerald-200"
								>
									<div className="flex justify-between items-start mb-2">
										<div className="flex-1">
											<p className="font-semibold text-gray-900">
												Order #{offer.order?._id?.slice(-6) || 'N/A'}
											</p>
											<p className="text-sm text-gray-600">
												Restaurant: {offer.order?.restaurantId?.name || 'N/A'}
											</p>
											<p className="text-sm text-gray-600">
												Total: {offer.order?.total || 0} BDT
											</p>
											{offer.completionTime && (
												<p className="text-sm text-gray-600 mt-1">
													⏰ Ready by: {new Date(offer.completionTime).toLocaleString()}
												</p>
											)}
											{offer.address && (
												<p className="text-sm text-gray-500 mt-1">
													📍 {offer.address.house} {offer.address.road}, {offer.address.area}, {offer.address.city}
												</p>
											)}
										</div>
										<button
											onClick={() => acceptOffer(offer._id)}
											className="ml-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold whitespace-nowrap"
										>
											Accept Offer
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Delivery History & Tracking */}
				{(() => {
					// Filter out delivered deliveries
					const activeDeliveries = deliveries.filter(
						(d) => d.status !== 'delivered'
					);
					
					// Only show section if there are active deliveries
					if (activeDeliveries.length === 0) {
						return null;
					}

					return (
						<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
							<h2 className="text-2xl font-semibold text-gray-900 mb-4">
								My Deliveries
							</h2>
							<div className="space-y-3">
								{activeDeliveries.map((d) => (
									<div
										key={d._id}
										className="border rounded-lg px-3 py-2 flex flex-col md:flex-row justify-between md:items-center gap-2"
									>
										<div>
											<p className="font-semibold">
												Order: {d.order?.toString() || d.order?._id || 'N/A'}
											</p>
											<p className="text-sm text-gray-600 capitalize">
												Status: {d.status}
											</p>
											{d.address && (
												<p className="text-sm text-gray-500">
													📍 {d.address.house} {d.address.road},{' '}
													{d.address.area}, {d.address.city}
												</p>
											)}
										</div>
										<UpdateLocationForm deliveryId={d._id} onStatusUpdate={refreshDeliveries} />
									</div>
								))}
							</div>
						</div>
					);
				})()}

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


const UpdateLocationForm = ({ deliveryId, onStatusUpdate }) => {
	const [status, setStatus] = useState('');
	const [saving, setSaving] = useState(false);

	const onSubmit = async (e) => {
		e.preventDefault();
		if (!status) {
			alert('Please select a status');
			return;
		}

		try {
			setSaving(true);
			const payload = { status };
			await axiosInstance.patch(`/api/deliveries/${deliveryId}/location`, payload);
			alert('Updated successfully');
			setStatus('');
			if (onStatusUpdate) {
				onStatusUpdate();
			}
		} catch (err) {
			console.error('Failed to update', err);
			alert(err.response?.data?.message || 'Failed to update');
		} finally {
			setSaving(false);
		}
	};

	return (
		<form
			onSubmit={onSubmit}
			className="flex flex-col md:flex-row gap-2 items-start md:items-center"
		>
			<select
				value={status}
				onChange={(e) => setStatus(e.target.value)}
				className="border rounded px-2 py-1 text-sm"
			>
				<option value="">Update Status</option>
				<option value="assigned">Assigned</option>
				<option value="picked_up">Picked Up</option>
				<option value="on_the_way">On The Way</option>
				<option value="delivered">Delivered</option>
			</select>
			<button
				type="submit"
				disabled={saving}
				className="bg-emerald-600 text-white px-3 py-1 rounded text-sm disabled:opacity-60"
			>
				{saving ? 'Saving...' : 'Update'}
			</button>
		</form>
	);
};
