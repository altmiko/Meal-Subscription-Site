import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import {
	FaMapMarkerAlt,
	FaPhone,
	FaStar,
	FaTruck,
	FaHeart,
	FaAward,
} from 'react-icons/fa';
import FloatingCart from '../components/FloatingCart';
import SubscriptionManager from '../components/SubscriptionManager';

const FALLBACK_IMAGE =
	'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800';
const DAYS = [
	'sunday',
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
];

export default function KitchenProfile() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [kitchen, setKitchen] = useState(null);
	const [menuItems, setMenuItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedItem, setSelectedItem] = useState(null);
	const [showItemModal, setShowItemModal] = useState(false);
	const [user, setUser] = useState(null);
	const [walletBalance, setWalletBalance] = useState(0);
	const [nextPayment, setNextPayment] = useState(null);
	const [cart, setCart] = useState(() => {
		const saved = localStorage.getItem('cart');
		return saved ? JSON.parse(saved) : [];
	});

	// Check user role
	useEffect(() => {
		const userData = localStorage.getItem('user');
		if (userData) {
			try {
				const parsedUser = JSON.parse(userData);
				setUser(parsedUser);
				fetchWalletAndSubscriptions(parsedUser);
			} catch (err) {
				console.error('Error parsing user data:', err);
			}
		}
	}, []);

	const fetchWalletAndSubscriptions = async (currentUser) => {
		try {
			// Wallet
			const walletRes = await axiosInstance.get('/api/wallet');
			if (walletRes.data.success) {
				setWalletBalance(walletRes.data.walletBalance || 0);
			}

			// Subscriptions for next payment
			const subRes = await axiosInstance.get('/api/subscriptions');
			if (subRes.data.success) {
				const subs = subRes.data.data || [];
				const activeSubs = subs.filter(s => s.status === 'active');
				if (activeSubs.length > 0) {
					const totalWeekly = activeSubs.reduce((sum, sub) => {
						const subTotal = (sub.mealSelections || []).reduce((mealSum, meal) => {
							return mealSum + ((meal.price || 0) * (meal.quantity || 1));
						}, 0);
						return sum + subTotal;
					}, 0);

					const today = new Date();
					const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
					const nextMonday = new Date(today);
					nextMonday.setDate(today.getDate() + daysUntilMonday);

					setNextPayment({
						amount: totalWeekly,
						date: nextMonday.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
					});
				}
			}
		} catch (err) {
			console.error("Failed to fetch user data for header", err);
		}
	};


	// Check if user is a customer
	const isCustomer = user && user.role === 'customer';

	const [reviews, setReviews] = useState([]);
	const [reviewRating, setReviewRating] = useState(5);
	const [reviewComment, setReviewComment] = useState('');
	const [reviewLoading, setReviewLoading] = useState(false);
	const [reviewError, setReviewError] = useState(null);

	const todayIndex = new Date().getDay();

	// Persist cart
	useEffect(() => {
		localStorage.setItem('cart', JSON.stringify(cart));
		window.dispatchEvent(new Event('cartUpdated'));
	}, [cart]);

	// Add item to cart with duplicate check
	const addToCart = (item) => {
		const deliveryDate = item.date ? new Date(item.date) : new Date();
		if (item.mealType === 'lunch') deliveryDate.setHours(13, 0, 0, 0);
		else if (item.mealType === 'dinner') deliveryDate.setHours(20, 0, 0, 0);

		const itemWithDelivery = {
			...item,
			quantity: 1,
			date: deliveryDate.toISOString(),
			deliveryDate: deliveryDate.toISOString(),
			restaurant: id,
			restaurantId: id,
		};

		const exists = cart.some(
			(ci) =>
				ci._id === item._id &&
				ci.date === itemWithDelivery.date &&
				ci.mealType === item.mealType &&
				ci.day === item.day
		);
		if (exists)
			return alert(`${item.name} is already in your cart for this time.`);

		setCart((prev) => [...prev, itemWithDelivery]);
		alert(`${item.name} added to cart!`);
	};

	// Bulk add functions
	const addAllByMealType = (mealType) => {
		const itemsToAdd = menuItems
			.filter(
				(item) =>
					DAYS.indexOf(item.day) >= todayIndex &&
					item.mealType === mealType
			)
			.map((item) => {
				const deliveryDate = item.date
					? new Date(item.date)
					: new Date();
				deliveryDate.setHours(mealType === 'lunch' ? 13 : 20, 0, 0, 0);
				return {
					...item,
					quantity: 1,
					date: deliveryDate.toISOString(),
					deliveryDate: deliveryDate.toISOString(),
					restaurant: id,
					restaurantId: id,
				};
			})
			.filter(
				(itemToAdd) =>
					!cart.some(
						(ci) =>
							ci._id === itemToAdd._id &&
							ci.date === itemToAdd.date &&
							ci.mealType === itemToAdd.mealType &&
							ci.day === itemToAdd.day
					)
			);

		if (!itemsToAdd.length)
			return alert(
				`No ${mealType} items available for the rest of the week!`
			);

		setCart((prev) => [...prev, ...itemsToAdd]);
		alert(
			`${itemsToAdd.length} ${mealType} items added to cart for the rest of the week!`
		);
	};

	const addAllLunch = () => addAllByMealType('lunch');
	const addAllDinner = () => addAllByMealType('dinner');

	// Fetch kitchen
	useEffect(() => {
		const fetchKitchen = async () => {
			try {
				setLoading(true);
				const { data } = await axiosInstance.get(
					`/api/restaurants/${id}`
				);
				setKitchen(data);
			} catch (err) {
				setError(err.message || 'Failed to fetch kitchen data');
			} finally {
				setLoading(false);
			}
		};
		fetchKitchen();
	}, [id]);

	// Fetch menu
	useEffect(() => {
		if (!kitchen) return;
		const fetchMenu = async () => {
			try {
				const { data } = await axiosInstance.get(
					`/api/menu/restaurant/${id}`
				);
				setMenuItems(data.data || []);
			} catch (err) {
				console.error('Failed to fetch menu items:', err);
				setMenuItems([]);
			}
		};
		fetchMenu();
	}, [kitchen, id]);

	useEffect(() => {
		const fetchReviews = async () => {
			try {
				const { data } = await axiosInstance.get(`/api/reviews/${id}`);
				setReviews(data);
			} catch (err) {
				console.error('Failed to fetch reviews:', err);
			}
		};
		fetchReviews();
	}, [id]);

	const submitReview = async () => {
		if (!reviewComment.trim()) return alert('Please write a comment');
		setReviewLoading(true);
		try {
			const { data } = await axiosInstance.post(`/api/reviews/${id}`, {
				rating: reviewRating,
				comment: reviewComment,
			});
			setReviews((prev) => [data, ...prev]);
			setReviewComment('');
			setReviewRating(5);
			alert('Review submitted!');
		} catch (err) {
			console.error(err);
			setReviewError('Failed to submit review');
		} finally {
			setReviewLoading(false);
		}
	};

	// Escape key to close modal
	useEffect(() => {
		const handleEscape = (e) => e.key === 'Escape' && closeItemModal();
		if (showItemModal) window.addEventListener('keydown', handleEscape);
		return () => window.removeEventListener('keydown', handleEscape);
	}, [showItemModal]);

	const openItemModal = (item) => {
		setSelectedItem(item);
		setShowItemModal(true);
		document.documentElement.style.overflow = 'hidden';
	};

	const closeItemModal = () => {
		setShowItemModal(false);
		setSelectedItem(null);
		document.documentElement.style.overflow = '';
	};

	const formatAddress = (loc) => {
		if (!loc) return 'Address not available';
		const parts = [loc.house, loc.road, loc.area, loc.city].filter(Boolean);
		return parts.length ? parts.join(', ') : 'Address not available';
	};

	const groupedMenuItems = DAYS.reduce((acc, day) => {
		acc[day] = {
			lunch: menuItems.filter(
				(item) => item.day === day && item.mealType === 'lunch'
			),
			dinner: menuItems.filter(
				(item) => item.day === day && item.mealType === 'dinner'
			),
		};
		return acc;
	}, {});

	if (loading)
		return (
			<div className="min-h-screen flex items-center justify-center pt-20 bg-stone-50">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
					<p className="text-stone-600 text-lg">
						Loading kitchen details...
					</p>
				</div>
			</div>
		);

	if (error)
		return (
			<div className="min-h-screen flex items-center justify-center pt-20 p-4 bg-stone-50">
				<div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
					<div className="text-5xl mb-4 text-red-500">⚠️</div>
					<h2 className="text-2xl font-bold text-stone-900 mb-3">
						Error Loading Kitchen
					</h2>
					<p className="text-stone-600 mb-6">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold shadow-sm hover:bg-emerald-700 transition-all duration-300"
					>
						Try Again
					</button>
				</div>
			</div>
		);

	if (!kitchen)
		return (
			<div className="min-h-screen flex items-center justify-center pt-20 bg-stone-50">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-stone-900 mb-2">
						Kitchen Not Found
					</h2>
					<p className="text-stone-600">
						The restaurant you're looking for doesn't exist.
					</p>
				</div>
			</div>
		);

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#e4f4e7] via-[#f5f9f6] to-[#e1efe5] pt-12">
			
			<div className="max-w-7xl mx-auto px-4 py-8">
				
				{/* Top Header Section with Widgets */}
				{user && (
					<div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
						{/* Welcome / Title */}
						<div className="bg-gradient-to-r from-emerald-700 to-teal-600 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-center relative overflow-hidden">
							<div className="z-10">
								<h1 className="text-2xl font-bold mb-1 line-clamp-1">{kitchen.name}</h1>
								<p className="text-emerald-100 text-sm">Explore their menu and subscribe.</p>
							</div>
							<div className="absolute right-0 bottom-0 opacity-10 text-9xl transform translate-x-4 translate-y-4">
								🍽️
							</div>
						</div>

						{/* Wallet Widget */}
						<div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200/60 flex items-center justify-between">
							<div>
								<p className="text-stone-500 text-sm font-medium mb-1">Wallet Balance</p>
								<p className="text-2xl font-bold text-stone-800">{walletBalance.toFixed(0)} <span className="text-sm font-normal text-stone-500">BDT</span></p>
								<button onClick={() => navigate('/wallet')} className="text-emerald-600 text-sm font-medium hover:text-emerald-700 transition mt-1">
									Add funds →
								</button>
							</div>
							<div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-2xl">
								💳
							</div>
						</div>

						{/* Next Payment Widget */}
						<div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200/60 flex items-center justify-between">
							<div>
								<p className="text-stone-500 text-sm font-medium mb-1">Next Payment</p>
								{nextPayment ? (
									<>
										<p className="text-2xl font-bold text-stone-800">{nextPayment.amount.toFixed(0)} <span className="text-sm font-normal text-stone-500">BDT</span></p>
										<p className="text-stone-500 text-xs mt-1">{nextPayment.date}</p>
									</>
								) : (
									<p className="text-lg font-semibold text-stone-400">No active plans</p>
								)}
							</div>
							<div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl">
								📅
							</div>
						</div>
					</div>
				)}

				<div className="flex flex-col lg:flex-row gap-8">
					{/* Left Column: Info & Menu */}
					<div className="flex-1 min-w-0">
						
						{/* Kitchen Hero Card */}
						<div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 overflow-hidden mb-8">
							<div className="relative h-48 bg-emerald-50">
								<img 
									src={kitchen.imageUrl || FALLBACK_IMAGE} 
									alt={kitchen.name}
									onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }}
									className="w-full h-full object-cover"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
									<div className="p-6 text-white w-full">
										<h1 className="text-4xl font-bold mb-2">{kitchen.name}</h1>
										<div className="flex items-center gap-4 text-sm font-medium">
											<span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded backdrop-blur-md">
												<FaStar className="text-yellow-400" /> {kitchen.rating?.toFixed(1) || 'New'} ({kitchen.totalRatings || 0})
											</span>
											<span className="flex items-center gap-1">
												<FaMapMarkerAlt /> {kitchen.location?.city || 'Location'}
											</span>
											<span className="flex items-center gap-1">
												<FaTruck /> Free Delivery
											</span>
										</div>
									</div>
								</div>
							</div>
							
							<div className="p-6">
								<p className="text-stone-600 mb-6 leading-relaxed">
									{kitchen.about || "Welcome to our kitchen! We serve fresh, home-cooked meals prepared with love and the finest ingredients."}
								</p>
								
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-stone-500">
									<div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
										<FaMapMarkerAlt className="text-emerald-600 text-lg" />
										<span>{formatAddress(kitchen.location)}</span>
									</div>
									<div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
										<FaPhone className="text-emerald-600 text-lg" />
										<span>{kitchen.phone || "Not available"}</span>
									</div>
								</div>
							</div>
						</div>

						{/* Menu Section */}
						<div className="mb-8">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-2xl font-bold text-stone-800">Weekly Menu</h2>
								{isCustomer && menuItems.length > 0 && (
									<div className="flex gap-2">
										<button onClick={addAllLunch} className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg hover:bg-emerald-100 transition">
											+ All Lunch
										</button>
										<button onClick={addAllDinner} className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg hover:bg-emerald-100 transition">
											+ All Dinner
										</button>
									</div>
								)}
							</div>

							{menuItems.length === 0 ? (
								<div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-12 text-center">
									<span className="text-4xl block mb-3">🍳</span>
									<h3 className="text-lg font-bold text-stone-800">Menu Coming Soon</h3>
									<p className="text-stone-500">The chef is updating the menu. Check back later!</p>
								</div>
							) : (
								<div className="space-y-6">
									{DAYS.map((day) => (
										<DayMenu
											key={day}
											day={day}
											items={groupedMenuItems[day]}
											openItemModal={openItemModal}
											addToCart={addToCart}
											isCustomer={isCustomer}
										/>
									))}
								</div>
							)}
						</div>

						{/* Ratings & Reviews Section */}
						<div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-2xl font-bold text-stone-800">Reviews</h2>
								<div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
									<FaStar className="text-amber-400" />
									<span className="font-bold text-amber-700">{kitchen.rating?.toFixed(1) || '0.0'}</span>
									<span className="text-amber-600/70 text-sm">({kitchen.totalRatings || 0})</span>
								</div>
							</div>

							{/* Add Review Form */}
							{isCustomer && (
								<div className="bg-stone-50 rounded-xl p-4 mb-6 border border-stone-200">
									<h3 className="font-semibold text-stone-800 mb-3">Rate your experience</h3>
									<div className="flex gap-2 mb-3">
										{[1, 2, 3, 4, 5].map((star) => (
											<button
												key={star}
												onClick={() => setReviewRating(star)}
												className={`text-2xl transition ${star <= reviewRating ? 'text-amber-400' : 'text-stone-300'}`}
											>
												★
											</button>
										))}
									</div>
									<textarea
										value={reviewComment}
										onChange={(e) => setReviewComment(e.target.value)}
										placeholder="Share your thoughts about the food..."
										className="w-full rounded-lg border border-stone-300 p-3 mb-3 focus:border-emerald-500 focus:outline-none text-sm"
										rows="3"
									/>
									<button
										onClick={submitReview}
										disabled={reviewLoading}
										className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
									>
										{reviewLoading ? 'Submitting...' : 'Submit Review'}
									</button>
									{reviewError && <p className="text-red-500 text-sm mt-2">{reviewError}</p>}
								</div>
							)}

							{/* Reviews List */}
							<div className="space-y-4">
								{reviews.length === 0 ? (
									<p className="text-center text-stone-500 py-4">No reviews yet. Be the first to review!</p>
								) : (
									reviews.map((review) => (
										<div key={review._id} className="border-b border-stone-100 last:border-0 pb-4 last:pb-0">
											<div className="flex justify-between items-start mb-2">
												<div className="flex items-center gap-2">
													<div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
														{review.user?.name?.charAt(0) || 'U'}
													</div>
													<span className="font-medium text-stone-800">{review.user?.name || 'Anonymous'}</span>
												</div>
												<div className="flex text-amber-400 text-sm">
													{[...Array(5)].map((_, i) => (
														<span key={i}>{i < review.rating ? '★' : '☆'}</span>
													))}
												</div>
											</div>
											<p className="text-stone-600 text-sm">{review.comment}</p>
											<p className="text-xs text-stone-400 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
										</div>
									))
								)}
							</div>
						</div>
					</div>

					{/* Right Column: Subscription Manager (Sticky on Desktop) */}
					<div className="lg:w-96 shrink-0">
						<div className="sticky top-24 space-y-6">
							<div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6">
								<h2 className="text-xl font-bold text-stone-800 mb-2">Subscribe & Save</h2>
								<p className="text-sm text-stone-500 mb-4">
									Get fresh meals delivered automatically. Cancel anytime.
								</p>
								<SubscriptionManager restaurantId={id} />
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Item Modal */}
			{showItemModal && selectedItem && (
				<ItemModal
					item={selectedItem}
					closeModal={closeItemModal}
					addToCart={addToCart}
					isCustomer={isCustomer}
				/>
			)}

			<FloatingCart />
		</div>
	);
}

