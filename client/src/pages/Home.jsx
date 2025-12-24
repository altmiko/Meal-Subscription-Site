import { useNavigate } from 'react-router-dom';

export default function Home() {
	const navigate = useNavigate();

	return (
		<main className="min-h-screen bg-white text-gray-900">
			{/* Hero */}
			<section className="relative overflow-hidden bg-gray-50">
				<div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 pb-24 pt-28 md:grid-cols-2 md:items-center lg:px-8">
					<div className="space-y-8">
						<div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
							Fresh meals, on repeat
						</div>
						<h1 className="text-4xl leading-tight md:text-6xl font-semibold tracking-tight">
							Chef-crafted meals delivered on your schedule.
						</h1>
						<p className="max-w-2xl text-lg text-gray-600">
							NomNom is the modern food subscription that pairs
							seasonal menus with flexible deliveries. Skip the
							decision fatigue—just great food, fast.
						</p>
						<div className="flex flex-wrap gap-4">
							<button
								onClick={() => navigate('/restaurants')}
								className="rounded-lg bg-emerald-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:bg-emerald-700"
							>
								Order now
							</button>
							<button
								onClick={() => navigate('/about')}
								className="rounded-lg border border-gray-200 px-8 py-3 text-sm font-semibold text-gray-900 transition hover:border-emerald-200 hover:bg-emerald-50"
							>
								View plans
							</button>
						</div>
						<div className="flex flex-wrap gap-6 text-sm text-gray-600">
							<div className="flex items-center gap-2">
								<span className="h-2 w-2 rounded-full bg-emerald-600" />
								No delivery fees on subscriptions
							</div>
							<div className="flex items-center gap-2">
								<span className="h-2 w-2 rounded-full bg-emerald-600" />
								Farm-fresh ingredients
							</div>
						</div>
					</div>

					<div className="relative overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
						<img
							src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1600"
							alt="Plated meal"
							className="h-full w-full object-cover"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent" />
					</div>
				</div>
			</section>

			{/* Value props */}
			<section className="bg-white">
				<div className="mx-auto max-w-7xl px-4 py-24 lg:px-8">
					<div className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
						<h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
							Designed for busy food lovers
						</h2>
						<p className="max-w-xl text-gray-600">
							Three pillars keep every delivery sharp: freshness,
							precision, and speed. All in a minimalist, reliable
							experience.
						</p>
					</div>
					<div className="grid gap-6 md:grid-cols-3">
						{[
							{
								title: 'Seasonal menus',
								copy: 'Rotating dishes that highlight peak ingredients and balanced nutrition.',
							},
							{
								title: 'Scheduled drops',
								copy: 'Pick windows that work for you. Reschedule or pause anytime.',
							},
							{
								title: 'Surgical delivery',
								copy: 'Insulated, tamper-proof packaging keeps every plate pristine.',
							},
						].map((item) => (
							<div
								key={item.title}
								className="rounded-2xl border border-gray-100 bg-gray-50/60 p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
							>
								<div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-semibold">
									•
								</div>
								<h3 className="mb-3 text-xl font-semibold">
									{item.title}
								</h3>
								<p className="text-sm leading-relaxed text-gray-600">
									{item.copy}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* How it works */}
			<section className="bg-white">
				<div className="mx-auto max-w-7xl px-4 py-24 lg:px-8">
					<div className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
						<h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
							How it works
						</h2>
						<p className="max-w-xl text-gray-600">
							A four-step flow that stays out of your way. Set it
							once, and your weekly table is handled.
						</p>
					</div>
					<div className="grid gap-6 md:grid-cols-4">
						{[
							{
								step: '01',
								title: 'Choose',
								copy: 'Pick lunch and dinner meals from our wide selection of curated meals from different restaurants.',
							},
							{
								step: '02',
								title: 'Plan',
								copy: 'Buy individual meals or set up weekly meal plans',
							},
							{
								step: '03',
								title: 'Deliver',
								copy: 'Fast delivery drops to your doorstep.',
							},
							{
								step: '04',
								title: 'Enjoy',
								copy: 'Heat, plate, and savor within minutes.',
							},
						].map((item) => (
							<div
								key={item.step}
								className="rounded-2xl border border-gray-100 bg-gray-50/60 p-6 shadow-sm"
							>
								<div className="text-xs font-semibold text-emerald-600">
									{item.step}
								</div>
								<h3 className="mt-3 text-lg font-semibold">
									{item.title}
								</h3>
								<p className="mt-3 text-sm text-gray-600">
									{item.copy}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Testimonials */}
			<section className="bg-gray-50">
				<div className="mx-auto max-w-7xl px-4 py-24 lg:px-8">
					<div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
						<h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
							Loved by subscribers
						</h2>
						<p className="max-w-xl text-gray-600">
							Consistently high satisfaction scores from members
							who value speed, flavor, and reliability.
						</p>
					</div>
					<div className="grid gap-6 md:grid-cols-3">
						{[
							{
								name: 'Priya K.',
								role: 'Subscriber · 8 months',
								quote: 'The only service that keeps meals interesting without any of the usual delivery chaos.',
							},
							{
								name: 'Adam L.',
								role: 'Founder & dad of two',
								quote: 'Setup took five minutes. We now get balanced dinners that fit into a packed schedule.',
							},
							{
								name: 'Maria S.',
								role: 'Product designer',
								quote: 'Packaging is immaculate, portions are perfect, and the menu rotates before we ever get bored.',
							},
						].map((item) => (
							<div
								key={item.name}
								className="flex flex-col rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
							>
								<p className="mb-6 text-sm leading-relaxed text-gray-700">
									“{item.quote}”
								</p>
								<div className="mt-auto">
									<div className="text-sm font-semibold text-gray-900">
										{item.name}
									</div>
									<div className="text-xs text-gray-600">
										{item.role}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-gray-100 bg-white">
				<div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
					<div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
						<div className="flex flex-col gap-3">
							<div className="flex items-center gap-2">
								<h3 className="text-2xl font-bold text-emerald-600">
									NomNom
								</h3>
							</div>
							<p className="text-sm text-gray-600 max-w-md">
								Chef-crafted meals delivered on your schedule.
								Fresh, fast, and convenient.
							</p>
						</div>
						<div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
							<div>
								<h4 className="font-semibold text-gray-900 mb-3">
									Company
								</h4>
								<ul className="space-y-2 text-sm text-gray-600">
									<li>
										<button
											onClick={() => navigate('/about')}
											className="hover:text-emerald-600 transition-colors"
										>
											About Us
										</button>
									</li>
									<li>
										<button
											onClick={() =>
												navigate('/restaurants')
											}
											className="hover:text-emerald-600 transition-colors"
										>
											Restaurants
										</button>
									</li>
									<li>
										<button className="hover:text-emerald-600 transition-colors">
											Careers
										</button>
									</li>
									<li>
										<button className="hover:text-emerald-600 transition-colors">
											Press
										</button>
									</li>
								</ul>
							</div>
							<div>
								<h4 className="font-semibold text-gray-900 mb-3">
									Support
								</h4>
								<ul className="space-y-2 text-sm text-gray-600">
									<li>
										<button className="hover:text-emerald-600 transition-colors">
											FAQ
										</button>
									</li>
									<li>
										<button className="hover:text-emerald-600 transition-colors">
											Contact Us
										</button>
									</li>
									<li>
										<button className="hover:text-emerald-600 transition-colors">
											Help Center
										</button>
									</li>
									<li>
										<button className="hover:text-emerald-600 transition-colors">
											Track Order
										</button>
									</li>
								</ul>
							</div>
							<div>
								<h4 className="font-semibold text-gray-900 mb-3">
									Legal
								</h4>
								<ul className="space-y-2 text-sm text-gray-600">
									<li>
										<button className="hover:text-emerald-600 transition-colors">
											Terms of Service
										</button>
									</li>
									<li>
										<button className="hover:text-emerald-600 transition-colors">
											Privacy Policy
										</button>
									</li>
									<li>
										<button className="hover:text-emerald-600 transition-colors">
											Cookie Policy
										</button>
									</li>
									<li>
										<button className="hover:text-emerald-600 transition-colors">
											Refund Policy
										</button>
									</li>
								</ul>
							</div>
						</div>
					</div>
					<div className="mt-12 pt-8 border-t border-gray-100">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<p className="text-sm text-gray-600">
								© 2025 NomNom. All rights reserved.
							</p>
						</div>
					</div>
				</div>
			</footer>
		</main>
	);
}
