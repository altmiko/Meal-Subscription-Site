import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Restaurants() {
	// const [restaurants, setRestaurants] = useState([]);
	// const [loading, setLoading] = useState(true);

	// useEffect(() => {
	// 	const fetchRestaurants = async () => {
	// 	  try {
	// 		const res = await axios.get("http://localhost:5000/api/restaurants");
	// 		setRestaurants(res.data);
	// 	  } catch (err) {
	// 		console.error("Error fetching restaurants:", err);
	// 	  } finally {
	// 		setLoading(false);
	// 	  }
	// 	};

	return (
		<div className="min-h-screen pt-32 px-4 pb-12">
			<div className="max-w-4xl mx-auto text-center">
				<h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
					Restaurants
				</h1>
				<p className="text-xl text-gray-600">
					This page is coming soon.
				</p>
			</div>
		</div>
	);
}
