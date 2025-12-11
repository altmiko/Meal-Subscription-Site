import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';

export default function MenuOfTheDay() {
	const navigate = useNavigate();
	const [menuOfTheDay, setMenuOfTheDay] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchMenuOfTheDay();
	}, []);

	const fetchMenuOfTheDay = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await axiosInstance.get(
				'/api/menu/menu-of-the-day'
			);
			const items = response.data?.items || response.data?.data || [];
			const normalized = items.map((item) => ({
				id: item._id || item.id,
				name: item.name,
				description:
					item.description ||
					'A featured dish from one of our partner kitchens.',
				price:
					typeof item.price === 'number'
						? `${item.price.toFixed(0)} BDT`
						: item.price
						? `${item.price} BDT`
						: '-- BDT',
				image:
					item.image ||
					item.imageUrl ||
					'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
				cuisine: item.cuisine || 'Featured',
				restaurant:
					typeof item.restaurant === 'object'
						? item.restaurant?.name || 'Partner restaurant'
						: item.restaurant || 'Partner restaurant',
				badges:
					(item.badges && item.badges.length && item.badges) ||
					(item.ingredients && item.ingredients.slice(0, 3)) ||
					[],
			}));
			setMenuOfTheDay(normalized);
		} catch (err) {
			console.error('Failed to load menu of the day', err);
			setError("Unable to load today's menu. Please try again soon.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="min-h-screen bg-white text-gray-900">
			<section className="bg-gray-50">
				<div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
					<div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
						<div className="space-y-3">
							<p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
								Menu of the Day
							</p>
							<h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
								Today's featured dishes
							</h1>
							<p className="max-w-2xl text-gray-600">
								Five standout plates from different partner
								restaurants, refreshed daily. Order individually
								or add them to your upcoming delivery.
							</p>
							<p className="text-sm text-gray-500">
								Updated at 9:00 AM · Rotates every morning based
								on chef selections.
							</p>
						</div>
						<button
							onClick={() => navigate('/restaurants')}
							className="self-start rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:bg-emerald-700"
						>
							Browse all kitchens
						</button>
					</div>

					{loading && (
						<div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-600 shadow-sm">
							Loading today's picks...
						</div>
					)}

					{error && !loading && (
						<div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm font-semibold text-amber-800 shadow-sm">
							{error}
						</div>
					)}

					{!loading && !error && (
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{menuOfTheDay.map((item) => (
								<article
									key={item.id}
									className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
								>
									<div className="relative h-52 w-full overflow-hidden">
										<img
											src={item.image}
											alt={item.name}
											className="h-full w-full object-cover transition duration-500 ease-out hover:scale-105"
										/>
										<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
									</div>
									<div className="flex flex-1 flex-col gap-4 p-5">
										<div className="flex items-start justify-between gap-3">
											<div>
												<p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
													{item.cuisine}
												</p>
												<h3 className="mt-1 text-lg font-semibold text-gray-900">
													{item.name}
												</h3>
												<p className="text-sm text-gray-500">
													{item.restaurant}
												</p>
											</div>
											<div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-900 whitespace-nowrap">
												{item.price}
											</div>
										</div>
										<p className="text-sm leading-relaxed text-gray-700">
											{item.description}
										</p>
										<div className="flex flex-wrap gap-2">
											{item.badges?.map((badge) => (
												<span
													key={badge}
													className="rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700"
												>
													{badge}
												</span>
											))}
										</div>
										<div className="mt-auto flex items-center justify-between pt-2">
											<button
												onClick={() =>
													navigate('/restaurants')
												}
												className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
											>
												Add to delivery
											</button>
											<button
												onClick={() =>
													navigate('/restaurants')
												}
												className="text-sm font-semibold text-gray-600 hover:text-gray-900"
											>
												View restaurant
											</button>
										</div>
									</div>
								</article>
							))}
						</div>
					)}
				</div>
			</section>
		</main>
	);
}
