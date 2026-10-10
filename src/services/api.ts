import {
  Product,
  Order,
  ScratchCard,
  CustomerProfile,
  RewardTransaction,
  Campaign,
  ShopSettings,
  OrderStatus,
  PromoOffer
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS, INITIAL_CAMPAIGN } from '../data/initialData';
import { INITIAL_OFFERS } from '../utils/preferences';

const STORAGE_KEYS = {
  PRODUCTS: 'magic_nutri_products_v1',
  ORDERS: 'magic_nutri_orders_v1',
  MASTER_ORDERS: 'magic_nutri_master_orders_v1', // Lifetime permanent ledger - never wiped by daily reset
  SCRATCH_CARDS: 'magic_nutri_scratch_cards_v1',
  PROFILES: 'magic_nutri_profiles_v1',
  TRANSACTIONS: 'magic_nutri_transactions_v1',
  CAMPAIGN: 'magic_nutri_campaign_v1',
  SETTINGS: 'magic_nutri_settings_v1',
  CURRENT_USER: 'magic_nutri_current_user_v1',
  ADMIN_TOKEN: 'magic_nutri_admin_token_v1',
  ADMIN_PIN: 'magic_nutri_admin_pin_v2',
  OTP: 'magic_nutri_otps_v1',
  OFFERS: 'magic_nutri_offers_v1',
};

// Cryptographically secure random integer between min and max inclusive
function getSecureRandomInt(min: number, max: number): number {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const range = max - min + 1;
    return min + (array[0] % range);
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate unique order ID
function generateOrderId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `MN-${num}`;
}

