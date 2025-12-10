import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { FaStar, FaUtensils, FaMapMarkerAlt, FaPhone, FaClock } from 'react-icons/fa';

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800';

export default function KitchenProfile() {
    const { id } = useParams();
    const [kitchen, setKitchen] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // NEW: modal state for selected menu item
    const [selectedItem, setSelectedItem] = useState(null);
    const [showItemModal, setShowItemModal] = useState(false);

    useEffect(() => {
        const fetchKitchen = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get(
                    `/api/restaurants/${id}`
                );
                setKitchen(response.data);
            } catch (err) {
                setError(err.message || 'Failed to fetch kitchen data');
            } finally {
                setLoading(false);
            }
        };

        fetchKitchen();
    }, [id]);

    useEffect(() => {
        const fetchMenuItems = async () => {
            if (!kitchen) return;
            try {
                const response = await axiosInstance.get(
                    `/api/menu/restaurant/${id}`
                );
                setMenuItems(response.data.data || []);
            } catch (err) {
                console.error('Failed to fetch menu items:', err);
                setMenuItems([]);
            }
        };

        fetchMenuItems();
    }, [kitchen, id]);

    // NEW: close modal on Escape
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') closeItemModal();
        };
        if (showItemModal) window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [showItemModal]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24 bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">
                        Loading kitchen details...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24 p-4 bg-gray-50">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                    <div className="text-5xl mb-4 text-red-500">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        Error Loading Kitchen
                    </h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold shadow-sm hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg transition-all duration-300"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!kitchen) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24 bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Kitchen Not Found
                    </h2>
                    <p className="text-gray-600">
                        The restaurant you're looking for doesn't exist.
                    </p>
                </div>
            </div>
        );
    }

    // Format address
    const formatAddress = (location) => {
        if (!location) return 'Address not available';
        const parts = [
            location.house,
            location.road,
            location.area,
            location.city,
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : 'Address not available';
    };

    // NEW: open / close modal helpers
    const openItemModal = (item) => {
        setSelectedItem(item);
        setShowItemModal(true);
        // prevent background scroll
        document.documentElement.style.overflow = 'hidden';
    };
    const closeItemModal = () => {
        setShowItemModal(false);
        setSelectedItem(null);
        document.documentElement.style.overflow = '';
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500 text-white py-16 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
                        {kitchen.name}
                    </h1>
                    <p className="text-xl max-w-3xl mx-auto mb-6">
                        {kitchen.description || 'Serving delicious meals with passion'}
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-4 mt-8">
                        {kitchen.isOpen !== undefined && (
                            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                                <FaClock className="text-white" />
                                <span className="font-semibold">
                                    {kitchen.isOpen ? 'OPEN NOW' : 'CLOSED'}
                                </span>
                            </div>
                        )}
                        {kitchen.cuisineTypes && kitchen.cuisineTypes.length > 0 && (
                            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                                <FaUtensils className="text-white" />
                                <span className="font-semibold">
                                    {kitchen.cuisineTypes.slice(0, 3).join(', ')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Restaurant Info */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">About Us</h2>
                            <p className="text-gray-700 mb-6">
                                {kitchen.about || `Welcome to ${kitchen.name}, where we serve delicious meals made with fresh ingredients and passion.`}
                            </p>
                            
                            <div className="space-y-3">
                                {kitchen.location && (
                                    <div className="flex items-start">
                                        <FaMapMarkerAlt className="text-emerald-600 mt-1 mr-3" />
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Address</h3>
                                            <p className="text-gray-700">{formatAddress(kitchen.location)}</p>
                                        </div>
                                    </div>
                                )}
                                
                                {kitchen.phone && (
                                    <div className="flex items-start">
                                        <FaPhone className="text-emerald-600 mt-1 mr-3" />
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Phone</h3>
                                            <p className="text-gray-700">{kitchen.phone}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                       
                    </div>
                </div>

                {/* Menu Section */}
                <div className="mb-12">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h2 className="text-3xl font-bold text-gray-900">Our Menu</h2>
                        <div className="flex items-center gap-2">
                            <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                {menuItems?.length || 0} items
                            </span>
                        </div>
                    </div>
                    
                    {menuItems && menuItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {menuItems.map((item) => (
                                <div
                                    key={item._id}
                                    // OPEN MODAL when clicking the card
                                    onClick={() => openItemModal(item)}
                                    className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 flex flex-col h-full cursor-pointer"
                                >
                                    {/* Item Image - use DB url with fallback */}
                                    <img
                                        src={item.imageUrl || FALLBACK_IMAGE}
                                        alt={item.name || 'Menu item'}
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = FALLBACK_IMAGE;
                                        }}
                                        className="h-52 w-full object-cover"
                                    />


                                    {/* Item Info */}
                                    <div className="p-5 flex flex-col flex-grow">
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                    {item.name}
                                                </h3>
                                                <p className="text-lg font-bold text-emerald-700 whitespace-nowrap ml-2">
                                                    {typeof item.price === 'number' ? item.price : item.price} BDT
                                                </p>
                                            </div>
                                            {item.description && (
                                                <p className="text-gray-600 mb-4 text-sm">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            // prevent card click when clicking the Add to Cart button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // existing add-to-cart behavior (placeholder)
                                                console.log('Add to cart:', item._id);
                                            }}
                                            className="bg-emerald-600 text-white w-full py-3 rounded-lg font-semibold shadow-sm hover:-translate-y-0.5 hover:bg-emerald-700 transition-all duration-300 mt-auto"
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-md p-12 text-center">
                            <div className="text-7xl mb-6 text-emerald-600">🍽️</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Menu coming soon
                            </h3>
                            <p className="text-gray-600">
                                This restaurant hasn't added their menu yet. Check back soon!
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* NEW: Item detail modal */}
            {showItemModal && selectedItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4"
                    onClick={closeItemModal}
                    aria-hidden={!showItemModal}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Image at top to avoid scaling/layout issues */}
                        <div className="w-full">
                            <img
                                src={selectedItem.imageUrl || FALLBACK_IMAGE}
                                alt={selectedItem.name}
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = FALLBACK_IMAGE;
                                }}
                                className="w-full h-64 md:h-80 object-cover"
                            />
                        </div>
                        
                        {/* Info below the image */}
                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">{selectedItem.name}</h3>
                                    <p className="text-gray-600 mt-2">{selectedItem.description}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-emerald-700">
                                        {typeof selectedItem.price === 'number'
                                            ? selectedItem.price
                                            : selectedItem.price} BDT
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 space-y-3 text-sm text-gray-700">
                                {selectedItem.calories !== undefined && selectedItem.calories !== null && (
                                    <div>Calories: <span className="font-semibold">{selectedItem.calories} kcal</span></div>
                                )}

                                <div>
                                    <div className="font-semibold mb-1">Ingredients</div>
                                    {selectedItem.ingredients && selectedItem.ingredients.length > 0 ? (
                                        <ul className="list-disc ml-5 text-gray-700">
                                            {Array.isArray(selectedItem.ingredients)
                                                ? selectedItem.ingredients.map((ing, i) => <li key={i}>{ing}</li>)
                                                : String(selectedItem.ingredients).split(',').map((ing, i) => <li key={i}>{ing.trim()}</li>)
                                            }
                                        </ul>
                                    ) : (
                                        <div className="text-gray-500">No ingredients provided</div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => {
                                        // placeholder add to cart
                                        console.log('Add to cart from modal:', selectedItem._id);
                                        closeItemModal();
                                    }}
                                    className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
                                >
                                    Add to Cart
                                </button>
                                <button
                                    onClick={closeItemModal}
                                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
