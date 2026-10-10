export type ProductCategory =
  | 'Oats Bowls'
  | 'Fruit Bowls'
  | 'Chia and Basil Seed Bowls'
  | 'Protein Sandwiches'
  | 'Brown Rice Cake Sandwiches'
  | 'Sprout Salads'
  | 'Healthy Snacks';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number; // in INR
  description: string;
  ingredients: string[];
  image: string;
  inStock: boolean;
  comingSoon?: boolean;
  featured?: boolean;
  calories?: number;
  proteinGrams?: number;
  dietaryTags?: ('High Protein' | 'Fiber Rich' | 'Low Calorie' | 'Vegan' | 'Gluten Free')[];
}

export type OrderStatus =
  | 'Order Received'
  | 'Accepted'
  | 'Preparing'
  | 'Ready for Pickup'
  | 'Completed'
  | 'Cancelled';

export type PaymentStatus =
  | 'Unpaid (Pay at Counter)'
  | 'Paid Offline';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string; // e.g., MN-4821
  customerPhone: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  pointsDiscount: number;
  pointsRedeemed: number;
  totalAmount: number;
  orderType: 'dine-in' | 'pickup';
  tableNumber?: string;
  notes?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  createdAt: string;
  scratchCardIssued: boolean;
  scratchCardId?: string;
}

export interface ScratchCard {
  id: string;
  orderId: string;
  customerPhone: string;
  pointsWon: number; // server generated 20-50 points
  isScratched: boolean;
  scratchedAt?: string;
  rupeeValue: number; // pointsWon / 20 (since 100 pts = ₹5)
}

export interface CustomerProfile {
  phone: string;
  name: string;
  totalPointsBalance: number;
  lifetimePointsEarned: number;
  ordersCount: number;
  createdAt: string;
}

export interface RewardTransaction {
  id: string;
  customerPhone: string;
  orderId?: string;
  type: 'earned_scratch' | 'redeemed_order' | 'bonus_campaign';
  points: number; // positive for earn, negative for redeem
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  targetOrders: number;
  currentOrderCount: number;
  status: 'active' | 'completed';
  eligibleProductIds: string[];
  winnerCustomerPhone?: string;
  winnerCustomerName?: string;
  winnerOrderId?: string;
  winningProductName?: string;
  redeemed: boolean;
  redeemedAt?: string;
  createdAt: string;
}

export interface ShopSettings {
  shopName: string;
  shopTagline: string;
  phone: string;
  address: string;
  openingHours: string;
  pickupEnabled: boolean;
  dineInEnabled: boolean;
  scratchMinPoints: number;
  scratchMaxPoints: number;
  pointsToRupeesRatio: number; // 20 points = ₹1 (100 points = ₹5)
  minRedemptionPoints: number; // default e.g. 50
  maxRedemptionPercentage: number; // default e.g. 50%
  ownerPushNotificationsEnabled: boolean;
}

export type OfferDiscountType = 'points' | 'percentage' | 'free_item' | 'flat_rupees' | 'draw';

export interface PromoOffer {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: OfferDiscountType;
  value: string;
  badge: string;
  isActive: boolean; // Owner toggles ON or OFF
  scheduleType: 'always' | 'hours' | 'date_range'; // When active or off
  validHoursStart?: string; // e.g. '07:00'
  validHoursEnd?: string; // e.g. '11:00'
  validDays?: string[];
  startDate?: string;
  endDate?: string;
  validHours?: string;
  terms: string;
  minOrderAmount?: number;
  timesUsed?: number;
  createdAt?: string;
  updatedAt?: string;
}