// Day Menu Component
const DayMenu = ({ day, items, openItemModal, addToCart, isCustomer }) => {
	const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
	if (!items.lunch.length && !items.dinner.length) return null;

	return (
		<div className="bg-white rounded-xl border border-stone-200/60 p-5 hover:border-emerald-200 transition-colors">
			<div className="flex items-center gap-3 mb-4">
				<span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
					{day}
				</span>
			</div>

			<div className="space-y-6">
				{items.lunch.length > 0 && (
					<div>
						<h4 className="text-sm font-semibold text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-2">
							<span>☀️</span> Lunch
						</h4>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							{items.lunch.map((item) => (
								<MenuItemCard
									key={item._id}
									item={item}
									openItemModal={openItemModal}
									addToCart={addToCart}
									isCustomer={isCustomer}
								/>
							))}
						</div>
					</div>
				)}

				{items.dinner.length > 0 && (
					<div>
						<h4 className="text-sm font-semibold text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-2">
							<span>🌙</span> Dinner
						</h4>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							{items.dinner.map((item) => (
								<MenuItemCard
									key={item._id}
									item={item}
									openItemModal={openItemModal}
									addToCart={addToCart}
									isCustomer={isCustomer}
								/>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

// Menu Item Card
const MenuItemCard = ({ item, openItemModal, addToCart, isCustomer }) => (
	<div
		onClick={() => openItemModal(item)}
		className="bg-stone-50 border border-stone-200 rounded-lg overflow-hidden hover:border-emerald-400 cursor-pointer group flex h-24"
	>
		<div className="w-24 h-24 shrink-0 bg-stone-200">
			<img
				src={item.imageUrl || FALLBACK_IMAGE}
				alt={item.name}
				onError={(e) => {
					e.currentTarget.onerror = null;
					e.currentTarget.src = FALLBACK_IMAGE;
				}}
				className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
			/>
		</div>

		<div className="p-3 flex flex-col justify-between flex-1 min-w-0">
			<div>
				<div className="flex justify-between items-start gap-2">
					<h4 className="font-semibold text-stone-900 text-sm line-clamp-1 group-hover:text-emerald-700 transition-colors">
						{item.name}
					</h4>
					<span className="text-xs font-bold text-emerald-700 whitespace-nowrap">
						{item.price} ৳
					</span>
				</div>
				{item.description && (
					<p className="text-stone-500 text-xs line-clamp-1 mt-0.5">
						{item.description}
					</p>
				)}
			</div>
			
			<div className="flex justify-end mt-1">
				{isCustomer ? (
					<button
						onClick={(e) => {
							e.stopPropagation();
							addToCart(item);
						}}
						className="bg-emerald-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-emerald-700 transition shadow-sm"
					>
						+ Add
					</button>
				) : (
					<span className="text-xs text-stone-400 bg-stone-100 px-2 py-1 rounded">Login</span>
				)}
			</div>
		</div>
	</div>
);

// Item Modal
const ItemModal = ({ item, closeModal, addToCart, isCustomer }) => (
	<div
		className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
		onClick={closeModal}
	>
		<div
			className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
			onClick={(e) => e.stopPropagation()}
		>
			<div className="relative h-56">
				<img
					src={item.imageUrl || FALLBACK_IMAGE}
					alt={item.name}
					onError={(e) => {
						e.currentTarget.onerror = null;
						e.currentTarget.src = FALLBACK_IMAGE;
					}}
					className="w-full h-full object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
					<div>
						<h3 className="text-2xl font-bold text-white mb-1">
							{item.name}
						</h3>
						<div className="flex items-center gap-3 text-white/90 text-sm font-medium">
							<span className="capitalize bg-white/20 px-2 py-0.5 rounded">{item.mealType}</span>
							{item.calories && (
								<span>{item.calories} cal</span>
							)}
						</div>
					</div>
				</div>
				<button
					onClick={closeModal}
					className="absolute top-4 right-4 w-8 h-8 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/50 transition"
				>
					✕
				</button>
			</div>

			<div className="p-6">
				<div className="flex justify-between items-center mb-4">
					<span className="text-3xl font-bold text-emerald-700">{item.price} BDT</span>
				</div>

				{item.description && (
					<p className="text-stone-600 mb-6 leading-relaxed">{item.description}</p>
				)}

				{item.ingredients?.length > 0 && (
					<div className="mb-8">
						<h4 className="font-semibold text-stone-900 mb-3 text-sm uppercase tracking-wider">
							Ingredients
						</h4>
						<div className="flex flex-wrap gap-2">
							{item.ingredients.map((ing, i) => (
								<span
									key={i}
									className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-sm font-medium"
								>
									{ing}
								</span>
							))}
						</div>
					</div>
				)}

				<div className="flex gap-3 pt-4 border-t border-stone-100">
					{isCustomer ? (
						<button
							onClick={() => {
								addToCart(item);
								closeModal();
							}}
							className="flex-1 bg-emerald-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
						>
							Add to Cart
						</button>
					) : (
						<div className="flex-1 bg-stone-100 text-stone-400 px-6 py-3.5 rounded-xl font-bold text-center">
							Login to Order
						</div>
					)}
				</div>
			</div>
		</div>
	</div>
);
