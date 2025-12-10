import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';

export default function Restaurants() {
	const navigate = useNavigate();
	const [restaurants, setRestaurants] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCuisine, setSelectedCuisine] = useState('');

	useEffect(() => {
		fetchRestaurants();
	}, []);

	const fetchRestaurants = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await axiosInstance.get('/api/restaurants');
			setRestaurants(response.data);
		} catch (err) {
			setError(
				err.response?.data?.error ||
					err.message ||
					'Failed to load restaurants'
			);
			console.error('Error fetching restaurants:', err);
		} finally {
			setLoading(false);
		}
	};

	// Get unique cuisine types from all restaurants
	const allCuisines = [
		...new Set(
			restaurants.flatMap((restaurant) => restaurant.cuisineTypes || [])
		),
	].sort();

	// Filter restaurants based on search and cuisine
	const filteredRestaurants = restaurants.filter((restaurant) => {
		const matchesSearch =
			restaurant.name
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			restaurant.location?.city
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			restaurant.location?.area
				?.toLowerCase()
				.includes(searchTerm.toLowerCase());

		const matchesCuisine =
			!selectedCuisine ||
			restaurant.cuisineTypes?.includes(selectedCuisine);

		return matchesSearch && matchesCuisine;
	});

	// Format address
	const formatAddress = (location) => {
		if (!location) return 'Address not available';
		const parts = [location.house, location.road, location.area, location.city].filter(
			Boolean
		);
		return parts.length > 0 ? parts.join(', ') : 'Address not available';
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 border-t-transparent mx-auto mb-4"></div>
					<p className="text-gray-600 text-lg">
						Loading restaurants...
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24 p-4">
				<div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 max-w-md text-center">
					<div className="text-5xl mb-4">⚠️</div>
					<h2 className="text-red-800 font-bold text-xl mb-2">
						Error Loading Restaurants
					</h2>
					<p className="text-red-600 mb-6">{error}</p>
					<button
						onClick={fetchRestaurants}
						className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white pt-24">
			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-8 text-center">
					<h1 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-4 tracking-tight">
						Restaurants
					</h1>
					<p className="text-xl text-gray-600 mb-6">
						Discover amazing places to eat
					</p>

					{/* Search and Filter */}
					<div className="max-w-2xl mx-auto mb-6">
						<div className="flex flex-col md:flex-row gap-4">
							{/* Search Input */}
							<div className="flex-1">
								<input
									type="text"
									placeholder="Search by name or location..."
									value={searchTerm}
									onChange={(e) =>
										setSearchTerm(e.target.value)
									}
									className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition"
								/>
							</div>

							{/* Cuisine Filter */}
							{allCuisines.length > 0 && (
								<select
									value={selectedCuisine}
									onChange={(e) =>
										setSelectedCuisine(e.target.value)
									}
									className="px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition bg-white"
								>
									<option value="">All Cuisines</option>
									{allCuisines.map((cuisine) => (
										<option key={cuisine} value={cuisine}>
											{cuisine}
										</option>
									))}
								</select>
							)}
						</div>
					</div>

					{/* Results Count */}
					<p className="text-gray-700">
						<span className="font-semibold text-emerald-700">
							{filteredRestaurants.length}
						</span>{' '}
						restaurant{filteredRestaurants.length !== 1 ? 's' : ''}{' '}
						found
						{searchTerm || selectedCuisine
							? ` (of ${restaurants.length} total)`
							: ''}
					</p>
				</div>

				{/* No Restaurants */}
				{filteredRestaurants.length === 0 ? (
					<div className="bg-gray-50 rounded-xl border border-gray-100 shadow-sm p-12 text-center max-w-2xl mx-auto">
						<div className="text-7xl mb-6">🍽️</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-3">
							{restaurants.length === 0
								? 'No Restaurants Yet'
								: 'No Matching Restaurants'}
						</h3>
						<p className="text-gray-600 text-lg mb-4">
							{restaurants.length === 0
								? 'Check back soon for delicious options!'
								: 'Try adjusting your search or filter criteria.'}
						</p>
						{(searchTerm || selectedCuisine) && (
							<button
								onClick={() => {
									setSearchTerm('');
									setSelectedCuisine('');
								}}
								className="font-semibold text-emerald-700 hover:text-emerald-800 underline"
							>
								Clear filters
							</button>
						)}
					</div>
				) : (
					/* Restaurant Grid */
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredRestaurants.map((restaurant) => (
							<div
								key={restaurant._id}
								className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
								onClick={() =>
									navigate(`/restaurants/${restaurant._id}`)
								}
							>
								{/* Restaurant Image Placeholder */}
								<div className="h-48 bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center relative overflow-hidden">
									<span className="text-6xl z-10 text-emerald-800">🍽️</span>
									<div className="absolute inset-0 bg-emerald-900/5 opacity-0 hover:opacity-100 transition-opacity"></div>
								</div>

								{/* Restaurant Info */}
								<div className="p-6">
									<h2 className="text-2xl font-semibold text-gray-900 mb-3 line-clamp-1 tracking-tight">
										{restaurant.restaurantName || restaurant.name ||
											'Unnamed Restaurant'}
									</h2>

									<div className="space-y-2 mb-4">
										{/* Location */}
										{restaurant.location && (
											<div className="flex items-start text-gray-600">
												<span className="mr-2 mt-1">
													📍
												</span>
												<span className="text-sm flex-1">
													{formatAddress(
														restaurant.location
													)}
												</span>
											</div>
										)}

										{/* Cuisine Types */}
										{restaurant.cuisineTypes &&
											restaurant.cuisineTypes.length >
												0 && (
												<div className="flex items-start flex-wrap gap-2">
													<span className="mr-2 mt-1">
														🍴
													</span>
													<div className="flex flex-wrap gap-2 flex-1">
														{restaurant.cuisineTypes.map(
															(cuisine, idx) => (
																<span
																	key={idx}
																	className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded-full"
																>
																	{cuisine}
																</span>
															)
														)}
													</div>
												</div>
											)}
									</div>

									<button
										onClick={(e) => {
											e.stopPropagation();
											navigate(
												`/restaurants/${restaurant._id}`
											);
										}}
										className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg"
									>
										View Menu
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
