import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  // ------------------ Load user ------------------
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'customer') {
        navigate('/');
        return;
      }
      setUser(parsedUser);
    } catch (err) {
      console.error('Error parsing user data:', err);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // ------------------ Logout ------------------
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('userLogout'));
    navigate('/');
  };

  // ------------------ Fetch Favorites ------------------
  const fetchFavorites = async () => {
    try {
      const res = await axiosInstance.get('/api/auth/favorites');
      const favoriteIds = res.data.favorites || [];

      const favoriteRestaurants = await Promise.all(
        favoriteIds.map(id =>
          axiosInstance.get(`/api/restaurants/${id}`).then(res => res.data)
        )
      );

      setFavorites(favoriteRestaurants);
    } catch (err) {
      console.error('Failed to fetch favorites', err);
    }
  };

  useEffect(() => {
    if (user && showFavorites) fetchFavorites();
  }, [user, showFavorites]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <Header user={user} onLogout={handleLogout} />

        {/* Quick Actions */}
        <QuickActions
          navigate={navigate}
          showFavorites={showFavorites}
          setShowFavorites={setShowFavorites}
        />

        {/* Favorites List */}
        {showFavorites && <FavoritesList favorites={favorites} navigate={navigate} />}

        {/* Account Info */}
        <AccountInfo user={user} />
      </div>
    </div>
  );
}

// ------------------ Components ------------------
const Header = ({ user, onLogout }) => (
  <div className="bg-gray-50 rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Welcome, {user?.name}!</h1>
        <p className="text-gray-600">Customer Dashboard</p>
      </div>
      <button
        onClick={onLogout}
        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:border-emerald-200 hover:bg-emerald-50"
      >
        Logout
      </button>
    </div>
  </div>
);

const QuickActions = ({ navigate, showFavorites, setShowFavorites }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
    <ActionCard
      icon="🍽️"
      title="Browse Restaurants"
      desc="Discover delicious meals from restaurants"
      onClick={() => navigate('/restaurants')}
    />
    <ActionCard
      icon="📦"
      title="My Orders"
      desc="View your order history"
      onClick={() => navigate('/my-orders')}
    />
    <ActionCard
      icon="❤️"
      title="Favorites"
      desc="Your favorite restaurants"
      onClick={() => setShowFavorites(!showFavorites)}
    />
  </div>
);

const ActionCard = ({ icon, title, desc, onClick }) => (
  <button
    onClick={onClick}
    className="rounded-xl border border-gray-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
  >
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{desc}</p>
  </button>
);

const FavoritesList = ({ favorites, navigate }) => (
  <div className="mt-8">
    <h2 className="text-2xl font-semibold mb-4">Your Favorite Restaurants</h2>
    {favorites.length === 0 ? (
      <p className="text-gray-500">You have no favorite restaurants yet.</p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map(r => (
          <div
            key={r._id}
            onClick={() => navigate(`/restaurants/${r._id}`)}
            className="bg-white rounded-2xl border shadow-sm hover:shadow-lg cursor-pointer transition"
          >
            <div className="h-48 bg-emerald-100 rounded-t-2xl border border-black flex items-center justify-center text-6xl">
              🍽️
            </div>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">{r.name}</h2>
              {r.location && (
                <p className="text-sm text-gray-600 mb-4">
                  📍 {r.location.city}, {r.location.area}
                </p>
              )}
              <button
                onClick={e => {
                  e.stopPropagation();
                  navigate(`/restaurants/${r._id}`);
                }}
                className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold"
              >
                View Menu
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const AccountInfo = ({ user }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mt-8">
    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Account Information</h2>
    <div className="space-y-3">
      <InfoItem label="Name" value={user?.name} />
      <InfoItem label="Email" value={user?.email} />
      <InfoItem label="Phone" value={user?.phone} />
      <InfoItem label="Role" value={user?.role} />
    </div>
  </div>
);

const InfoItem = ({ label, value }) => (
  <div>
    <span className="text-gray-600">{label}:</span>
    <span className="ml-2 font-semibold capitalize">{value || 'Not set'}</span>
  </div>
);
