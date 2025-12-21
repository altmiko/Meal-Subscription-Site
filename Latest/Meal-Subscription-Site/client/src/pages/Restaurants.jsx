import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';

/* ---------- Rating Stars Component ---------- */
const RatingStars = ({ rating = 0 }) => {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={star <= rounded ? 'text-yellow-400 text-sm' : 'text-gray-300 text-sm'}
        >
          ★
        </span>
      ))}
    </div>
  );
};

/* ---------- Main Restaurants Component ---------- */
export default function Restaurants() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchRestaurants();
    fetchFavorites();
  }, []);

  /* ---------- Fetch Restaurants ---------- */
  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/api/restaurants');
      const restaurantsData = res.data;

      const reviewsResponses = await Promise.all(
        restaurantsData.map(r => axiosInstance.get(`/api/reviews/${r._id}`).then(res => res.data))
      );

      const restaurantsWithRatings = restaurantsData.map((r, i) => {
        const reviews = reviewsResponses[i];
        const totalRatings = reviews.length;
        const avgRating = totalRatings
          ? reviews.reduce((sum, rev) => sum + rev.rating, 0) / totalRatings
          : 0;
        return { ...r, totalRatings, rating: avgRating };
      });

      setRestaurants(restaurantsWithRatings);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Fetch Favorites ---------- */
  const fetchFavorites = async () => {
    try {
      const res = await axiosInstance.get('/api/auth/favorites');
      // Handle both array of IDs and array of populated objects
      const favData = res.data.favorites || [];
      const favIds = favData.map(f => typeof f === 'string' ? f : f._id?.toString() || f.toString());
      setFavorites(favIds);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setFavorites([]); // Set empty array on error
    }
  };

  /* ---------- Toggle Favorite ---------- */
  const toggleFavorite = async (restaurantId) => {
    try {
      const isFavorite = favorites.includes(restaurantId);
      
      if (isFavorite) {
        const res = await axiosInstance.delete(`/api/auth/favorites/${restaurantId}`);
        const updatedFavs = res.data.favorites.map(f => typeof f === 'string' ? f : f._id?.toString() || f.toString());
        setFavorites(updatedFavs);
      } else {
        const res = await axiosInstance.post(`/api/auth/favorites/${restaurantId}`);
        const updatedFavs = res.data.favorites.map(f => typeof f === 'string' ? f : f._id?.toString() || f.toString());
        setFavorites(updatedFavs);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('Failed to update favorites. Please try again.');
    }
  };

  /* ---------- Filters ---------- */
  const allCuisines = [...new Set(restaurants.flatMap(r => r.cuisineTypes || []))].sort();

  const filteredRestaurants = restaurants
    .filter(r => {
      const matchesSearch =
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.location?.area?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCuisine = !selectedCuisine || r.cuisineTypes?.includes(selectedCuisine);
      return matchesSearch && matchesCuisine;
    })
    .sort((a, b) => {
      if (a.totalRatings === 0 && b.totalRatings === 0) return 0;
      if (a.totalRatings === 0) return 1;
      if (b.totalRatings === 0) return -1;
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.totalRatings - a.totalRatings;
    });

  const formatAddress = location => {
    if (!location) return 'Address not available';
    return [location.house, location.road, location.area, location.city].filter(Boolean).join(', ');
  };

  /* ---------- Loading / Error ---------- */
  if (loading) return <div className="min-h-screen flex items-center justify-center pt-24">
    <div className="animate-spin h-16 w-16 border-b-4 border-emerald-600 rounded-full" />
  </div>;

  if (error) return <div className="min-h-screen flex items-center justify-center pt-24">
    <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
      <h2 className="text-red-800 font-bold text-xl mb-2">Error Loading Restaurants</h2>
      <p className="text-red-600 mb-6">{error}</p>
      <button onClick={fetchRestaurants} className="bg-emerald-600 text-white px-6 py-3 rounded-lg">Try Again</button>
    </div>
  </div>;

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-semibold mb-3">Restaurants</h1>

          {/* Search & Filter */}
          <div className="max-w-2xl mx-auto flex flex-col md:flex-row gap-4 mt-6">
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 border rounded-lg"
            />
            {allCuisines.length > 0 && (
              <select
                value={selectedCuisine}
                onChange={e => setSelectedCuisine(e.target.value)}
                className="px-4 py-3 border rounded-lg bg-white"
              >
                <option value="">All Cuisines</option>
                {allCuisines.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>
        </div>

        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map(r => (
            <div key={r._id} onClick={() => navigate(`/restaurants/${r._id}`)} className="bg-white rounded-2xl border shadow-sm hover:shadow-lg cursor-pointer transition">
              <div className="h-48 bg-emerald-100 rounded-t-2xl border border-black flex items-center justify-center text-6xl">
                🍽️
              </div>

              <div className="p-6">
                {/* Name + Favorite */}
                <div className="flex justify-between items-start mb-1">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    {r.name}
                    <button
                      onClick={e => { 
                        e.stopPropagation(); 
                        toggleFavorite(r._id); 
                      }}
                      className="text-2xl transition-colors duration-300"
                      style={{ 
                        background: 'transparent', 
                        border: 'none',
                        filter: favorites.includes(r._id) ? 'none' : 'grayscale(100%) opacity(0.3)'
                      }}
                    >
                      ❤️
                    </button>
                  </h2>

                  {r.totalRatings > 0 ? (
                    <div className="text-right">
                      <RatingStars rating={r.rating} />
                      <p className="text-xs text-gray-600">{r.rating.toFixed(1)} ({r.totalRatings})</p>
                    </div>
                  ) : <p className="text-xs text-gray-400 mb-2">No ratings yet</p>}
                </div>

                {r.location && <p className="text-sm text-gray-600 mb-4">📍 {formatAddress(r.location)}</p>}

                <button
                  onClick={e => { e.stopPropagation(); navigate(`/restaurants/${r._id}`); }}
                  className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold"
                >View Menu</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}