// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Authentication
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: function() {
      return !this.socialAuth;
    }
  },
  socialAuth: {
    provider: String, // 'google', 'facebook', etc.
    providerId: String
  },
  
  // Profile
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  
  // Preferences
  preferences: {
    dietType: {
      type: String,
      enum: ['veg', 'non-veg', 'both'],
      default: 'both'
    },
    spiceLevel: {
      type: String,
      enum: ['mild', 'medium', 'hot'],
      default: 'medium'
    },
    cuisinePreferences: [String]
  },
  
  // Wallet
  walletBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Delivery Address
  addresses: [{
    label: String, // 'home', 'work', etc.
    street: String,
    city: String,
    state: String,
    zipCode: String,
    isDefault: Boolean
  }],
  
  // Referral System
  referralCode: {
    type: String,
    unique: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  referralCount: {
    type: Number,
    default: 0
  },
  rewardPoints: {
    type: Number,
    default: 0
  },
  
  // Group Plan
  groupPlan: {
    isInGroup: {
      type: Boolean,
      default: false
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GroupPlan'
    },
    role: {
      type: String,
      enum: ['admin', 'member']
    }
  },
  
  // Notifications
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ referralCode: 1 });

module.exports = mongoose.model('User', userSchema);

// ============================================

// models/Kitchen.js
const kitchenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  
  // Contact & Location
  contact: {
    phone: String,
    email: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  
  // Media
  images: [String], // URLs
  logo: String,
  
  // Cuisines offered
  cuisines: [String],
  
  // Rating
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  // Operational
  isActive: {
    type: Boolean,
    default: true
  },
  servingCapacity: Number, // meals per day
  
  // Pricing info
  pricingTier: {
    type: String,
    enum: ['budget', 'standard', 'premium']
  }
}, {
  timestamps: true
});

kitchenSchema.index({ name: 1 });
kitchenSchema.index({ cuisines: 1 });

module.exports = mongoose.model('Kitchen', kitchenSchema);

// ============================================

// models/Meal.js
const mealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  
  // Kitchen relation
  kitchen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Kitchen',
    required: true
  },
  
  // Media
  images: [String],
  
  // Classification
  category: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  cuisineType: String,
  dietType: {
    type: String,
    enum: ['veg', 'non-veg'],
    required: true
  },
  spiceLevel: {
    type: String,
    enum: ['mild', 'medium', 'hot']
  },
  
  // Nutritional Info
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number,
    fiber: Number
  },
  ingredients: [String],
  allergens: [String],
  
  // Pricing
  price: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Availability
  isAvailable: {
    type: Boolean,
    default: true
  },
  availableDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  
  // Rating
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  // Inventory tracking
  stockCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

mealSchema.index({ kitchen: 1 });
mealSchema.index({ category: 1, dietType: 1 });
mealSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Meal', mealSchema);

// ============================================

// models/Subscription.js
const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Plan details
  planType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  tier: {
    type: String,
    enum: ['basic', 'standard', 'premium'],
    required: true
  },
  
  // Meals per day
  mealsPerDay: {
    type: Number,
    default: 1,
    min: 1
  },
  mealCategories: [{
    type: String,
    enum: ['breakfast', 'lunch', 'dinner']
  }],
  
  // Pricing
  pricePerMeal: Number,
  totalPrice: Number,
  discount: {
    type: Number,
    default: 0
  },
  
  // Duration
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'expired'],
    default: 'active'
  },
  pausedDates: [Date],
  
  // Delivery preferences
  deliveryTimeSlot: {
    type: String,
    enum: ['morning', 'afternoon', 'evening']
  },
  deliveryAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User.addresses'
  },
  
  // Auto-renewal
  autoRenew: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);

// ============================================

// models/Order.js
const orderSchema = new mongoose.Schema({
  // User & Subscription
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  
  // Order items
  items: [{
    meal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meal',
      required: true
    },
    kitchen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Kitchen'
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    price: Number,
    customizations: String
  }],
  
  // Pricing
  subtotal: Number,
  discount: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  
  // Scheduled delivery
  scheduledDate: {
    type: Date,
    required: true
  },
  deliveryTimeSlot: {
    type: String,
    enum: ['morning', 'afternoon', 'evening']
  },
  
  // Delivery details
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    timestamp: Date,
    notes: String
  }],
  
  // Delivery tracking
  deliveryPartner: String,
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  
  // Payment
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['wallet', 'card', 'upi', 'cash']
  },
  transactionId: String,
  
  // Notes
  specialInstructions: String,
  cancellationReason: String
}, {
  timestamps: true
});

orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ scheduledDate: 1 });
orderSchema.index({ status: 1, scheduledDate: 1 });

module.exports = mongoose.model('Order', orderSchema);

// ============================================

// models/MealRating.js
const mealRatingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  meal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meal',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  
  // Rating
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  
  // Review
  comment: String,
  
  // Media
  images: [String],
  
  // Admin moderation
  isApproved: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Prevent duplicate ratings for same order-meal combination
mealRatingSchema.index({ user: 1, meal: 1, order: 1 }, { unique: true });
mealRatingSchema.index({ meal: 1 });

module.exports = mongoose.model('MealRating', mealRatingSchema);

// ============================================

// models/Transaction.js
const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Transaction details
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  category: {
    type: String,
    enum: ['wallet_recharge', 'order_payment', 'refund', 'reward', 'referral_bonus'],
    required: true
  },
  
  amount: {
    type: Number,
    required: true
  },
  
  // Related entities
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  
  // Payment gateway details
  paymentMethod: String,
  paymentGateway: String,
  gatewayTransactionId: String,
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Balance tracking
  balanceBefore: Number,
  balanceAfter: Number,
  
  // Notes
  description: String,
  failureReason: String
}, {
  timestamps: true
});

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);

// ============================================

// models/Cart.js
const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  items: [{
    meal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meal',
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    scheduledDate: Date,
    customizations: String
  }],
  
  // Pricing summary
  subtotal: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);

// ============================================

// models/MealCalendar.js
const mealCalendarSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  
  // Schedule
  date: {
    type: Date,
    required: true
  },
  mealCategory: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner'],
    required: true
  },
  
  // Meal assignment
  meal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meal',
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['scheduled', 'skipped', 'swapped', 'delivered'],
    default: 'scheduled'
  },
  
  // If swapped
  originalMeal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meal'
  },
  
  // Related order
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }
}, {
  timestamps: true
});

mealCalendarSchema.index({ user: 1, date: 1 });
mealCalendarSchema.index({ subscription: 1, date: 1 });

module.exports = mongoose.model('MealCalendar', mealCalendarSchema);

// ============================================

// models/GroupPlan.js
const groupPlanSchema = new mongoose.Schema({
  name: String,
  
  // Admin of the group
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Members
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: Date,
    status: {
      type: String,
      enum: ['active', 'inactive']
    }
  }],
  
  // Shared subscription
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  
  // Discount
  discountPercentage: {
    type: Number,
    default: 0
  },
  
  // Delivery
  sharedAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

groupPlanSchema.index({ admin: 1 });

module.exports = mongoose.model('GroupPlan', groupPlanSchema);

// ============================================

// models/Notification.js
const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  type: {
    type: String,
    enum: ['order_update', 'delivery', 'promotion', 'subscription', 'payment'],
    required: true
  },
  
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  
  // Related entity
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  
  // Status
  isRead: {
    type: Boolean,
    default: false
  },
  
  // Delivery channels
  channels: {
    push: Boolean,
    email: Boolean,
    sms: Boolean
  },
  
  // Delivery status
  deliveryStatus: {
    push: String,
    email: String,
    sms: String
  }
}, {
  timestamps: true
});

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

// ============================================

// models/Promotion.js
const promotionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  
  // Promo code
  code: {
    type: String,
    unique: true,
    uppercase: true
  },
  
  // Discount
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  maxDiscount: Number, // for percentage discounts
  minOrderValue: Number,
  
  // Validity
  startDate: Date,
  endDate: Date,
  
  // Usage limits
  usageLimit: Number, // total times can be used
  usageCount: {
    type: Number,
    default: 0
  },
  perUserLimit: Number,
  
  // Targeting
  applicableFor: {
    type: String,
    enum: ['all', 'new_users', 'specific_users'],
    default: 'all'
  },
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Media
  bannerImage: String,
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

promotionSchema.index({ code: 1 });
promotionSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Promotion', promotionSchema);