import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axios';
import {
	FaMapMarkerAlt,
	FaPhone,
	FaStar,
	FaTruck,
	FaHeart,
	FaAward,
	FaUtensils,
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
	const [kitchen, setKitchen] = useState(null);
	const [menuItems, setMenuItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedItem, setSelectedItem] = useState(null);
	const [showItemModal, setShowItemModal] = useState(false);
	const [user, setUser] = useState(null);
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
			} catch (err) {
				console.error('Error parsing user data:', err);
			}
		}
	}, []);

	// Check if user is a customer
	const isCustomer = user && user.role === 'customer';

	const [reviews, setReviews] = useState([]);
	const [reviewRating, setReviewRating] = useState(5);
	const [reviewComment, setReviewComment] = useState('');
	const [reviewLoading, setReviewLoading] = useState(false);
	const [reviewError, setReviewError] = useState(null);
	void reviews;
	void reviewLoading;
	void reviewError;

	const todayIndex = new Date().getDay();

	// Persist cart
	useEffect(() => {
		localStorage.setItem('cart', JSON.stringify(cart));
		// Dispatch event to notify FloatingCart
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
			date: deliveryDate.toISOString(), // Use 'date' instead of 'deliveryDate'
			deliveryDate: deliveryDate.toISOString(), // Keep for backward compatibility
			restaurant: id, // Add restaurant ID
			restaurantId: id, // Also add restaurantId for consistency
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
					deliveryDate: deliveryDate.toISOString(), // Keep for backward compatibility
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
	void submitReview;

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
			<div className="min-h-screen flex items-center justify-center pt-20 bg-gray-50">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
					<p className="text-gray-600 text-lg">
						Loading kitchen details...
					</p>
				</div>
			</div>
		);

	if (error)
		return (
			<div className="min-h-screen flex items-center justify-center pt-20 p-4 bg-gray-50">
				<div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
					<div className="text-5xl mb-4 text-red-500">⚠️</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-3">
						Error Loading Kitchen
					</h2>
					<p className="text-gray-600 mb-6">{error}</p>
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
			<div className="min-h-screen flex items-center justify-center pt-20 bg-gray-50">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Kitchen Not Found
					</h2>
					<p className="text-gray-600">
						The restaurant you're looking for doesn't exist.
					</p>
				</div>
			</div>
		);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Action Bar */}
			<section className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
				<div className="max-w-7xl mx-auto px-4 py-3 flex gap-3 justify-end">
					<Link
						to={`/restaurants/${id}/add-review`}
						className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2"
					>
						<FaStar /> Add Review
					</Link>
					<Link
						to={`/restaurants/${id}/reviews`}
						className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
					>
						View Reviews
					</Link>
				</div>
			</section>

			{/* Compact Hero Section */}
			<section className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-8">
				<div className="max-w-7xl mx-auto">
					<div className="flex flex-col md:flex-row items-center justify-between gap-6">
						<div className="flex-1">
							<div className="flex items-center gap-2 mb-3">
								<FaAward className="text-yellow-300" />
								<span className="text-sm font-semibold bg-white/20 px-2 py-1 rounded">
									Premium Kitchen
								</span>
							</div>
							<h1 className="text-3xl md:text-4xl font-bold mb-2">
								{kitchen.name}
							</h1>
							<p className="text-white/90 mb-4 max-w-2xl">
								{kitchen.description ||
									'Serving fresh, delicious meals crafted with passion and the finest ingredients.'}
							</p>
							<div className="flex items-center gap-4 text-sm">
								<div className="flex items-center gap-1">
									<FaStar className="text-yellow-300" />
									<span>4.8 Rating</span>
								</div>
								<div className="flex items-center gap-1">
									<FaTruck />
									<span>Free Delivery</span>
								</div>
								<div className="flex items-center gap-1">
									<span>30-45 min</span>
								</div>
							</div>
						</div>
						{isCustomer && (
							<div className="flex gap-3">
								<Link
									to="/cart"
									className="bg-white text-emerald-700 px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
								>
									<span>🛒</span>
									View Cart ({cart.length})
								</Link>
								<button className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-bold border border-white/30 hover:bg-white/30 transition-all flex items-center gap-2">
									<FaHeart /> Save
								</button>
							</div>
						)}
					</div>
				</div>
			</section>

			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* Kitchen Info - Compact */}
				<section className="mb-8">
					<div className="bg-white rounded-xl shadow-md p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<h2 className="text-xl font-bold text-gray-900 mb-3">
									About {kitchen.name}
								</h2>
								<p className="text-gray-600 mb-4">
									{kitchen.about ||
										`Welcome to ${kitchen.name}, where culinary artistry meets passion. We believe that great food starts with the finest ingredients, sourced locally and prepared with love.`}
								</p>
								<div className="flex flex-wrap gap-4">
									<div className="flex items-center gap-2 text-sm text-gray-600">
										<span className="text-emerald-600">
											✓
										</span>{' '}
										Fresh Ingredients
									</div>
									<div className="flex items-center gap-2 text-sm text-gray-600">
										<span className="text-emerald-600">
											✓
										</span>{' '}
										Chef's Special
									</div>
									<div className="flex items-center gap-2 text-sm text-gray-600">
										<span className="text-emerald-600">
											✓
										</span>{' '}
										Fast Delivery
									</div>
								</div>
							</div>
							<div>
								<h3 className="text-xl font-bold text-gray-900 mb-3">
									Contact Info
								</h3>
								<div className="space-y-3">
									{kitchen.location && (
										<div className="flex items-start gap-3">
											<FaMapMarkerAlt className="text-emerald-600 mt-1" />
											<div>
												<h4 className="font-semibold text-gray-900">
													Address
												</h4>
												<p className="text-gray-600 text-sm">
													{formatAddress(
														kitchen.location
													)}
												</p>
											</div>
										</div>
									)}
									{kitchen.phone && (
										<div className="flex items-center gap-3">
											<FaPhone className="text-emerald-600" />
											<div>
												<h4 className="font-semibold text-gray-900">
													Phone
												</h4>
												<p className="text-gray-600 text-sm">
													{kitchen.phone}
												</p>
											</div>
										</div>
									)}
									<div className="bg-emerald-50 p-3 rounded-lg">
										<h4 className="font-semibold text-gray-900">
											Hours
										</h4>
										<p className="text-gray-600 text-sm">
											Mon-Sat: 10AM-10PM, Sun: 11AM-9PM
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Menu Section - Compact */}
				<section className="mb-8">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-2xl font-bold text-gray-900">
							Our Menu
						</h2>
						{menuItems.length > 0 && (
							<p className="text-gray-600">
								{menuItems.length} items available
							</p>
						)}
					</div>

					{menuItems.length === 0 ? (
						<div className="bg-white rounded-xl shadow-md p-8 text-center">
							<div className="text-6xl mb-4 text-gray-300">
								🍽️
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-2">
								Menu Coming Soon
							</h3>
							<p className="text-gray-600">
								This kitchen is preparing something amazing.
								Check back soon!
							</p>
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
				</section>

				{/* Quick Add - Compact */}
				{menuItems.length > 0 && isCustomer && (
					<section className="mb-8">
						<div className="bg-emerald-600 rounded-xl p-6 text-white">
							<h3 className="text-lg font-bold mb-2">
								Quick Order
							</h3>
							<p className="text-emerald-100 text-sm mb-4">
								Add all meals for the rest of the week
							</p>
							<div className="grid grid-cols-2 gap-4">
								<button
									onClick={addAllLunch}
									className="bg-white text-emerald-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
								>
									🍽️ All Lunch
								</button>
								<button
									onClick={addAllDinner}
									className="bg-white text-emerald-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
								>
									🌙 All Dinner
								</button>
							</div>
						</div>
					</section>
				)}

				{/* Subscription Section - Kept Exactly the Same */}
				<section className="mb-8">
					<div className="bg-white rounded-xl shadow-md p-6">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">
							Meal Subscriptions
						</h2>
						<p className="text-gray-600 mb-4">
							Subscribe to get meals delivered automatically each
							week. Choose specific meals for each day or package
							all lunches/dinners.
						</p>
						<SubscriptionManager restaurantId={id} />
					</div>
				</section>
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

			{/* Floating Cart */}
			<FloatingCart />
		</div>
	);
}

