import { useNavigate } from 'react-router-dom';

export default function Home() {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen pt-24 px-4">
			<div className="max-w-7xl mx-auto">
				{/* Hero Section */}
				<div className="text-center py-16">
					<h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
						Welcome to NomNom
					</h1>
					<p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
						Discover delicious meals from your favorite restaurants,
						delivered fresh to your door.
					</p>
					<div className="flex gap-4 justify-center">
						<button
							onClick={() => navigate('/restaurants')}
							className="bg-gradient-to-r from-green-300 to-emerald-400 text-white px-8 py-3 rounded-full font-semibold hover:from-green-400 hover:to-emerald-500 transition-all shadow-md hover:shadow-lg cursor-pointer"
						>
							Browse Restaurants
						</button>
						<button
							onClick={() => navigate('/about')}
							className="border-2 border-green-400 text-green-500 px-8 py-3 rounded-full font-semibold hover:bg-green-50 transition-all cursor-pointer"
						>
							Learn More
						</button>
					</div>
				</div>

				{/* Features Section */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16">
					<div className="text-center p-6 rounded-xl bg-green-50">
						<div className="w-16 h-16 bg-gradient-to-br from-green-300 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
							<span className="text-3xl">🍽️</span>
						</div>
						<h3 className="text-xl font-bold text-gray-800 mb-2">
							Fresh Meals
						</h3>
						<p className="text-gray-600">
							Hand-picked ingredients from local restaurants
						</p>
					</div>
					<div className="text-center p-6 rounded-xl bg-green-50">
						<div className="w-16 h-16 bg-gradient-to-br from-green-300 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
							<span className="text-3xl">🚚</span>
						</div>
						<h3 className="text-xl font-bold text-gray-800 mb-2">
							Fast Delivery
						</h3>
						<p className="text-gray-600">
							Get your meals delivered quickly and safely
						</p>
					</div>
					<div className="text-center p-6 rounded-xl bg-green-50">
						<div className="w-16 h-16 bg-gradient-to-br from-green-300 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
							<span className="text-3xl">⭐</span>
						</div>
						<h3 className="text-xl font-bold text-gray-800 mb-2">
							Top Rated
						</h3>
						<p className="text-gray-600">
							Only the best restaurants in your area
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
