import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
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
	const [cart, setCart] = useState(() => {
		const saved = localStorage.getItem('cart');
		return saved ? JSON.parse(saved) : [];
	});

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
			<div className="min-h-screen flex items-center justify-center pt-24 bg-gray-50">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 border-t-transparent mx-auto mb-4"></div>
					<p className="text-gray-600 text-lg">
						Loading kitchen details...
					</p>
				</div>
			</div>
		);

	if (error)
		return (
			<div className="min-h-screen flex items-center justify-center pt-24 p-4 bg-gray-50">
				<div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
					<div className="text-5xl mb-4 text-red-500">⚠️</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-3">
						Error Loading Kitchen
					</h2>
					<p className="text-gray-600 mb-6">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold shadow-sm hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg transition-all duration-300"
					>
						Try Again
					</button>
				</div>
			</div>
		);

	if (!kitchen)
		return (
			<div className="min-h-screen flex items-center justify-center pt-24 bg-gray-50">
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
			{/* Hero Section */}
			<section className="max-w-7xl mx-auto px-4 py-6 flex gap-4 justify-end">
				<Link
					to={`/restaurants/${id}/add-review`}
					className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition"
				>
					➕ Add Review
				</Link>
				<Link
					to={`/restaurants/${id}/reviews`}
					className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
				>
					View Reviews
				</Link>
			</section>

			<section className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500 text-white py-16 px-4 relative overflow-hidden">
				<div className="absolute inset-0 bg-black opacity-10"></div>
				<div className="max-w-7xl mx-auto relative z-10 text-center">
					<h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
						{kitchen.name}
					</h1>
					<p className="text-xl max-w-3xl mx-auto mb-6">
						{kitchen.description ||
							'Serving fresh and delicious meals with passion.'}
					</p>
					<Link
						to="/cart"
						className="inline-block mt-4 bg-white text-emerald-700 px-5 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
					>
						🛒 View Cart ({cart.length})
					</Link>
				</div>
			</section>

			{/* Kitchen Info */}
			<section className="max-w-7xl mx-auto px-4 py-8">
				<div className="bg-white rounded-xl shadow-md p-6 mb-8">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div>
							<h2 className="text-2xl font-bold text-gray-900 mb-4">
								About Us
							</h2>
							<p className="text-gray-700 mb-6">
								{kitchen.about ||
									`Welcome to ${kitchen.name}, where we serve fresh, delicious meals.`}
							</p>
							<div className="space-y-3">
								{kitchen.location && (
									<div className="flex items-start">
										<FaMapMarkerAlt className="text-emerald-600 mt-1 mr-3" />
										<div>
											<h3 className="font-semibold text-gray-900">
												Address
											</h3>
											<p className="text-gray-700">
												{formatAddress(
													kitchen.location
												)}
											</p>
										</div>
									</div>
								)}
								{kitchen.phone && (
									<div className="flex items-start">
										<FaPhone className="text-emerald-600 mt-1 mr-3" />
										<div>
											<h3 className="font-semibold text-gray-900">
												Phone
											</h3>
											<p className="text-gray-700">
												{kitchen.phone}
											</p>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Menu Section */}
			<section className="max-w-7xl mx-auto px-4 mb-12">
				<h2 className="text-3xl font-bold text-gray-900 mb-6">
					Our Menu
				</h2>
				{menuItems.length === 0 ? (
					<div className="bg-white rounded-xl shadow-md p-12 text-center">
						<div className="text-7xl mb-6 text-emerald-600">🍽️</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-3">
							Menu coming soon
						</h3>
						<p className="text-gray-600">
							This restaurant hasn't added their menu yet. Check
							back soon!
						</p>
					</div>
				) : (
					DAYS.map((day) => (
						<DayMenu
							key={day}
							day={day}
							items={groupedMenuItems[day]}
							openItemModal={openItemModal}
							addToCart={addToCart}
						/>
					))
				)}
			</section>

			{/* Add All Buttons */}
			{menuItems.length > 0 && (
				<section className="max-w-7xl mx-auto px-4 mb-12">
					<div className="flex flex-col sm:flex-row gap-4 w-full">
						<button
							onClick={addAllLunch}
							className="flex-1 bg-emerald-600 text-white px-6 py-4 rounded-lg hover:bg-emerald-700 font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
						>
							🍽️ Add All Lunch Items
						</button>
						<button
							onClick={addAllDinner}
							className="flex-1 bg-emerald-700 text-white px-6 py-4 rounded-lg hover:bg-emerald-800 font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-600"
						>
							🌙 Add All Dinner Items
						</button>
					</div>
				</section>
			)}

			{/* Subscription Section */}
			<section className="max-w-7xl mx-auto px-4 mb-12">
				<div className="bg-white rounded-xl shadow-md p-6">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">
						Meal Subscriptions
					</h2>
					<p className="text-gray-600 mb-4">
						Subscribe to get meals delivered automatically each
						week. Choose specific meals for each day or package all
						lunches/dinners.
					</p>
					<SubscriptionManager restaurantId={id} />
				</div>
			</section>

			{/* Item Modal */}
			{showItemModal && selectedItem && (
				<ItemModal
					item={selectedItem}
					closeModal={closeItemModal}
					addToCart={addToCart}
				/>
			)}

			{/* Floating Cart */}
			<FloatingCart />
		</div>
	);
}

