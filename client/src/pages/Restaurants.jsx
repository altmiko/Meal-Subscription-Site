import { useState } from 'react';

export default function Restaurants() {
	const [searchQuery, setSearchQuery] = useState('');

	// Sample restaurant data
	const restaurants = [
		{
			id: 1,
			name: 'Bella Italia',
			cuisine: 'Italian',
			rating: 4.8,
			deliveryTime: '25-35 min',
			image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
		},
		{
			id: 2,
			name: 'Sakura Sushi',
			cuisine: 'Japanese',
			rating: 4.9,
			deliveryTime: '30-40 min',
			image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&q=80',
		},
		{
			id: 3,
			name: 'Taco Fiesta',
			cuisine: 'Mexican',
			rating: 4.7,
			deliveryTime: '20-30 min',
			image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
		},
		{
			id: 4,
			name: 'Golden Dragon',
			cuisine: 'Chinese',
			rating: 4.6,
			deliveryTime: '25-35 min',
			image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=80',
		},
		{
			id: 5,
			name: 'Burger House',
			cuisine: 'American',
			rating: 4.5,
			deliveryTime: '15-25 min',
			image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80',
		},
		{
			id: 6,
			name: 'Spice Garden',
			cuisine: 'Indian',
			rating: 4.8,
			deliveryTime: '30-40 min',
			image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80',
		},
	];

	const filteredRestaurants = restaurants.filter((restaurant) =>
		restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="min-h-screen pt-24 px-4 pb-12">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
						Restaurants
					</h1>
					<p className="text-xl text-gray-600 mb-6">
						Discover amazing restaurants near you
					</p>

					{/* Search Bar */}
					<div className="max-w-2xl mx-auto">
						<input
							type="text"
							placeholder="Search restaurants or cuisines..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full px-6 py-3 rounded-full border-2 border-gray-200 focus:border-green-400 focus:outline-none transition-all"
						/>
					</div>
				</div>

				{/* Restaurant Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
					{filteredRestaurants.map((restaurant) => (
						<div
							key={restaurant.id}
							className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer"
						>
							<div className="h-48 overflow-hidden">
								<img
									src={restaurant.image}
									alt={restaurant.name}
									className="w-full h-full object-cover"
								/>
							</div>
							<div className="p-6">
								<div className="flex justify-between items-start mb-2">
									<h3 className="text-xl font-bold text-gray-800">
										{restaurant.name}
									</h3>
									<div className="flex items-center gap-1">
										<span className="text-yellow-500">⭐</span>
										<span className="text-sm font-semibold text-gray-700">
											{restaurant.rating}
										</span>
									</div>
								</div>
								<p className="text-gray-600 mb-3">{restaurant.cuisine}</p>
								<div className="flex items-center justify-between">
									<span className="text-sm text-gray-500">
										🚚 {restaurant.deliveryTime}
									</span>
									<button className="bg-gradient-to-r from-green-300 to-emerald-400 text-white px-4 py-2 rounded-full text-sm font-semibold hover:from-green-400 hover:to-emerald-500 transition-all cursor-pointer">
										Order Now
									</button>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Empty State */}
				{filteredRestaurants.length === 0 && (
					<div className="text-center py-12">
						<p className="text-gray-600 text-lg">
							No restaurants found matching "{searchQuery}"
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

