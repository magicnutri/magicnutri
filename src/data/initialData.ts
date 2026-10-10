import { Product, ShopSettings, Campaign } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Fit High Protein Chocolate Bowl',
    category: 'Oats Bowls',
    price: 79,
    description: 'Wholesome rolled oats infused with premium cocoa, plant protein, fresh sliced bananas, and crunchy raw almonds.',
    ingredients: ['Rolled Oats', 'Plant Protein Blend', 'Raw Cacao', 'Sliced Bananas', 'Toasted Almonds', 'Chia Seeds', 'Honey'],
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    featured: true,
    calories: 340,
    proteinGrams: 22,
    dietaryTags: ['High Protein', 'Fiber Rich']
  },
  {
    id: 'prod-3',
    name: 'Brown Rice Cake Sandwich',
    category: 'Brown Rice Cake Sandwiches',
    price: 59,
    description: 'Crisp whole-grain brown rice cakes layered with fresh sliced avocado, ripe tomatoes, crisp cucumber, and light cottage cheese spread.',
    ingredients: ['Whole Grain Brown Rice Cakes', 'Fresh Hass Avocado', 'Low-fat Cottage Cheese', 'Cucumber', 'Plum Tomatoes', 'Baby Microgreens', 'Cracked Pepper'],
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    featured: true,
    calories: 195,
    proteinGrams: 12,
    dietaryTags: ['Low Calorie', 'Gluten Free']
  },
  {
    id: 'prod-4',
    name: 'Fit Sandwich',
    category: 'Protein Sandwiches',
    price: 49,
    description: 'Multi-grain toast layered with lightly spiced low-fat paneer, fresh English cucumber, crisp lettuce, and hung curd mint dressing.',
    ingredients: ['Multi-grain Bread', 'Low-fat Paneer', 'Crisp Iceberg Lettuce', 'Cucumber', 'Mint Hung Curd', 'Herbs'],
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    featured: false,
    calories: 260,
    proteinGrams: 16,
    dietaryTags: ['High Protein']
  },
  {
    id: 'prod-6',
    name: 'Fit Mix Sprout Salad',
    category: 'Sprout Salads',
    price: 39,
    description: 'Crunchy sprouted green moong and brown chickpea salad tossed with sweet ruby pomegranate pearls, diced cucumber, and tangy lemon zest.',
    ingredients: ['Sprouted Moong Beans', 'Sprouted Moth Beans', 'Ruby Pomegranate', 'English Cucumber', 'Roasted Peanuts', 'Fresh Lemon Juice', 'Pink Rock Salt'],
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    featured: false,
    calories: 160,
    proteinGrams: 11,
    dietaryTags: ['Low Calorie', 'Fiber Rich', 'Vegan']
  },
  {
    id: 'prod-8',
    name: 'Oats Bowl',
    category: 'Oats Bowls',
    price: 100,
    description: 'Our deluxe gourmet warm oats bowl adorned with fresh blueberries, strawberries, kiwi slices, California walnuts, and genuine maple drizzle.',
    ingredients: ['Premium Rolled Oats', 'Almond Milk', 'Blueberries', 'Strawberries', 'Kiwi Slices', 'Walnut Halves', 'Organic Canadian Maple'],
    image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    featured: true,
    calories: 360,
    proteinGrams: 15,
    dietaryTags: ['Fiber Rich', 'Vegan']
  },
  {
    id: 'prod-9',
    name: 'Fruit Basil Bliss',
    category: 'Chia and Basil Seed Bowls',
    price: 70,
    description: 'Cooling natural sabja (basil seeds) infused in sweet tender coconut water, layered with watermelon spheres, dragonfruit, and mint.',
    ingredients: ['Tender Coconut Water', 'Sweet Basil Seeds (Sabja)', 'Watermelon', 'Dragonfruit', 'Fresh Garden Mint', 'Lime Drop'],
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    comingSoon: true, // Coming Soon: cannot order
    featured: false,
    calories: 130,
    proteinGrams: 4,
    dietaryTags: ['Low Calorie', 'Vegan', 'Gluten Free']
  },
  {
    id: 'prod-10',
    name: 'Protein Sandwich',
    category: 'Protein Sandwiches',
    price: 50,
    description: 'Grilled whole wheat bread stuffed with herb-marinated protein cottage paneer, sauteed bell peppers, and low-calorie garlic spread.',
    ingredients: ['Whole Wheat Bread', 'High-Protein Paneer', 'Tricolor Bell Peppers', 'Baby Spinach', 'Dijon Mustard & Garlic Spread'],
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    featured: false,
    calories: 310,
    proteinGrams: 20,
    dietaryTags: ['High Protein']
  }
];

export const INITIAL_SETTINGS: ShopSettings = {
  shopName: 'Magic Nutri',
  shopTagline: 'Eat Healthy. Live Happy.',
  phone: '9304163529',
  address: 'Gandhi Chowk, Near City Center, Dumka & Godda, Jharkhand, India',
  openingHours: '7:00 AM – 11:00 AM',
  pickupEnabled: true,
  dineInEnabled: true,
  scratchMinPoints: 20,
  scratchMaxPoints: 50,
  pointsToRupeesRatio: 20, // 20 points = ₹1, meaning 100 points = ₹5
  minRedemptionPoints: 20, // Minimum 20 points (₹1.00) to redeem on an order
  maxRedemptionPercentage: 50, // Maximum 50% discount on total
  ownerPushNotificationsEnabled: true
};

export const INITIAL_CAMPAIGN: Campaign = {
  id: 'camp-101',
  name: '100 Orders = 1 Lucky Customer Wins Free Food',
  targetOrders: 100,
  currentOrderCount: 73, // 73 of 100 completed as realistic ongoing milestone!
  status: 'active',
  eligibleProductIds: ['prod-1', 'prod-3', 'prod-4', 'prod-8'],
  redeemed: false,
  createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
};