// Day Menu Component - Compact
const DayMenu = ({ day, items, openItemModal, addToCart, isCustomer }) => {
	const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
	if (!items.lunch.length && !items.dinner.length) return null;

	return (
		<div className="bg-white rounded-xl shadow-md p-6">
			<div className="flex items-center gap-3 mb-4">
				<div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
					<span className="text-white font-bold text-sm">
						{capitalize(day).charAt(0)}
					</span>
				</div>
				<h3 className="text-lg font-bold text-gray-900">
					{capitalize(day)}
				</h3>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{items.lunch.length > 0 && (
					<div>
						<h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
							<span>🍽️</span> Lunch ({items.lunch.length})
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
						<h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
							<span>🌙</span> Dinner ({items.dinner.length})
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

// Menu Item Card - Compact Square
const MenuItemCard = ({ item, openItemModal, addToCart, isCustomer }) => (
	<div
		onClick={() => openItemModal(item)}
		className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden hover:border-emerald-400 hover:shadow-md transition-all duration-200 cursor-pointer group"
	>
		<div className="aspect-square relative overflow-hidden">
			<img
				src={item.imageUrl || FALLBACK_IMAGE}
				alt={item.name}
				onError={(e) => {
					e.currentTarget.onerror = null;
					e.currentTarget.src = FALLBACK_IMAGE;
				}}
				className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
			/>
			<div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm">
				<span className="font-bold text-emerald-700 text-sm">
					{item.price} BDT
				</span>
			</div>
			{item.calories && (
				<div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded">
					<span className="text-white text-xs font-semibold">
						{item.calories} cal
					</span>
				</div>
			)}
		</div>

		<div className="p-3">
			<h4 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-emerald-700 transition-colors">
				{item.name}
			</h4>
			{item.description && (
				<p className="text-gray-600 text-xs mb-2 line-clamp-1">
					{item.description}
				</p>
			)}
			<div className="flex items-center justify-between">
				<span className="text-xs text-gray-500 capitalize">
					{item.day} • {item.mealType}
				</span>
				{isCustomer ? (
					<button
						onClick={(e) => {
							e.stopPropagation();
							addToCart(item);
						}}
						className="bg-emerald-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-emerald-700 transition-colors"
					>
						Add
					</button>
				) : (
					<div className="bg-gray-200 text-gray-500 px-3 py-1 rounded text-xs font-semibold text-center">
						Login
					</div>
				)}
			</div>
		</div>
	</div>
);

// Item Modal - Compact
const ItemModal = ({ item, closeModal, addToCart, isCustomer }) => (
	<div
		className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
		onClick={closeModal}
	>
		<div
			className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
			onClick={(e) => e.stopPropagation()}
		>
			<div className="relative">
				<img
					src={item.imageUrl || FALLBACK_IMAGE}
					alt={item.name}
					onError={(e) => {
						e.currentTarget.onerror = null;
						e.currentTarget.src = FALLBACK_IMAGE;
					}}
					className="w-full h-48 object-cover"
				/>
				<button
					onClick={closeModal}
					className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
				>
					✕
				</button>
			</div>

			<div className="p-6">
				<div className="flex justify-between items-start mb-4">
					<div>
						<h3 className="text-2xl font-bold text-gray-900 mb-2">
							{item.name}
						</h3>
						<div className="flex items-center gap-3 text-gray-600 text-sm">
							<span className="capitalize">{item.day}</span>
							<span>•</span>
							<span className="capitalize">{item.mealType}</span>
							{item.calories && (
								<>
									<span>•</span>
									<span>{item.calories} calories</span>
								</>
							)}
						</div>
					</div>
					<div className="text-2xl font-bold text-emerald-700">
						{item.price} BDT
					</div>
				</div>

				{item.description && (
					<p className="text-gray-700 mb-4">{item.description}</p>
				)}

				{item.ingredients?.length > 0 && (
					<div className="mb-6">
						<h4 className="font-bold text-gray-900 mb-2">
							Ingredients
						</h4>
						<div className="flex flex-wrap gap-2">
							{item.ingredients.map((ing, i) => (
								<span
									key={i}
									className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-sm font-semibold"
								>
									{ing}
								</span>
							))}
						</div>
					</div>
				)}

				<div className="flex gap-3">
					{isCustomer ? (
						<button
							onClick={() => {
								addToCart(item);
								closeModal();
							}}
							className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors"
						>
							Add to Cart
						</button>
					) : (
						<div className="flex-1 bg-gray-200 text-gray-500 px-6 py-3 rounded-lg font-bold text-center">
							Login to Order
						</div>
					)}
					<button
						onClick={closeModal}
						className="px-6 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	</div>
);
