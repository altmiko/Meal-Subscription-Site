import { useNavigate } from 'react-router-dom';

export default function Home() {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen pt-24 px-4 bg-gray-50">
			<div className="max-w-7xl mx-auto">
				{/* Hero Section */}
				<div className="grid md:grid-cols-2 gap-8 items-center py-16">
					<div className="text-center md:text-left">
						<h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 tracking-tighter">
							Your Favorite Food, Delivered Fast
						</h1>
						<p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto md:mx-0">
							NomNom is a food delivery service that connects you with the best local restaurants.
						</p>
						<div className="flex gap-4 justify-center md:justify-start">
							<button
								onClick={() => navigate('/restaurants')}
								className="bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition-all shadow-md hover:shadow-lg cursor-pointer"
							>
								Order Now
							</button>
							<button
								onClick={() => navigate('/about')}
								className="border-2 border-orange-500 text-orange-500 px-8 py-3 rounded-full font-semibold hover:bg-orange-50 transition-all cursor-pointer"
							>
								Learn More
							</button>
						</div>
					</div>
					<div className="hidden md:block">
						<img src="https://img.freepik.com/free-vector/food-delivery-service-concept_23-2148505517.jpg?t=st=1710433200~exp=1710436800~hmac=bf2a8e48545888288a7c29e342a1727715d5c56f8f53c8f8b7c7e6e5b5e7e1e6&w=740" alt="Food delivery" className="rounded-lg shadow-lg" />
					</div>
				</div>

				{/* Features Section */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16">
					<div className="text-center p-6 rounded-xl bg-white shadow-md">
						<div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<span className="text-3xl text-orange-500">🍽️</span>
						</div>
						<h3 className="text-xl font-bold text-gray-800 mb-2">
							Fresh Meals
						</h3>
						<p className="text-gray-600">
							Hand-picked ingredients from local restaurants
						</p>
					</div>
					<div className="text-center p-6 rounded-xl bg-white shadow-md">
						<div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<span className="text-3xl text-orange-500">🚚</span>
						</div>
						<h3 className="text-xl font-bold text-gray-800 mb-2">
							Fast Delivery
						</h3>
						<p className="text-gray-600">
							Get your meals delivered quickly and safely
						</p>
					</div>
					<div className="text-center p-6 rounded-xl bg-white shadow-md">
						<div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<span className="text-3xl text-orange-500">⭐</span>
						</div>
						<h3 className="text-xl font-bold text-gray-800 mb-2">
							Top Rated
						</h3>
						<p className="text-gray-600">
							Only the best restaurants in your area
						</p>
					</div>
				</div>

				{/* Popular Restaurants Section */}
				<div className="py-16">
					<h2 className="text-3xl font-bold text-gray-800 mb-6 tracking-tighter text-center">
						Popular Restaurants
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{/* Restaurant Card 1 */}
						<div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
							<div className="h-48 bg-gray-200 flex items-center justify-center">
								<span className="text-4xl text-gray-400">🍔</span>
							</div>
							<div className="p-6">
								<h3 className="text-xl font-bold text-gray-900 mb-2">
									The Burger Joint
								</h3>
								<p className="text-gray-600 mb-4">
									The best burgers in town.
								</p>
								<button
									onClick={() => navigate('/restaurants/1')}
									className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-semibold"
								>
									View Menu
								</button>
							</div>
						</div>
						{/* Restaurant Card 2 */}
						<div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
							<div className="h-48 bg-gray-200 flex items-center justify-center">
								<span className="text-4xl text-gray-400">🍕</span>
							</div>
							<div className="p-6">
								<h3 className="text-xl font-bold text-gray-900 mb-2">
									Pizza Palace
								</h3>
								<p className="text-gray-600 mb-4">
									Authentic Italian pizza.
								</p>
								<button
									onClick={() => navigate('/restaurants/2')}
									className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-semibold"
								>
									View Menu
								</button>
							</div>
						</div>
						{/* Restaurant Card 3 */}
						<div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
							<div className="h-48 bg-gray-200 flex items-center justify-center">
								<span className="text-4xl text-gray-400">🍣</span>
							</div>
							<div className="p-6">
								<h3 className="text-xl font-bold text-gray-900 mb-2">
									Sushi Spot
								</h3>
								<p className="text-gray-600 mb-4">
									Fresh and delicious sushi.
								</p>
								<button
									onClick={() => navigate('/restaurants/3')}
									className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-semibold"
								>
									View Menu
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
