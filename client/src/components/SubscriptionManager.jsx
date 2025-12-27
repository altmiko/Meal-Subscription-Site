import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800';

export default function SubscriptionManager({ restaurantId: propRestaurantId }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const restaurantId = propRestaurantId || id;
  
  const [menuItems, setMenuItems] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMeals, setSelectedMeals] = useState({}); // { day_mealType: { menuItemId, quantity } }
  const [isRepeating, setIsRepeating] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
    if (restaurantId) {
      fetchMenuItems();
    }
  }, [restaurantId]);

  const fetchMenuItems = async () => {
    try {
      const { data } = await axiosInstance.get(`/api/menu/restaurant/${restaurantId}`);
      setMenuItems(data.data || []);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/api/subscriptions');
      // If restaurantId is provided, filter. Otherwise show all (backend already filters by user)
      const visibleSubs = restaurantId 
        ? (data.data || []).filter(sub => sub.restaurantId._id === restaurantId)
        : (data.data || []);
        
      setSubscriptions(visibleSubs);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePackageMeals = (mealType) => {
    const packageMeals = {};
    DAYS.forEach(day => {
      const key = `${day}_${mealType}`;
      const items = menuItems.filter(item => item.day === day && item.mealType === mealType);
      if (items.length > 0) {
        packageMeals[key] = {
          menuItemId: items[0]._id,
          quantity: 1,
        };
      }
    });
    setSelectedMeals(packageMeals);
    setShowCreateModal(true);
  };

  const handleMealSelect = (day, mealType, menuItemId, quantity = 1) => {
    const key = `${day}_${mealType}`;
    setSelectedMeals(prev => ({
      ...prev,
      [key]: { menuItemId, quantity },
    }));
  };

  const handleQuantityChange = (day, mealType, quantity) => {
    const key = `${day}_${mealType}`;
    if (quantity < 1) {
      const newSelected = { ...selectedMeals };
      delete newSelected[key];
      setSelectedMeals(newSelected);
    } else {
      setSelectedMeals(prev => ({
        ...prev,
        [key]: { ...prev[key], quantity },
      }));
    }
  };

  const handleCreateSubscription = async () => {
    const mealSelections = Object.entries(selectedMeals).map(([key, value]) => {
      const [day, mealType] = key.split('_');
      return {
        day,
        mealType,
        menuItemId: value.menuItemId,
        quantity: value.quantity || 1,
      };
    });

    if (mealSelections.length === 0) {
      alert('Please select at least one meal');
      return;
    }

    try {
      setCreating(true);
      await axiosInstance.post('/api/subscriptions', {
        restaurantId,
        mealSelections,
        planType: 'weekly',
        isRepeating,
      });
      
      alert('Subscription created successfully! Your upfront payment for this week has been processed.');
      setShowCreateModal(false);
      setSelectedMeals({});
      fetchSubscriptions();
    } catch (error) {
      console.error('Failed to create subscription:', error);
      alert(error.response?.data?.message || 'Failed to create subscription');
    } finally {
      setCreating(false);
    }
  };

  const handlePause = async (subscriptionId) => {
    try {
      await axiosInstance.patch(`/api/subscriptions/${subscriptionId}/pause`);
      fetchSubscriptions();
    } catch (error) {
      console.error('Failed to pause subscription:', error);
      alert('Failed to pause subscription');
    }
  };

  const handleResume = async (subscriptionId) => {
    try {
      await axiosInstance.patch(`/api/subscriptions/${subscriptionId}/resume`);
      fetchSubscriptions();
    } catch (error) {
      console.error('Failed to resume subscription:', error);
      alert('Failed to resume subscription');
    }
  };

  const handleCancel = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) return;
    
    try {
      await axiosInstance.delete(`/api/subscriptions/${subscriptionId}`);
      alert('Subscription cancelled successfully');
      fetchSubscriptions();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      alert('Failed to cancel subscription');
    }
  };

  const groupedMenuItems = DAYS.reduce((acc, day) => {
    acc[day] = {
      lunch: menuItems.filter(item => item.day === day && item.mealType === 'lunch'),
      dinner: menuItems.filter(item => item.day === day && item.mealType === 'dinner'),
    };
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {restaurantId ? 'Manage Subscriptions' : 'Your Subscriptions'}
        </h2>
        {restaurantId && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold"
          >
            + Create Subscription
          </button>
        )}
      </div>

      {/* Package Meals Quick Actions - Only show if in Restaurant context */}
      {restaurantId && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Quick Package Meals</h3>
          <div className="flex gap-3">
            <button
              onClick={() => handlePackageMeals('lunch')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold"
            >
              📦 Package All Lunches (1x each)
            </button>
            <button
              onClick={() => handlePackageMeals('dinner')}
              className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition font-semibold"
            >
              📦 Package All Dinners (1x each)
            </button>
          </div>
        </div>
      )}

      {/* Existing Subscriptions */}
      {subscriptions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {restaurantId ? (
            <p>No subscriptions yet. Create one to get started!</p>
          ) : (
            <div>
              <p className="mb-4">You don't have any active subscriptions.</p>
              <button 
                onClick={() => navigate('/restaurants')}
                className="text-emerald-600 font-semibold hover:underline"
              >
                Browse Restaurants to Subscribe
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map(sub => (
            <SubscriptionCard
              key={sub._id}
              subscription={sub}
              onPause={handlePause}
              onResume={handleResume}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}

      {/* Create Subscription Modal */}
      {showCreateModal && (
        <CreateSubscriptionModal
          groupedMenuItems={groupedMenuItems}
          selectedMeals={selectedMeals}
          isRepeating={isRepeating}
          onMealSelect={handleMealSelect}
          onQuantityChange={handleQuantityChange}
          onRepeatingChange={setIsRepeating}
          onCreate={handleCreateSubscription}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedMeals({});
          }}
          creating={creating}
        />
      )}
    </div>
  );
}

function SubscriptionCard({ subscription, onPause, onResume, onCancel }) {
  const isActive = subscription.status === 'active';
  const isPaused = subscription.status === 'paused';
  const isCancelled = subscription.status === 'cancelled';
  
  return (
    <div className={`border-2 rounded-lg p-4 ${isActive ? 'border-emerald-200 bg-emerald-50' : isPaused ? 'border-orange-200 bg-orange-50' : 'border-gray-200'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900">
            {subscription.restaurantId?.name || 'Restaurant'}
          </h3>
          <div className="text-sm text-gray-600 mt-1">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              isActive ? 'bg-emerald-200 text-emerald-800' :
              isPaused ? 'bg-orange-200 text-orange-800' :
              isCancelled ? 'bg-gray-200 text-gray-800' :
              'bg-gray-200 text-gray-800'
            }`}>
              {subscription.status.toUpperCase()}
            </span>
            {subscription.isRepeating && (
              <span className="ml-2 text-gray-500">🔄 Repeating Weekly</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {isActive && (
            <button
              onClick={() => onPause(subscription._id)}
              className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm font-semibold"
            >
              ⏸️ Pause
            </button>
          )}
          {isPaused && (
            <button
              onClick={() => onResume(subscription._id)}
              className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm font-semibold"
            >
              ▶️ Resume
            </button>
          )}
          {subscription.status === 'halted' && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-red-500 font-bold animate-pulse mb-1">Insufficient Funds!</span>
              <button
                onClick={() => navigate('/wallet')}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-semibold shadow-sm"
              >
                💰 Top Up Wallet
              </button>
            </div>
          )}
          {!isCancelled && (
            <button
              onClick={() => onCancel(subscription._id)}
              className="px-3 py-1 bg-stone-100 text-stone-500 rounded hover:bg-red-50 hover:text-red-600 text-sm font-semibold transition-colors"
            >
              ✕ Cancel
            </button>
          ) }
        </div>
      </div>

      <div className="bg-white/50 rounded-lg p-3 mb-4 border border-emerald-100">
        <div className="flex items-center gap-2 text-xs text-emerald-800 font-bold mb-1">
          <span className="text-sm">📅</span> Schedule Info
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-emerald-600 uppercase">Starts On</p>
            <p className="text-xs font-bold text-gray-800">{new Date(subscription.startDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div>
            <p className="text-[10px] text-emerald-600 uppercase">Daily Deduction</p>
            <p className="text-xs font-bold text-gray-800">Variable based on meals</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2 mt-4">
        {DAYS.map(day => {
          const lunchMeals = subscription.mealSelections?.filter(m => m.day === day && m.mealType === 'lunch') || [];
          const dinnerMeals = subscription.mealSelections?.filter(m => m.day === day && m.mealType === 'dinner') || [];
          
          return (
            <div key={day} className="text-center border rounded p-2 bg-white">
              <div className="text-xs font-semibold text-gray-700 mb-1">
                {DAY_NAMES[DAYS.indexOf(day)].substring(0, 3)}
              </div>
              {lunchMeals.length > 0 && (
                <div className="text-xs text-emerald-700 mb-1">
                  🍽️ {lunchMeals.map(m => `${m.quantity}x`).join(', ')}
                </div>
              )}
              {dinnerMeals.length > 0 && (
                <div className="text-xs text-emerald-700">
                  🌙 {dinnerMeals.map(m => `${m.quantity}x`).join(', ')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CreateSubscriptionModal({
  groupedMenuItems,
  selectedMeals,
  isRepeating,
  onMealSelect,
  onQuantityChange,
  onRepeatingChange,
  onCreate,
  onClose,
  creating,
}) {
  const totalPrice = Object.entries(selectedMeals).reduce((sum, [key, value]) => {
    const [day, mealType] = key.split('_');
    const items = groupedMenuItems[day]?.[mealType] || [];
    const item = items.find(i => i._id === value.menuItemId);
    return sum + (item?.price || 0) * (value.quantity || 1);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-900">Create Subscription</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isRepeating}
                onChange={e => onRepeatingChange(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="font-semibold text-gray-900">Repeat weekly</span>
            </label>
            <p className="text-sm text-gray-600 ml-6 mt-1">
              {isRepeating ? 'Subscription will automatically renew each week' : 'One-time subscription for this week only'}
            </p>
          </div>

          <div className="space-y-4">
            {DAYS.map(day => (
              <DayMealSelector
                key={day}
                day={day}
                dayName={DAY_NAMES[DAYS.indexOf(day)]}
                lunchItems={groupedMenuItems[day]?.lunch || []}
                dinnerItems={groupedMenuItems[day]?.dinner || []}
                selectedLunch={selectedMeals[`${day}_lunch`]}
                selectedDinner={selectedMeals[`${day}_dinner`]}
                onMealSelect={onMealSelect}
                onQuantityChange={onQuantityChange}
              />
            ))}
          </div>

          <div className="mt-6 p-4 bg-stone-50 rounded-xl border border-stone-100">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-stone-700">Estimated Weekly Total:</span>
              <span className="text-xl font-bold text-emerald-700">{totalPrice.toFixed(2)} BDT</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-[11px] text-stone-500 leading-tight">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Subscriptions start <strong>immediately</strong> from today.</span>
              </div>
              <div className="flex items-start gap-2 text-[11px] text-stone-500 leading-tight">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Payment for the first week is <strong>charged upfront</strong> from your wallet.</span>
              </div>
              <div className="flex items-start gap-2 text-[11px] text-stone-500 leading-tight">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>If your wallet balance is low, your subscription will be <strong>halted</strong> until you top up.</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-stone-200 rounded-xl hover:bg-stone-50 font-semibold text-stone-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onCreate}
              disabled={creating || Object.keys(selectedMeals).length === 0}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-100 transition-all hover:shadow-emerald-200 active:scale-95"
            >
              {creating ? 'Setting up...' : 'Start Subscription'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DayMealSelector({
  day,
  dayName,
  lunchItems,
  dinnerItems,
  selectedLunch,
  selectedDinner,
  onMealSelect,
  onQuantityChange,
}) {
  return (
    <div className="border rounded-lg p-4">
      <h4 className="font-semibold text-gray-900 mb-3">{dayName}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lunch */}
        <div>
          <div className="text-sm font-semibold text-emerald-700 mb-2">🍽️ Lunch</div>
          {lunchItems.length === 0 ? (
            <p className="text-sm text-gray-400">No lunch items available</p>
          ) : (
            <select
              value={selectedLunch?.menuItemId || ''}
              onChange={e => {
                if (e.target.value) {
                  onMealSelect(day, 'lunch', e.target.value, selectedLunch?.quantity || 1);
                } else {
                  onQuantityChange(day, 'lunch', 0);
                }
              }}
              className="w-full border rounded p-2 mb-2"
            >
              <option value="">Select lunch...</option>
              {lunchItems.map(item => (
                <option key={item._id} value={item._id}>
                  {item.name} - {item.price} BDT
                </option>
              ))}
            </select>
          )}
          {selectedLunch && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onQuantityChange(day, 'lunch', (selectedLunch.quantity || 1) - 1)}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                -
              </button>
              <span className="text-sm font-semibold">{selectedLunch.quantity || 1}</span>
              <button
                onClick={() => onQuantityChange(day, 'lunch', (selectedLunch.quantity || 1) + 1)}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                +
              </button>
            </div>
          )}
        </div>

        {/* Dinner */}
        <div>
          <div className="text-sm font-semibold text-emerald-700 mb-2">🌙 Dinner</div>
          {dinnerItems.length === 0 ? (
            <p className="text-sm text-gray-400">No dinner items available</p>
          ) : (
            <select
              value={selectedDinner?.menuItemId || ''}
              onChange={e => {
                if (e.target.value) {
                  onMealSelect(day, 'dinner', e.target.value, selectedDinner?.quantity || 1);
                } else {
                  onQuantityChange(day, 'dinner', 0);
                }
              }}
              className="w-full border rounded p-2 mb-2"
            >
              <option value="">Select dinner...</option>
              {dinnerItems.map(item => (
                <option key={item._id} value={item._id}>
                  {item.name} - {item.price} BDT
                </option>
              ))}
            </select>
          )}
          {selectedDinner && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onQuantityChange(day, 'dinner', (selectedDinner.quantity || 1) - 1)}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                -
              </button>
              <span className="text-sm font-semibold">{selectedDinner.quantity || 1}</span>
              <button
                onClick={() => onQuantityChange(day, 'dinner', (selectedDinner.quantity || 1) + 1)}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