// Day Menu Component
const DayMenu = ({ day, items, openItemModal, addToCart }) => {
	const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
	if (!items.lunch.length && !items.dinner.length)
		return (
			<p className="text-gray-500 mb-4">
				No items available for {capitalize(day)}.
			</p>
		);

	return (
		<div className="mb-8">
			<h3 className="text-2xl font-semibold text-gray-800 mb-4">
				Menu for {capitalize(day)}
			</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{items.lunch.length > 0 && (
					<div>
						<h4 className="text-xl font-semibold text-emerald-700 mb-2">
							🍽️ Lunch
						</h4>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{items.lunch.map((item) => (
								<MenuItemCard
									key={item._id}
									item={item}
									openItemModal={openItemModal}
									addToCart={addToCart}
								/>
							))}
						</div>
					</div>
				)}
				{items.dinner.length > 0 && (
					<div>
						<h4 className="text-xl font-semibold text-emerald-700 mb-2">
							🌙 Dinner
						</h4>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{items.dinner.map((item) => (
								<MenuItemCard
									key={item._id}
									item={item}
									openItemModal={openItemModal}
									addToCart={addToCart}
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
const MenuItemCard = ({ item, openItemModal, addToCart }) => (
	<div
		onClick={() => openItemModal(item)}
		className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 flex flex-col h-full cursor-pointer"
	>
		<img
			src={item.imageUrl || FALLBACK_IMAGE}
			alt={item.name}
			onError={(e) => {
				e.currentTarget.onerror = null;
				e.currentTarget.src = FALLBACK_IMAGE;
			}}
			className="h-52 w-full object-cover"
		/>
		<div className="p-5 flex flex-col flex-grow">
			<div className="flex-grow">
				<div className="flex justify-between items-start">
					<h3 className="text-xl font-bold text-gray-900 mb-2">
						{item.name}
					</h3>
					<p className="text-lg font-bold text-emerald-700 whitespace-nowrap ml-2">
						{item.price} BDT
					</p>
				</div>
				{item.description && (
					<p className="text-gray-600 mb-4 text-sm">
						{item.description}
					</p>
				)}
			</div>
			<button
				onClick={(e) => {
					e.stopPropagation();
					addToCart(item);
				}}
				className="bg-emerald-600 text-white w-full py-3 rounded-lg font-semibold shadow-sm hover:-translate-y-0.5 hover:bg-emerald-700 transition-all duration-300 mt-auto"
			>
				Add to Cart
			</button>
		</div>
	</div>
);

// Item Modal
const ItemModal = ({ item, closeModal, addToCart }) => (
	<div
		className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4"
		onClick={closeModal}
	>
		<div
			className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
			onClick={(e) => e.stopPropagation()}
		>
			<img
				src={item.imageUrl || FALLBACK_IMAGE}
				alt={item.name}
				onError={(e) => {
					e.currentTarget.onerror = null;
					e.currentTarget.src = FALLBACK_IMAGE;
				}}
				className="w-full h-64 md:h-80 object-cover"
			/>
			<div className="p-6">
				<h3 className="text-2xl font-bold text-gray-900">
					{item.name}
				</h3>
				<p className="text-gray-600 mt-2">{item.description}</p>
				<p className="mt-1 text-sm text-gray-500">
					Day:{' '}
					<span className="font-semibold">
						{item.day?.charAt(0).toUpperCase() + item.day?.slice(1)}
					</span>
				</p>
				{item.calories && (
					<p className="mt-1 text-sm text-gray-500">
						Calories: {item.calories} kcal
					</p>
				)}
				{item.ingredients?.length > 0 && (
					<ul className="list-disc ml-5 mt-2 text-gray-700">
						{item.ingredients.map((ing, i) => (
							<li key={i}>{ing}</li>
						))}
					</ul>
				)}
				<div className="mt-6 flex flex-col sm:flex-row gap-3">
					<button
						onClick={() => {
							addToCart(item);
							closeModal();
						}}
						className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
					>
						Add to Cart
					</button>
				</div>
			</div>
		</div>
	</div>
);
