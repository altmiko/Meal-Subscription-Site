import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { FaStar, FaUtensils, FaMapMarkerAlt, FaPhone, FaClock } from 'react-icons/fa';

export default function KitchenProfile() {
	const { id } = useParams();
	const [kitchen, setKitchen] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchKitchen = async () => {
			try {
				setLoading(true);
				const response = await axiosInstance.get(
					`/api/restaurants/${id}`
				);
				setKitchen(response.data);
			} catch (err) {
				setError(err.message || 'Failed to fetch kitchen data');
			} finally {
				setLoading(false);
			}
		};

		fetchKitchen();
	}, [id]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center pt-24 bg-gray-50">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
					<p className="text-gray-600 text-lg">
						Loading kitchen details...
					</p>
				</div>
			</div>
		);
	}

	if (error) {
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
						className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	if (!kitchen) {
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
	}

	// Format address
	const formatAddress = (location) => {
		if (!location) return 'Address not available';
		const parts = [
			location.house,
			location.road,
			location.area,
			location.city,
		].filter(Boolean);
		return parts.length > 0 ? parts.join(', ') : 'Address not available';
	};

	return (
		<div className="min-h-screen bg-gray-50 pt-24">
			{/* Hero Section */}
			<div className="bg-gradient-to-br from-orange-400 to-amber-500 text-white py-16 px-4 relative overflow-hidden">
				<div className="absolute inset-0 bg-black opacity-10"></div>
				<div className="max-w-7xl mx-auto relative z-10 text-center">
					<h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
						{kitchen.name}
					</h1>
					<p className="text-xl max-w-3xl mx-auto mb-6">
						{kitchen.description || 'Serving delicious meals with passion'}
					</p>
					
					{kitchen.rating && (
						<div className="flex items-center justify-center gap-2 mb-4">
							{[...Array(5)].map((_, i) => (
								<FaStar 
									key={i} 
									className={`text-xl ${i < Math.floor(kitchen.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
								/>
							))}
							<span className="text-lg font-semibold">
								{kitchen.rating?.toFixed(1)} ({kitchen.totalRatings || 0} reviews)
							</span>
						</div>
					)}
					
					<div className="flex flex-wrap justify-center gap-4 mt-8">
						{kitchen.isOpen !== undefined && (
							<div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
								<FaClock className="text-white" />
								<span className="font-semibold">
									{kitchen.isOpen ? 'OPEN NOW' : 'CLOSED'}
								</span>
							</div>
						)}
						{kitchen.cuisineTypes && kitchen.cuisineTypes.length > 0 && (
							<div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
								<FaUtensils className="text-white" />
								<span className="font-semibold">
									{kitchen.cuisineTypes.slice(0, 3).join(', ')}
								</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Restaurant Info */}
			<div className="max-w-7xl mx-auto px-4 py-8">
				<div className="bg-white rounded-xl shadow-md p-6 mb-8">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div>
							<h2 className="text-2xl font-bold text-gray-900 mb-4">About Us</h2>
							<p className="text-gray-700 mb-6">
								{kitchen.about || `Welcome to ${kitchen.name}, where we serve delicious meals made with fresh ingredients and passion.`}
							</p>
							
							<div className="space-y-3">
								{kitchen.location && (
									<div className="flex items-start">
										<FaMapMarkerAlt className="text-orange-500 mt-1 mr-3" />
										<div>
											<h3 className="font-semibold text-gray-900">Address</h3>
											<p className="text-gray-700">{formatAddress(kitchen.location)}</p>
										</div>
									</div>
								)}
								
								{kitchen.phone && (
									<div className="flex items-start">
										<FaPhone className="text-orange-500 mt-1 mr-3" />
										<div>
											<h3 className="font-semibold text-gray-900">Phone</h3>
											<p className="text-gray-700">{kitchen.phone}</p>
										</div>
									</div>
								)}
							</div>
						</div>
						
						{/* Hours Placeholder */}
						<div>
							<h2 className="text-2xl font-bold text-gray-900 mb-4">Opening Hours</h2>
							<div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4">
								<ul className="space-y-2">
									<li className="flex justify-between py-2 border-b border-orange-100">
										<span className="font-medium">Monday - Friday</span>
										<span>9:00 AM - 9:00 PM</span>
									</li>
									<li className="flex justify-between py-2 border-b border-orange-100">
										<span className="font-medium">Saturday - Sunday</span>
										<span>10:00 AM - 10:00 PM</span>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>

				{/* Menu Section */}
				<div className="mb-12">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
						<h2 className="text-3xl font-bold text-gray-900">Our Menu</h2>
						<div className="flex items-center gap-2">
							<span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
								{kitchen.meals?.length || 0} items
							</span>
						</div>
					</div>
					
					{kitchen.meals && kitchen.meals.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{kitchen.meals.map((meal) => (
								<div
									key={meal._id}
									className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 flex flex-col h-full"
								>
									{/* Meal Image Placeholder */}
									<div className="h-52 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
										<span className="text-6xl text-orange-500">
											🍽️
										</span>
									</div>

									{/* Meal Info */}
									<div className="p-5 flex flex-col flex-grow">
										<div className="flex-grow">
											<div className="flex justify-between items-start">
												<h3 className="text-xl font-bold text-gray-900 mb-2">
													{meal.name}
												</h3>
												<p className="text-lg font-bold text-orange-600 whitespace-nowrap">
													${meal.price.toFixed(2)}
												</p>
											</div>
											<p className="text-gray-600 mb-4">
												{meal.description}
											</p>
										</div>
										<button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white w-full py-3 rounded-lg font-semibold shadow-md hover:from-orange-600 hover:to-amber-600 transition-all duration-300 mt-auto">
											Add to Cart
										</button>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="bg-white rounded-xl shadow-md p-12 text-center">
							<div className="text-7xl mb-6 text-orange-500">🍽️</div>
							<h3 className="text-2xl font-bold text-gray-900 mb-3">
								Our menu is being prepared
							</h3>
							<p className="text-gray-600">
								Check back soon for delicious options!
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
