export default function About() {
	return (
		<div className="min-h-screen pt-24 px-4">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
						About NomNom
					</h1>
					<p className="text-xl text-gray-600">
						Your trusted food delivery partner
					</p>
				</div>

				{/* Content Sections */}
				<div className="space-y-8">
					<div className="bg-white rounded-xl p-8 shadow-md">
						<h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
						<p className="text-gray-600 leading-relaxed">
							At NomNom, we believe that great food should be accessible to everyone. 
							We connect you with the best local restaurants, bringing delicious meals 
							right to your doorstep. Our mission is to make food ordering simple, 
							fast, and enjoyable.
						</p>
					</div>

					<div className="bg-white rounded-xl p-8 shadow-md">
						<h2 className="text-2xl font-bold text-gray-800 mb-4">What We Do</h2>
						<p className="text-gray-600 leading-relaxed mb-4">
							We partner with top-rated restaurants in your area to offer a wide variety 
							of cuisines. Whether you're craving Italian, Asian, Mexican, or something 
							completely different, we've got you covered.
						</p>
						<ul className="list-disc list-inside text-gray-600 space-y-2">
							<li>Curated selection of quality restaurants</li>
							<li>Fast and reliable delivery service</li>
							<li>Easy-to-use ordering platform</li>
							<li>Customer support when you need it</li>
						</ul>
					</div>

					<div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8">
						<h2 className="text-2xl font-bold text-gray-800 mb-4">Why Choose NomNom?</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex items-start gap-3">
								<span className="text-green-500 text-xl">✓</span>
								<div>
									<h3 className="font-semibold text-gray-800">Fresh Ingredients</h3>
									<p className="text-sm text-gray-600">Only the freshest ingredients</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<span className="text-green-500 text-xl">✓</span>
								<div>
									<h3 className="font-semibold text-gray-800">Quick Delivery</h3>
									<p className="text-sm text-gray-600">Fast and efficient service</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<span className="text-green-500 text-xl">✓</span>
								<div>
									<h3 className="font-semibold text-gray-800">Great Prices</h3>
									<p className="text-sm text-gray-600">Affordable meal options</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<span className="text-green-500 text-xl">✓</span>
								<div>
									<h3 className="font-semibold text-gray-800">24/7 Support</h3>
									<p className="text-sm text-gray-600">We're here to help</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

