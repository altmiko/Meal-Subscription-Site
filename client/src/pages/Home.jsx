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
							NomNom is the modern food subscription that pairs seasonal menus
							with flexible deliveries. Skip the decision fatigue—just great food,
							fast.
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
							Three pillars keep every delivery sharp: freshness, precision, and
							speed. All in a minimalist, reliable experience.
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
								<h3 className="mb-3 text-xl font-semibold">{item.title}</h3>
								<p className="text-sm leading-relaxed text-gray-600">
									{item.copy}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Plans */}
			<section className="bg-gray-50">
				<div className="mx-auto max-w-7xl px-4 py-24 lg:px-8">
					<div className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
						<h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
							Pick a plan that sticks
						</h2>
						<p className="max-w-xl text-gray-600">
							Transparent pricing, zero surprises. Switch plans or cancel anytime
							before your weekly cut-off.
						</p>
					</div>
					<div className="grid gap-6 lg:grid-cols-3">
						{[
							{
								name: 'Lite',
								price: '$59/week',
								desc: '4 meals · best for individuals',
								features: ['2 deliveries per week', 'Chef-curated menu', 'Swap any meal'],
							},
							{
								name: 'Classic',
								price: '$89/week',
								desc: '6 meals · perfect for two',
								features: [
									'3 deliveries per week',
									'Priority kitchen slot',
									'Allergen-friendly options',
								],
								featured: true,
							},
							{
								name: 'Family',
								price: '$139/week',
								desc: '10 meals · best for families',
								features: ['5 deliveries per week', 'Kids & family picks', 'Flexible skips'],
							},
						].map((plan) => (
							<div
								key={plan.name}
								className={`flex flex-col rounded-2xl border p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
									plan.featured
										? 'border-emerald-200 bg-white'
										: 'border-gray-100 bg-white'
								}`}
							>
								<div className="mb-6 flex items-center justify-between">
									<h3 className="text-xl font-semibold">{plan.name}</h3>
									{plan.featured && (
										<span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
											Most popular
										</span>
									)}
								</div>
								<div className="mb-2 text-3xl font-semibold">{plan.price}</div>
								<p className="mb-6 text-sm text-gray-600">{plan.desc}</p>
								<ul className="mb-8 space-y-3 text-sm text-gray-700">
									{plan.features.map((f) => (
										<li key={f} className="flex items-start gap-2">
											<span className="mt-1 h-2 w-2 rounded-full bg-emerald-600" />
											<span>{f}</span>
										</li>
									))}
								</ul>
								<button
									onClick={() => navigate('/register')}
									className={`mt-auto rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${
										plan.featured
											? 'bg-emerald-600 hover:bg-emerald-700'
											: 'bg-emerald-600 hover:bg-emerald-700'
									}`}
								>
									Start plan
								</button>
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
							A four-step flow that stays out of your way. Set it once, and your
							weekly table is handled.
						</p>
					</div>
					<div className="grid gap-6 md:grid-cols-4">
						{[
							{ step: '01', title: 'Choose', copy: 'Pick a plan and dietary profile.' },
							{ step: '02', title: 'Curate', copy: 'We assemble seasonal menus weekly.' },
							{ step: '03', title: 'Deliver', copy: 'Precision drops to your doorstep.' },
							{ step: '04', title: 'Enjoy', copy: 'Heat, plate, and savor within minutes.' },
						].map((item) => (
							<div
								key={item.step}
								className="rounded-2xl border border-gray-100 bg-gray-50/60 p-6 shadow-sm"
							>
								<div className="text-xs font-semibold text-emerald-600">
									{item.step}
								</div>
								<h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
								<p className="mt-3 text-sm text-gray-600">{item.copy}</p>
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
							Consistently high satisfaction scores from members who value speed,
							flavor, and reliability.
						</p>
					</div>
					<div className="grid gap-6 md:grid-cols-3">
						{[
							{
								name: 'Priya K.',
								role: 'Subscriber · 8 months',
								quote:
									'The only service that keeps meals interesting without any of the usual delivery chaos.',
							},
							{
								name: 'Adam L.',
								role: 'Founder & dad of two',
								quote:
									'Setup took five minutes. We now get balanced dinners that fit into a packed schedule.',
							},
							{
								name: 'Maria S.',
								role: 'Product designer',
								quote:
									'Packaging is immaculate, portions are perfect, and the menu rotates before we ever get bored.',
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
									<div className="text-xs text-gray-600">{item.role}</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-gray-100 bg-white">
				<div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 lg:flex-row lg:items-center lg:justify-between lg:px-8">
					<div>
						<h3 className="text-xl font-semibold">Ready for dinner to just arrive?</h3>
						<p className="mt-2 text-sm text-gray-600">
							Start your subscription and get your first delivery this week.
						</p>
					</div>
					<div className="flex flex-wrap gap-3">
						<button
							onClick={() => navigate('/register')}
							className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:bg-emerald-700"
						>
							Start subscription
						</button>
						<button
							onClick={() => navigate('/restaurants')}
							className="rounded-lg border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-900 transition hover:border-emerald-200 hover:bg-emerald-50"
						>
							Browse kitchens
						</button>
					</div>
				</div>
			</footer>
		</main>
	);
}
