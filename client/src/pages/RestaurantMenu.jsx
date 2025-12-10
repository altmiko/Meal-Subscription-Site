import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axios';

export default function RestaurantMenu() {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetch = async () => {
            try {
                const [rRes, mRes] = await Promise.all([
                    axiosInstance.get(`/api/restaurants/${id}`),
                    axiosInstance.get(`/api/restaurants/${id}/menu`),
                ]);
                if (!mounted) return;
                setRestaurant(rRes.data || rRes.data.data || rRes.data);
                setMenu(mRes.data?.data || []);
            } catch (err) {
                console.error('Failed to load restaurant/menu', err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetch();
        return () => (mounted = false);
    }, [id]);

    if (loading) return <div className="pt-24 text-center">Loading...</div>;

    return (
        <div className="min-h-screen pt-24 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <Link to="/" className="text-sm text-gray-500 mb-4 inline-block">← Back</Link>

                <header className="bg-white rounded-xl shadow p-6 mb-6 flex items-center gap-6">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{restaurant?.name || restaurant?.restaurantName}</h1>
                        <p className="text-gray-600">{(restaurant?.cuisineTypes || []).join(', ')}</p>
                        <p className="text-sm text-gray-500 mt-2">{restaurant?.location?.house ? `${restaurant.location.house}${restaurant.location.road ? ', ' + restaurant.location.road : ''}, ${restaurant.location.area}, ${restaurant.location.city}` : restaurant?.location?.city || 'Location not set'}</p>
                    </div>
                    <div>
                        {restaurant?.isOpen ? <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">Open</span> : <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full">Closed</span>}
                    </div>
                </header>

                <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {menu.length === 0 ? (
                        <div className="bg-white p-6 rounded-xl shadow text-gray-500">No menu items yet.</div>
                    ) : (
                        menu.map((item) => (
                            <article key={item._id} className="bg-white p-4 rounded-xl shadow flex items-start gap-4">
                                <img src={item.image || '/images/food-placeholder.jpg'} alt={item.name} className="w-20 h-20 rounded-md object-cover" />
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <h3 className="font-semibold">{item.name}</h3>
                                        <div className="text-gray-900 font-semibold">${item.price.toFixed(2)}</div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                    {!item.isAvailable && <div className="text-xs text-red-500 mt-2">Not available</div>}
                                </div>
                            </article>
                        ))
                    )}
                </section>

                {/* If current user owns this restaurant show manage link */}
                {(() => {
                    const rawUser = localStorage.getItem('user');
                    if (!rawUser) return null;
                    const user = JSON.parse(rawUser);
                    if (user?.role === 'restaurant' && (user.id === id || user.id === restaurant?._id?.toString())) {
                        return (
                            <div className="mt-6">
                                <Link to={`/restaurant/${id}/manage-menu`} className="px-4 py-2 bg-orange-500 text-white rounded-lg">Manage Menu</Link>
                            </div>
                        );
                    }
                    return null;
                })()}
            </div>
        </div>
    );
}