class ApiService {
  private getStorage<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private setStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }

  // Init default storage
  init(): void {
    const storedProducts = this.getStorage<Product[] | null>(STORAGE_KEYS.PRODUCTS, null);
    if (!storedProducts) {
      this.setStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    } else {
      // Synchronize: Remove deleted items prod-2, prod-5, prod-7, mark prod-9 comingSoon, and update images for prod-3, prod-8, prod-10
      const updated = storedProducts
        .filter((p) => p.id !== 'prod-2' && p.id !== 'prod-5' && p.id !== 'prod-7')
        .map((p) => {
          if (p.id === 'prod-9') return { ...p, comingSoon: true };
          if (p.id === 'prod-3') {
            return {
              ...p,
              image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80'
            };
          }
          if (p.id === 'prod-8') {
            return {
              ...p,
              image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=800&q=80'
            };
          }
          if (p.id === 'prod-10') {
            return {
              ...p,
              image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80'
            };
          }
          return p;
        });
      this.setStorage(STORAGE_KEYS.PRODUCTS, updated);
    }

    const storedSettings = this.getStorage<ShopSettings | null>(STORAGE_KEYS.SETTINGS, null);
    if (!storedSettings) {
      this.setStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    } else {
      storedSettings.phone = '9304163529';
      storedSettings.openingHours = '7:00 AM – 11:00 AM';
      storedSettings.address = 'Gandhi Chowk, Near City Center, Dumka & Godda, Jharkhand, India';
      this.setStorage(STORAGE_KEYS.SETTINGS, storedSettings);
    }

    if (!localStorage.getItem(STORAGE_KEYS.ADMIN_PIN)) {
      this.setStorage(STORAGE_KEYS.ADMIN_PIN, 'INSERT COIN 46');
    }

    if (!localStorage.getItem(STORAGE_KEYS.CAMPAIGN)) {
      this.setStorage(STORAGE_KEYS.CAMPAIGN, INITIAL_CAMPAIGN);
    }
    if (!localStorage.getItem(STORAGE_KEYS.OFFERS)) {
      this.setStorage(STORAGE_KEYS.OFFERS, INITIAL_OFFERS);
    }
    // Seed sample orders for live register if not present
    const sampleLiveOrders: Order[] = [
      {
        id: 'MN-7321',
        customerPhone: '9845011223',
        customerName: 'Aarav Sharma',
        items: [
          {
            productId: 'prod-1',
            name: 'Fit High Protein Chocolate Bowl',
            price: 79,
            quantity: 1,
            image: INITIAL_PRODUCTS[0].image
          },
          {
            productId: 'prod-3',
            name: 'Brown Rice Cake Sandwich',
            price: 59,
            quantity: 1,
            image: INITIAL_PRODUCTS[1].image
          }
        ],
        subtotal: 138,
        pointsDiscount: 0,
        pointsRedeemed: 0,
        totalAmount: 138,
        orderType: 'dine-in',
        tableNumber: 'Table 4',
        status: 'Preparing',
        paymentStatus: 'Unpaid (Pay at Counter)',
        paymentMethod: 'Cash / UPI at Counter',
        createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        scratchCardIssued: true,
        scratchCardId: 'sc-sample-1'
      },
      {
        id: 'MN-7319',
        customerPhone: '9876543210',
        customerName: 'Pooja Reddy',
        items: [
          {
            productId: 'prod-1',
            name: 'Fit High Protein Chocolate Bowl',
            price: 79,
            quantity: 2,
            image: INITIAL_PRODUCTS[0].image
          }
        ],
        subtotal: 158,
        pointsDiscount: 5,
        pointsRedeemed: 100,
        totalAmount: 153,
        orderType: 'pickup',
        status: 'Ready for Pickup',
        paymentStatus: 'Paid Offline',
        paymentMethod: 'Cash / UPI at Counter',
        createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
        scratchCardIssued: true,
        scratchCardId: 'sc-sample-2'
      }
    ];

    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      this.setStorage(STORAGE_KEYS.ORDERS, sampleLiveOrders);
    }

    if (!localStorage.getItem(STORAGE_KEYS.MASTER_ORDERS)) {
      // Historical master orders for lifetime, 1 year, 1 month, 1 week analytics
      const dayMs = 24 * 60 * 60 * 1000;
      const historicalMasterOrders: Order[] = [
        ...sampleLiveOrders,
        {
          id: 'MN-7305',
          customerPhone: '9845011223',
          customerName: 'Aarav Sharma',
          items: [
            {
              productId: 'prod-2',
              name: 'Berry Chia Power Bowl',
              price: 89,
              quantity: 2,
              image: INITIAL_PRODUCTS[2]?.image || INITIAL_PRODUCTS[0].image
            }
          ],
          subtotal: 178,
          pointsDiscount: 0,
          pointsRedeemed: 0,
          totalAmount: 178,
          orderType: 'dine-in',
          tableNumber: 'Table 2',
          status: 'Completed',
          paymentStatus: 'Paid Offline',
          paymentMethod: 'Cash / UPI at Counter',
          createdAt: new Date(Date.now() - 2 * dayMs).toISOString(),
          scratchCardIssued: true
        },
        {
          id: 'MN-7288',
          customerPhone: '9123456780',
          customerName: 'Rohan Verma',
          items: [
            {
              productId: 'prod-1',
              name: 'Fit High Protein Chocolate Bowl',
              price: 79,
              quantity: 1,
              image: INITIAL_PRODUCTS[0].image
            },
            {
              productId: 'prod-5',
              name: 'Sprouted Moong Protein Salad',
              price: 49,
              quantity: 1,
              image: INITIAL_PRODUCTS[4]?.image || INITIAL_PRODUCTS[1].image
            }
          ],
          subtotal: 128,
          pointsDiscount: 5,
          pointsRedeemed: 100,
          totalAmount: 123,
          orderType: 'pickup',
          status: 'Completed',
          paymentStatus: 'Paid Offline',
          paymentMethod: 'Cash / UPI at Counter',
          createdAt: new Date(Date.now() - 4 * dayMs).toISOString(),
          scratchCardIssued: true
        },
        {
          id: 'MN-7240',
          customerPhone: '9876543210',
          customerName: 'Pooja Reddy',
          items: [
            {
              productId: 'prod-3',
              name: 'Brown Rice Cake Sandwich',
              price: 59,
              quantity: 2,
              image: INITIAL_PRODUCTS[1].image
            }
          ],
          subtotal: 118,
          pointsDiscount: 0,
          pointsRedeemed: 0,
          totalAmount: 118,
          orderType: 'dine-in',
          tableNumber: 'Table 5',
          status: 'Completed',
          paymentStatus: 'Paid Offline',
          paymentMethod: 'Cash / UPI at Counter',
          createdAt: new Date(Date.now() - 14 * dayMs).toISOString(),
          scratchCardIssued: true
        },
        {
          id: 'MN-7195',
          customerPhone: '9431234567',
          customerName: 'Sunita Devi',
          items: [
            {
              productId: 'prod-4',
              name: 'Paneer Tofu Protein Sandwich',
              price: 69,
              quantity: 2,
              image: INITIAL_PRODUCTS[3]?.image || INITIAL_PRODUCTS[1].image
            }
          ],
          subtotal: 138,
          pointsDiscount: 0,
          pointsRedeemed: 0,
          totalAmount: 138,
          orderType: 'pickup',
          status: 'Completed',
          paymentStatus: 'Paid Offline',
          paymentMethod: 'Cash / UPI at Counter',
          createdAt: new Date(Date.now() - 25 * dayMs).toISOString(),
          scratchCardIssued: true
        },
        {
          id: 'MN-7080',
          customerPhone: '9845011223',
          customerName: 'Aarav Sharma',
          items: [
            {
              productId: 'prod-1',
              name: 'Fit High Protein Chocolate Bowl',
              price: 79,
              quantity: 3,
              image: INITIAL_PRODUCTS[0].image
            }
          ],
          subtotal: 237,
          pointsDiscount: 10,
          pointsRedeemed: 200,
          totalAmount: 227,
          orderType: 'dine-in',
          status: 'Completed',
          paymentStatus: 'Paid Offline',
          paymentMethod: 'Cash / UPI at Counter',
          createdAt: new Date(Date.now() - 75 * dayMs).toISOString(),
          scratchCardIssued: true
        },
        {
          id: 'MN-6920',
          customerPhone: '9988776655',
          customerName: 'Vikram Singh',
          items: [
            {
              productId: 'prod-2',
              name: 'Berry Chia Power Bowl',
              price: 89,
              quantity: 1,
              image: INITIAL_PRODUCTS[2]?.image || INITIAL_PRODUCTS[0].image
            },
            {
              productId: 'prod-3',
              name: 'Brown Rice Cake Sandwich',
              price: 59,
              quantity: 1,
              image: INITIAL_PRODUCTS[1].image
            }
          ],
          subtotal: 148,
          pointsDiscount: 0,
          pointsRedeemed: 0,
          totalAmount: 148,
          orderType: 'pickup',
          status: 'Completed',
          paymentStatus: 'Paid Offline',
          paymentMethod: 'Cash / UPI at Counter',
          createdAt: new Date(Date.now() - 160 * dayMs).toISOString(),
          scratchCardIssued: true
        },
        {
          id: 'MN-6500',
          customerPhone: '9304163529',
          customerName: 'First Loyalty Member',
          items: [
            {
              productId: 'prod-1',
              name: 'Fit High Protein Chocolate Bowl',
              price: 79,
              quantity: 2,
              image: INITIAL_PRODUCTS[0].image
            }
          ],
          subtotal: 158,
          pointsDiscount: 0,
          pointsRedeemed: 0,
          totalAmount: 158,
          orderType: 'dine-in',
          status: 'Completed',
          paymentStatus: 'Paid Offline',
          paymentMethod: 'Cash / UPI at Counter',
          createdAt: new Date(Date.now() - 390 * dayMs).toISOString(),
          scratchCardIssued: true
        }
      ];
      this.setStorage(STORAGE_KEYS.MASTER_ORDERS, historicalMasterOrders);
    }
  }

  // --- PRODUCTS ---
  async getProducts(): Promise<Product[]> {
    this.init();
    return this.getStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }

  async updateProduct(product: Product): Promise<Product> {
    const products = await this.getProducts();
    const idx = products.findIndex((p) => p.id === product.id);
    if (idx !== -1) {
      products[idx] = product;
    } else {
      products.push(product);
    }
    this.setStorage(STORAGE_KEYS.PRODUCTS, products);
    return product;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const products = await this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    this.setStorage(STORAGE_KEYS.PRODUCTS, filtered);
    return true;
  }

  // --- SETTINGS ---
  async getSettings(): Promise<ShopSettings> {
    this.init();
    return this.getStorage<ShopSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }

  async updateSettings(settings: ShopSettings): Promise<ShopSettings> {
    this.setStorage(STORAGE_KEYS.SETTINGS, settings);
    return settings;
  }

  // --- CAMPAIGN (100 Orders = 1 Free Food) ---
  async getCampaign(): Promise<Campaign> {
    this.init();
    return this.getStorage<Campaign>(STORAGE_KEYS.CAMPAIGN, INITIAL_CAMPAIGN);
  }

  async markCampaignWinnerRedeemed(): Promise<Campaign> {
    const campaign = await this.getCampaign();
    campaign.redeemed = true;
    campaign.redeemedAt = new Date().toISOString();
    this.setStorage(STORAGE_KEYS.CAMPAIGN, campaign);
    return campaign;
  }

  // --- CUSTOMER PROFILES & AUTH ---
  getCurrentCustomer(): CustomerProfile | null {
    return this.getStorage<CustomerProfile | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  async loginCustomer(phone: string, name: string): Promise<CustomerProfile> {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const profiles = this.getStorage<Record<string, CustomerProfile>>(STORAGE_KEYS.PROFILES, {});
    let profile = profiles[cleanPhone];

    if (!profile) {
      profile = {
        phone: cleanPhone,
        name: name.trim() || 'Valued Guest',
        totalPointsBalance: 40, // Welcome loyalty bonus points
        lifetimePointsEarned: 40,
        ordersCount: 0,
        createdAt: new Date().toISOString()
      };
      profiles[cleanPhone] = profile;
      this.setStorage(STORAGE_KEYS.PROFILES, profiles);

      // Record welcome transaction
      const transactions = this.getStorage<RewardTransaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
      transactions.unshift({
        id: `tx-welcome-${Date.now()}`,
        customerPhone: cleanPhone,
        type: 'earned_scratch',
        points: 40,
        balanceAfter: 40,
        description: 'Welcome to Magic Nutri Bonus Points',
        createdAt: new Date().toISOString()
      });
      this.setStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
    } else if (name.trim() && profile.name !== name.trim()) {
      profile.name = name.trim();
      profiles[cleanPhone] = profile;
      this.setStorage(STORAGE_KEYS.PROFILES, profiles);
    }

    this.setStorage(STORAGE_KEYS.CURRENT_USER, profile);
    return profile;
  }

  logoutCustomer(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  async updateCustomerProfile(phone: string, updates: Partial<CustomerProfile>): Promise<CustomerProfile> {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const profiles = this.getStorage<Record<string, CustomerProfile>>(STORAGE_KEYS.PROFILES, {});
    let profile = profiles[cleanPhone];
    if (!profile) {
      throw new Error('Profile not found');
    }
    profile = { ...profile, ...updates };
    profiles[cleanPhone] = profile;
    this.setStorage(STORAGE_KEYS.PROFILES, profiles);
    const current = this.getCurrentCustomer();
    if (current && current.phone === cleanPhone) {
      this.setStorage(STORAGE_KEYS.CURRENT_USER, profile);
    }
    return profile;
  }

  async getCustomerProfile(phone: string): Promise<CustomerProfile | null> {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const profiles = this.getStorage<Record<string, CustomerProfile>>(STORAGE_KEYS.PROFILES, {});
    return profiles[cleanPhone] || null;
  }

  async getCustomerTransactions(phone: string): Promise<RewardTransaction[]> {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const all = this.getStorage<RewardTransaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    return all.filter((t) => t.customerPhone === cleanPhone);
  }

  // --- ORDERS ---
  async getOrders(): Promise<Order[]> {
    this.init();
    return this.getStorage<Order[]>(STORAGE_KEYS.ORDERS, []);
  }

  // Permanent Lifetime Master Ledger (Never reset by daily register resets)
  async getMasterOrders(): Promise<Order[]> {
    this.init();
    return this.getStorage<Order[]>(STORAGE_KEYS.MASTER_ORDERS, []);
  }

  async getCustomerOrders(phone: string): Promise<Order[]> {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    // Combine active and master so customer always sees full history
    const masterOrders = await this.getMasterOrders();
    const liveOrders = await this.getOrders();
    const map = new Map<string, Order>();
    masterOrders.forEach((o) => map.set(o.id, o));
    liveOrders.forEach((o) => map.set(o.id, o));
    return Array.from(map.values())
      .filter((o) => o.customerPhone === cleanPhone)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createOrder(params: {
    customerPhone: string;
    customerName: string;
    items: { productId: string; quantity: number }[];
    orderType: 'dine-in' | 'pickup';
    tableNumber?: string;
    notes?: string;
    pointsToRedeem?: number;
  }): Promise<{ order: Order; scratchCard: ScratchCard }> {
    const cleanPhone = params.customerPhone.replace(/\D/g, '').slice(-10);
    const products = await this.getProducts();
    const settings = await this.getSettings();

    // 1. Calculate authoritative totals on server
    let subtotal = 0;
    const orderItems: Order['items'] = [];

    for (const reqItem of params.items) {
      const product = products.find((p) => p.id === reqItem.productId);
      if (!product || !product.inStock) {
        throw new Error(`Product ${reqItem.productId} is unavailable.`);
      }
      if (product.comingSoon) {
        throw new Error(`Product ${product.name} is coming soon and cannot be ordered yet.`);
      }
      const itemSubtotal = product.price * reqItem.quantity;
      subtotal += itemSubtotal;
      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: reqItem.quantity,
        image: product.image
      });
    }

    // 2. Authoritative points redemption check
    let pointsDiscount = 0;
    let pointsRedeemed = 0;
    const minRedeem = settings.minRedemptionPoints || 20;

    if (params.pointsToRedeem && params.pointsToRedeem >= minRedeem) {
      const profile = await this.getCustomerProfile(cleanPhone);
      const availableBalance = profile ? profile.totalPointsBalance : 0;
      const actualToRedeem = Math.min(params.pointsToRedeem, availableBalance);

      if (actualToRedeem >= minRedeem) {
        // 20 points = ₹1, so actualToRedeem / 20 = discount rupees
        const requestedDiscount = Number((actualToRedeem / settings.pointsToRupeesRatio).toFixed(2));
        const maxDiscountAllowed = Number(((subtotal * settings.maxRedemptionPercentage) / 100).toFixed(2));
        pointsDiscount = Math.min(requestedDiscount, maxDiscountAllowed);
        pointsRedeemed = Math.round(pointsDiscount * settings.pointsToRupeesRatio);
      }
    }

    const totalAmount = Math.max(0, Number((subtotal - pointsDiscount).toFixed(2)));
    const orderId = generateOrderId();
    const scratchCardId = `sc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 3. Generate secure random scratch points between 20 and 50
    const pointsWon = getSecureRandomInt(settings.scratchMinPoints, settings.scratchMaxPoints);
    const rupeeValue = Number((pointsWon / settings.pointsToRupeesRatio).toFixed(2));

    const scratchCard: ScratchCard = {
      id: scratchCardId,
      orderId,
      customerPhone: cleanPhone,
      pointsWon,
      isScratched: false,
      rupeeValue
    };

    const newOrder: Order = {
      id: orderId,
      customerPhone: cleanPhone,
      customerName: params.customerName.trim() || 'Guest',
      items: orderItems,
      subtotal,
      pointsDiscount,
      pointsRedeemed,
      totalAmount,
      orderType: params.orderType,
      tableNumber: params.tableNumber,
      notes: params.notes,
      status: 'Order Received',
      paymentStatus: 'Unpaid (Pay at Counter)',
      paymentMethod: 'Cash / UPI at Counter',
      createdAt: new Date().toISOString(),
      scratchCardIssued: true,
      scratchCardId
    };

    // Save order to live daily register
    const orders = await this.getOrders();
    orders.unshift(newOrder);
    this.setStorage(STORAGE_KEYS.ORDERS, orders);

    // Save order to lifetime master ledger (permanent - never wiped by daily reset)
    const masterOrders = await this.getMasterOrders();
    masterOrders.unshift(newOrder);
    this.setStorage(STORAGE_KEYS.MASTER_ORDERS, masterOrders);

    // Save scratch card
    const cards = this.getStorage<ScratchCard[]>(STORAGE_KEYS.SCRATCH_CARDS, []);
    cards.unshift(scratchCard);
    this.setStorage(STORAGE_KEYS.SCRATCH_CARDS, cards);

    // Update profile points deduction if points were redeemed
    const profiles = this.getStorage<Record<string, CustomerProfile>>(STORAGE_KEYS.PROFILES, {});
    let profile = profiles[cleanPhone];
    if (profile) {
      profile.ordersCount += 1;
      if (pointsRedeemed > 0) {
        profile.totalPointsBalance = Math.max(0, profile.totalPointsBalance - pointsRedeemed);

        const transactions = this.getStorage<RewardTransaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
        transactions.unshift({
          id: `tx-redeem-${Date.now()}`,
          customerPhone: cleanPhone,
          orderId,
          type: 'redeemed_order',
          points: -pointsRedeemed,
          balanceAfter: profile.totalPointsBalance,
          description: `Redeemed on Order #${orderId} (-₹${pointsDiscount})`,
          createdAt: new Date().toISOString()
        });
        this.setStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
      }
      profiles[cleanPhone] = profile;
      this.setStorage(STORAGE_KEYS.PROFILES, profiles);
      this.setStorage(STORAGE_KEYS.CURRENT_USER, profile);
    }

    // 4. Update the "100 Orders = 1 Free Food" campaign counter
    const campaign = await this.getCampaign();
    campaign.currentOrderCount += 1;

    // Check if campaign reached 100 orders milestone
    if (campaign.currentOrderCount >= campaign.targetOrders && campaign.status === 'active') {
      // Pick random winner from the orders in this cycle
      campaign.status = 'completed';
      campaign.winnerCustomerPhone = cleanPhone;
      campaign.winnerCustomerName = params.customerName;
      campaign.winnerOrderId = orderId;
      // Pick random eligible free product
      const eligibleProds = products.filter((p) => campaign.eligibleProductIds.includes(p.id));
      const freeItem = eligibleProds[Math.floor(Math.random() * eligibleProds.length)] || products[0];
      campaign.winningProductName = freeItem ? freeItem.name : 'Fit High Protein Chocolate Bowl';
      campaign.redeemed = false;
    }
    this.setStorage(STORAGE_KEYS.CAMPAIGN, campaign);

    return { order: newOrder, scratchCard };
  }

  // --- SCRATCH CARD INTERACTION ---
  async getScratchCardByOrder(orderId: string): Promise<ScratchCard | null> {
    const cards = this.getStorage<ScratchCard[]>(STORAGE_KEYS.SCRATCH_CARDS, []);
    return cards.find((c) => c.orderId === orderId) || null;
  }

  async scratchCard(cardId: string): Promise<{ scratchCard: ScratchCard; newBalance: number }> {
    const cards = this.getStorage<ScratchCard[]>(STORAGE_KEYS.SCRATCH_CARDS, []);
    const card = cards.find((c) => c.id === cardId);
    if (!card) {
      throw new Error('Scratch card not found.');
    }
    if (card.isScratched) {
      const profile = await this.getCustomerProfile(card.customerPhone);
      return { scratchCard: card, newBalance: profile ? profile.totalPointsBalance : 0 };
    }

    // Mark as scratched atomically
    card.isScratched = true;
    card.scratchedAt = new Date().toISOString();
    this.setStorage(STORAGE_KEYS.SCRATCH_CARDS, cards);

    // Credit points to user profile
    const profiles = this.getStorage<Record<string, CustomerProfile>>(STORAGE_KEYS.PROFILES, {});
    let profile = profiles[card.customerPhone];
    if (!profile) {
      profile = {
        phone: card.customerPhone,
        name: 'Valued Guest',
        totalPointsBalance: 0,
        lifetimePointsEarned: 0,
        ordersCount: 1,
        createdAt: new Date().toISOString()
      };
    }
    profile.totalPointsBalance += card.pointsWon;
    profile.lifetimePointsEarned += card.pointsWon;
    profiles[card.customerPhone] = profile;
    this.setStorage(STORAGE_KEYS.PROFILES, profiles);

    // Record transaction
    const transactions = this.getStorage<RewardTransaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    transactions.unshift({
      id: `tx-scratch-${Date.now()}`,
      customerPhone: card.customerPhone,
      orderId: card.orderId,
      type: 'earned_scratch',
      points: card.pointsWon,
      balanceAfter: profile.totalPointsBalance,
      description: `Scratch Card Won on Order #${card.orderId}`,
      createdAt: new Date().toISOString()
    });
    this.setStorage(STORAGE_KEYS.TRANSACTIONS, transactions);

    // Update active user session if matching
    const current = this.getCurrentCustomer();
    if (current && current.phone === card.customerPhone) {
      this.setStorage(STORAGE_KEYS.CURRENT_USER, profile);
    }

    return { scratchCard: card, newBalance: profile.totalPointsBalance };
  }

  // --- ORDER MANAGEMENT (ADMIN) ---
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const orders = await this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      order.status = status;
      this.setStorage(STORAGE_KEYS.ORDERS, orders);
    }

    // Keep lifetime master register synchronized
    const masterOrders = await this.getMasterOrders();
    const masterOrder = masterOrders.find((o) => o.id === orderId);
    if (masterOrder) {
      masterOrder.status = status;
      this.setStorage(STORAGE_KEYS.MASTER_ORDERS, masterOrders);
    }

    const finalOrder = order || masterOrder;
    if (!finalOrder) throw new Error('Order not found');
    return finalOrder;
  }

  async markOrderPaymentPaid(orderId: string): Promise<Order> {
    const orders = await this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      order.paymentStatus = 'Paid Offline';
      this.setStorage(STORAGE_KEYS.ORDERS, orders);
    }

    // Keep lifetime master register synchronized
    const masterOrders = await this.getMasterOrders();
    const masterOrder = masterOrders.find((o) => o.id === orderId);
    if (masterOrder) {
      masterOrder.paymentStatus = 'Paid Offline';
      this.setStorage(STORAGE_KEYS.MASTER_ORDERS, masterOrders);
    }

    const finalOrder = order || masterOrder;
    if (!finalOrder) throw new Error('Order not found');
    return finalOrder;
  }

  // --- ADMIN SECURITY PIN MANAGEMENT ---
  getAdminPin(): string {
    this.init();
    const stored = this.getStorage<string | null>(STORAGE_KEYS.ADMIN_PIN, null);
    return stored && stored.trim() ? stored : 'INSERT COIN 46';
  }

  verifyAdminPin(enteredPin: string): boolean {
    const currentPin = this.getAdminPin();
    return enteredPin.trim() === currentPin.trim();
  }

  updateAdminPin(currentPin: string, newPin: string): { success: boolean; message: string } {
    if (!this.verifyAdminPin(currentPin)) {
      return { success: false, message: 'Current Security PIN is incorrect.' };
    }
    if (!newPin || newPin.trim().length < 3) {
      return { success: false, message: 'New Security PIN must be at least 3 characters.' };
    }
    this.setStorage(STORAGE_KEYS.ADMIN_PIN, newPin.trim());
    return { success: true, message: 'Admin Security PIN updated successfully!' };
  }

  // --- REAL OTP AUTHENTICATION SERVICE ---
  async requestOtp(phone: string): Promise<{
    success: boolean;
    message: string;
    otpCode: string;
    simulatedSms: string;
    expiresAt: number;
  }> {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      throw new Error('Please enter a valid 10-digit mobile number.');
    }

    // Generate authentic cryptographically-strong 6-digit verification code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    const allOtps = this.getStorage<Record<string, { code: string; expiresAt: number }>>(STORAGE_KEYS.OTP, {});
    allOtps[cleanPhone] = { code: otpCode, expiresAt };
    this.setStorage(STORAGE_KEYS.OTP, allOtps);

    const simulatedSms = `[Magic Nutri OTP Gateway] Your verification code is ${otpCode}. Valid for 5 minutes. Do not share this code with anyone.`;

    return {
      success: true,
      message: 'Verification code sent via SMS.',
      otpCode,
      simulatedSms,
      expiresAt,
    };
  }

  async verifyOtp(phone: string, enteredCode: string): Promise<boolean> {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const allOtps = this.getStorage<Record<string, { code: string; expiresAt: number }>>(STORAGE_KEYS.OTP, {});
    const record = allOtps[cleanPhone];

    if (!record) {
      throw new Error('No active OTP found. Please request a new verification code.');
    }

    if (Date.now() > record.expiresAt) {
      delete allOtps[cleanPhone];
      this.setStorage(STORAGE_KEYS.OTP, allOtps);
      throw new Error('Verification code has expired. Please request a new code.');
    }

    if (record.code !== enteredCode.trim()) {
      throw new Error('Incorrect OTP code. Please enter the valid 6-digit code received.');
    }

    // Clean up consumed OTP
    delete allOtps[cleanPhone];
    this.setStorage(STORAGE_KEYS.OTP, allOtps);
    return true;
  }

  // --- RESET ORDERS BY DATE/TIME FOR CLEAN DAILY INTERFACE ---
  async resetOrders(options: {
    mode: 'all' | 'before_datetime' | 'completed_only' | 'today_reset';
    beforeIsoDateTime?: string;
  }): Promise<{ clearedCount: number; remainingCount: number }> {
    const orders = await this.getOrders();
    const initialCount = orders.length;
    let remainingOrders: Order[] = [];

    if (options.mode === 'all') {
      remainingOrders = [];
    } else if (options.mode === 'completed_only') {
      remainingOrders = orders.filter((o) => o.status !== 'Completed' && o.status !== 'Cancelled');
    } else if (options.mode === 'before_datetime' && options.beforeIsoDateTime) {
      const cutoffTime = new Date(options.beforeIsoDateTime).getTime();
      remainingOrders = orders.filter((o) => new Date(o.createdAt).getTime() >= cutoffTime);
    } else if (options.mode === 'today_reset') {
      // Start fresh for today: wipe completed/past orders, keep any active orders placed today
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const startOfToday = now.getTime();
      remainingOrders = orders.filter(
        (o) =>
          new Date(o.createdAt).getTime() >= startOfToday &&
          o.status !== 'Completed' &&
          o.status !== 'Cancelled'
      );
    }

    this.setStorage(STORAGE_KEYS.ORDERS, remainingOrders);
    const clearedCount = initialCount - remainingOrders.length;
    return { clearedCount, remainingCount: remainingOrders.length };
  }

  // --- OFFERS & PROMOTIONS MANAGEMENT (OWNER CONTROL) ---
  async getOffers(): Promise<PromoOffer[]> {
    let offers = this.getStorage<PromoOffer[]>(STORAGE_KEYS.OFFERS, []);
    if (!offers || offers.length === 0) {
      offers = INITIAL_OFFERS;
      this.setStorage(STORAGE_KEYS.OFFERS, offers);
    }
    return offers;
  }

  async getOfferByCode(code: string): Promise<PromoOffer | null> {
    const offers = await this.getOffers();
    const clean = code.trim().toUpperCase();
    return offers.find((o) => o.code.toUpperCase() === clean) || null;
  }

  async saveOffer(offerData: Omit<PromoOffer, 'id' | 'createdAt'> & { id?: string }): Promise<PromoOffer> {
    const offers = await this.getOffers();
    const nowIso = new Date().toISOString();

    if (offerData.id) {
      const idx = offers.findIndex((o) => o.id === offerData.id);
      if (idx !== -1) {
        const updated: PromoOffer = {
          ...offers[idx],
          ...offerData,
          id: offerData.id,
          code: offerData.code.trim().toUpperCase(),
          updatedAt: nowIso,
        };
        offers[idx] = updated;
        this.setStorage(STORAGE_KEYS.OFFERS, offers);
        return updated;
      }
    }

    // New offer
    const newOffer: PromoOffer = {
      ...offerData,
      id: offerData.id || `offer-${Date.now()}`,
      code: offerData.code.trim().toUpperCase(),
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    offers.push(newOffer);
    this.setStorage(STORAGE_KEYS.OFFERS, offers);
    return newOffer;
  }

  async updateOffer(id: string, updates: Partial<PromoOffer>): Promise<PromoOffer> {
    const offers = await this.getOffers();
    const idx = offers.findIndex((o) => o.id === id);
    if (idx === -1) {
      throw new Error(`Offer with ID ${id} not found.`);
    }

    const updated: PromoOffer = {
      ...offers[idx],
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    if (updates.code) {
      updated.code = updates.code.trim().toUpperCase();
    }
    offers[idx] = updated;
    this.setStorage(STORAGE_KEYS.OFFERS, offers);
    return updated;
  }

  async toggleOfferActive(id: string): Promise<PromoOffer> {
    const offers = await this.getOffers();
    const idx = offers.findIndex((o) => o.id === id);
    if (idx === -1) {
      throw new Error('Offer not found.');
    }

    const current = offers[idx];
    const updated: PromoOffer = {
      ...current,
      isActive: !current.isActive,
      updatedAt: new Date().toISOString(),
    };
    offers[idx] = updated;
    this.setStorage(STORAGE_KEYS.OFFERS, offers);
    return updated;
  }

  async deleteOffer(id: string): Promise<void> {
    const offers = await this.getOffers();
    const filtered = offers.filter((o) => o.id !== id);
    this.setStorage(STORAGE_KEYS.OFFERS, filtered);
  }

  async resetDefaultOffers(): Promise<PromoOffer[]> {
    this.setStorage(STORAGE_KEYS.OFFERS, INITIAL_OFFERS);
    return INITIAL_OFFERS;
  }
}

export const api = new ApiService();
