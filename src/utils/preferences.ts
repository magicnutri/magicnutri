import { PromoOffer } from '../types';
export type { PromoOffer };

export interface UserNotificationPreferences {
  orderStatusAlerts: boolean;
  scratchAlerts: boolean;
  morningOffers: boolean;
  soundEnabled: boolean;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'scratch' | 'offer' | 'system';
  timestamp: string;
  read: boolean;
  tag?: string;
}

const PREF_KEY = 'magic_nutri_notification_prefs_v1';
const NOTIFS_KEY = 'magic_nutri_notifications_inbox_v1';

export const INITIAL_OFFERS: PromoOffer[] = [
  {
    id: 'offer-1',
    code: 'WELCOME40',
    title: 'New Member Welcome Bonus',
    description: 'Get 40 Loyalty Points instantly upon mobile OTP verification.',
    discountType: 'points',
    value: '40 PTS (₹2.00 OFF)',
    badge: 'Instant Bonus',
    isActive: true,
    scheduleType: 'always',
    terms: 'Valid on your first login on Magic Nutri.'
  },
  {
    id: 'offer-2',
    code: 'MAGICDIET10',
    title: '10% Off Healthy Diet Bowls',
    description: 'Enjoy 10% off on all artisan Oats and Chia bowls for breakfast.',
    discountType: 'percentage',
    value: '10% OFF',
    badge: 'Diet Saver',
    isActive: true,
    scheduleType: 'hours',
    validHoursStart: '07:00',
    validHoursEnd: '11:00',
    validHours: '7:00 AM – 11:00 AM',
    terms: 'Applicable at Godda & Dumka store counter during morning hours.'
  },
  {
    id: 'offer-3',
    code: 'HEALTHYCHIA',
    title: 'Free Chia & Basil Booster',
    description: 'Add free soaked chia seeds or basil seeds to any smoothie or diet bowl.',
    discountType: 'free_item',
    value: 'FREE TOPPING',
    badge: 'Superfood Gift',
    isActive: true,
    scheduleType: 'always',
    terms: 'Mention at counter when placing or picking up order.'
  },
  {
    id: 'offer-4',
    code: 'LUCKY100',
    title: '100th Order Milestone Jackpot',
    description: 'Every placed order enters the active store draw to win 100% Free Diet Meal.',
    discountType: 'draw',
    value: '100% FREE MEAL',
    badge: 'Store Draw',
    isActive: true,
    scheduleType: 'always',
    terms: 'Winner selected live when store hits 100 orders.'
  },
  {
    id: 'offer-5',
    code: 'WEEKEND50',
    title: 'Weekend Protein Shake Special',
    description: 'Flat ₹20 off on cold-pressed protein milkshakes on weekends.',
    discountType: 'flat_rupees',
    value: '₹20 OFF',
    badge: 'Weekend Boost',
    isActive: false, // Turned off initially by store owner
    scheduleType: 'always',
    terms: 'Valid on Saturdays & Sundays at Godda & Dumka counter.'
  }
];

export function checkOfferActiveStatus(offer: PromoOffer): {
  isLive: boolean;
  statusLabel: string;
  badgeColor: 'emerald' | 'amber' | 'stone' | 'red';
} {
  if (!offer.isActive) {
    return {
      isLive: false,
      statusLabel: 'Turned OFF by Store Owner',
      badgeColor: 'stone'
    };
  }

  const now = new Date();

  if (offer.scheduleType === 'hours') {
    if (offer.validHoursStart && offer.validHoursEnd) {
      const [startH, startM] = offer.validHoursStart.split(':').map(Number);
      const [endH, endM] = offer.validHoursEnd.split(':').map(Number);
      const curM = now.getHours() * 60 + now.getMinutes();
      const sM = startH * 60 + (startM || 0);
      const eM = endH * 60 + (endM || 0);

      if (curM < sM || curM > eM) {
        return {
          isLive: false,
          statusLabel: `Outside Scheduled Hours (${offer.validHoursStart} - ${offer.validHoursEnd})`,
          badgeColor: 'amber'
        };
      }
    }
  }

  if (offer.scheduleType === 'date_range') {
    if (offer.startDate) {
      const start = new Date(offer.startDate);
      start.setHours(0, 0, 0, 0);
      if (now < start) {
        return {
          isLive: false,
          statusLabel: `Starts on ${offer.startDate}`,
          badgeColor: 'amber'
        };
      }
    }
    if (offer.endDate) {
      const end = new Date(offer.endDate);
      end.setHours(23, 59, 59, 999);
      if (now > end) {
        return {
          isLive: false,
          statusLabel: `Expired on ${offer.endDate}`,
          badgeColor: 'red'
        };
      }
    }
  }

  return {
    isLive: true,
    statusLabel: 'Active & Available Now',
    badgeColor: 'emerald'
  };
}

const DEFAULT_PREFS: UserNotificationPreferences = {
  orderStatusAlerts: true,
  scratchAlerts: true,
  morningOffers: true,
  soundEnabled: true,
};

const DEFAULT_NOTIFS: InAppNotification[] = [
  {
    id: 'notif-1',
    title: 'Welcome to Magic Nutri Diet Snacks!',
    message: 'Explore our nutritious menu in Godda & Dumka, JH. Every order wins digital scratch rewards!',
    type: 'system',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
    tag: 'Welcome'
  },
  {
    id: 'notif-2',
    title: 'Healthy Breakfast Hours are Live',
    message: 'Store is open 7:00 AM – 11:00 AM. Warm oats bowls & protein sandwiches freshly prepped.',
    type: 'offer',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    read: false,
    tag: 'Daily Fresh'
  },
  {
    id: 'notif-3',
    title: 'Scratch & Win with Every Order',
    message: 'Earn 20 to 50 loyalty points on every meal! 20 points = ₹1 off at the counter.',
    type: 'scratch',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: true,
    tag: 'Rewards'
  }
];

export function getStoredPreferences(): UserNotificationPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return DEFAULT_PREFS;
}

export function saveStoredPreferences(prefs: UserNotificationPreferences): void {
  try {
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export function getStoredNotifications(): InAppNotification[] {
  if (typeof window === 'undefined') return DEFAULT_NOTIFS;
  try {
    const raw = localStorage.getItem(NOTIFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return DEFAULT_NOTIFS;
}

export function saveStoredNotifications(list: InAppNotification[]): void {
  try {
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}
