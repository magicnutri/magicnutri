import React, { useEffect, useState } from 'react';
import { CustomerProfile, Order, RewardTransaction, ScratchCard } from '../types';
import { api } from '../services/api';
import { MagicNutriLogo } from './MagicNutriLogo';
import { soundManager } from '../utils/sound';
import {
  ThemeMode,
  getStoredTheme,
  applyTheme,
} from '../utils/theme';
import {
  PromoOffer,
  INITIAL_OFFERS,
  UserNotificationPreferences,
  InAppNotification,
  getStoredPreferences,
  saveStoredPreferences,
  getStoredNotifications,
  saveStoredNotifications,
  checkOfferActiveStatus
} from '../utils/preferences';
import {
  X,
  Trophy,
  Clock,
  Sparkles,
  LogOut,
  Package,
  ChevronRight,
  CheckCircle2,
  Utensils,
  BellRing,
  RotateCcw,
  Check,
  ShoppingBag,
  Store,
  MapPin,
  Flame,
  ShieldCheck,
  Moon,
  Sun,
  Laptop,
  Tag,
  Volume2,
  VolumeX,
  Bell,
  User,
  Settings as SettingsIcon,
  Copy,
  Edit2,
  Save,
  AlertTriangle,
  Gift
} from 'lucide-react';

export type SettingsDrawerTab =
  | 'account'
  | 'orders'
  | 'rewards'
  | 'offers'
  | 'notifications'
  | 'appearance'
  | 'logout';

interface CustomerAccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CustomerProfile | null;
  onLogout: () => void;
  onOpenScratchCard: (card: ScratchCard) => void;
  onReorder?: (items: { productId: string; quantity: number }[]) => void;
  onOpenAuth?: () => void;
  initialTab?: SettingsDrawerTab;
  onProfileUpdated?: (updated: CustomerProfile) => void;
}

export const CustomerAccountDrawer: React.FC<CustomerAccountDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  onLogout,
  onOpenScratchCard,
  onReorder,
  onOpenAuth,
  initialTab = 'orders',
  onProfileUpdated,
}) => {
  const [tab, setTab] = useState<SettingsDrawerTab>(profile ? initialTab : 'appearance');
  const [orderSubTab, setOrderSubTab] = useState<'active' | 'past'>('active');
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Edit Account state
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.name || '');
  const [nameSaveMsg, setNameSaveMsg] = useState('');

  // Logout confirmation modal state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Offers state
  const [storeOffers, setStoreOffers] = useState<PromoOffer[]>(INITIAL_OFFERS);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Notification prefs state
  const [notifPrefs, setNotifPrefs] = useState<UserNotificationPreferences>(getStoredPreferences);
  const [notifications, setNotifications] = useState<InAppNotification[]>(getStoredNotifications);

  // Theme mode state
  const [themeMode, setThemeMode] = useState<ThemeMode>(getStoredTheme);

  // Sync initial tab when opened
  useEffect(() => {
    if (isOpen) {
      if (profile) {
        setTab(initialTab || 'orders');
        setNameInput(profile.name);
      } else {
        setTab('appearance');
      }
      setThemeMode(getStoredTheme());
      setNotifPrefs(getStoredPreferences());
      setNotifications(getStoredNotifications());
      api.getOffers().then(setStoreOffers).catch(() => {});
      loadUserData();
    }
  }, [isOpen, profile?.phone, initialTab]);

  const loadUserData = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const [userOrders, userTx] = await Promise.all([
        api.getCustomerOrders(profile.phone),
        api.getCustomerTransactions(profile.phone),
      ]);
      setOrders(userOrders);
      setTransactions(userTx);

      const hasActive = userOrders.some(
        (o) => o.status !== 'Completed' && o.status !== 'Cancelled'
      );
      if (hasActive) {
        setOrderSubTab('active');
      } else if (userOrders.length > 0) {
        setOrderSubTab('past');
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !nameInput.trim()) return;
    try {
      const updated = await api.updateCustomerProfile(profile.phone, {
        name: nameInput.trim(),
      });
      setIsEditingName(false);
      setNameSaveMsg('Name updated successfully!');
      if (onProfileUpdated) onProfileUpdated(updated);
      setTimeout(() => setNameSaveMsg(''), 2500);
    } catch {
      setNameSaveMsg('Failed to update name');
      setTimeout(() => setNameSaveMsg(''), 2500);
    }
  };

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    applyTheme(mode);
  };

  const handleTogglePref = (key: keyof UserNotificationPreferences) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    saveStoredPreferences(updated);

    if (key === 'soundEnabled') {
      soundManager.setMuted(!updated.soundEnabled);
      if (updated.soundEnabled) {
        soundManager.playOrderSuccess();
      }
    }
  };

  const handleMarkAllNotifsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const handleCopyOffer = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    soundManager.playScratch();
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleClaimCard = async (orderId: string) => {
    try {
      const card = await api.getScratchCardByOrder(orderId);
      if (card) {
        onOpenScratchCard(card);
      }
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  const pointsRupeeValue = profile ? (profile.totalPointsBalance / 20).toFixed(2) : '0.00';
  const activeOrders = orders.filter((o) => o.status !== 'Completed' && o.status !== 'Cancelled');
  const pastOrders = orders.filter((o) => o.status === 'Completed' || o.status === 'Cancelled');
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const getStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'Order Received':
        return 0;
      case 'Accepted':
        return 1;
      case 'Preparing':
        return 2;
      case 'Ready for Pickup':
        return 3;
      case 'Completed':
        return 4;
      default:
        return 0;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg h-full bg-[#FFFDF9] dark:bg-[#181311] text-[#2C1810] dark:text-[#F3EDE8] flex flex-col shadow-2xl overflow-hidden transition-colors duration-200">
        
        {/* Top Header */}
        <div className="p-4 border-b border-stone-200/80 dark:border-stone-800 bg-[#FFF7E8] dark:bg-[#201814] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <MagicNutriLogo variant="icon" className="w-9 h-9" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-[#4A2414] dark:text-[#FFA756] font-display">
                  {profile ? profile.name : 'Magic Nutri Settings'}
                </h3>
                {profile && (
                  <span className="text-[10px] bg-[#2E7D32]/10 dark:bg-[#2E7D32]/30 text-[#2E7D32] dark:text-[#81C784] border border-[#2E7D32]/20 font-bold px-1.5 py-0.2 rounded-full">
                    OTP Verified
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 font-mono">
                {profile ? `+91 ${profile.phone}` : 'App Preferences & Menu Offers'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Theme Toggle */}
            <button
              onClick={() => handleThemeChange(themeMode === 'dark' ? 'light' : 'dark')}
              title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} mode`}
              className="p-2 text-stone-600 dark:text-stone-300 hover:text-[#F47B16] hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
            >
              {themeMode === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-stone-600" />
              )}
            </button>

            {/* Logout shortcut if logged in */}
            {profile && (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                title="Log out"
                className="p-2 text-stone-500 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loyalty Balance Header Strip (if logged in) */}
        {profile && (
          <div className="p-4 bg-gradient-to-br from-[#4A2414] via-[#35190D] to-[#201008] text-white shrink-0 border-b border-amber-950/40 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#FFD700]" />
                <span className="text-xs uppercase tracking-wider text-amber-200 font-bold">
                  Nutri Loyalty Balance
                </span>
              </div>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-amber-100 font-mono">
                20 pts = ₹1.00 Off
              </span>
            </div>

            <div className="mt-2.5 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black tracking-tight text-white font-mono">
                  {profile.totalPointsBalance}
                </span>
                <span className="text-xs text-amber-200 ml-1.5 font-semibold">Points</span>
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-[#FFD700]">
                  ≈ ₹{pointsRupeeValue} OFF
                </div>
                <span className="text-[10px] text-white/70">Redeemable at Checkout</span>
              </div>
            </div>
          </div>
        )}

        {/* Guest Banner if not logged in */}
        {!profile && (
          <div className="p-4 bg-gradient-to-r from-[#F47B16]/10 to-amber-50 dark:from-[#F47B16]/20 dark:to-stone-900 border-b border-[#F47B16]/20 flex items-center justify-between shrink-0">
            <div>
              <p className="text-xs font-bold text-[#4A2414] dark:text-[#FFA756]">
                You are browsing as Guest
              </p>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                Log in with your phone to get 40 welcome points & live order path.
              </p>
            </div>
            {onOpenAuth && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="px-3 py-1.5 bg-[#F47B16] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#e06d0f] transition-all whitespace-nowrap ml-2"
              >
                Log In / Register
              </button>
            )}
          </div>
        )}

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-[#1C1613] overflow-x-auto no-scrollbar shrink-0">
          {profile && (
            <>
              <button
                onClick={() => setTab('account')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  tab === 'account'
                    ? 'bg-[#4A2414] text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Account</span>
              </button>

              <button
                onClick={() => setTab('orders')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  tab === 'orders'
                    ? 'bg-[#4A2414] text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Orders</span>
                {activeOrders.length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                    {activeOrders.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setTab('rewards')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  tab === 'rewards'
                    ? 'bg-[#4A2414] text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Reward Points</span>
              </button>
            </>
          )}

          <button
            onClick={() => setTab('offers')}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              tab === 'offers'
                ? 'bg-[#4A2414] text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-[#F47B16]" />
            <span>Offers</span>
          </button>

          <button
            onClick={() => setTab('notifications')}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              tab === 'notifications'
                ? 'bg-[#4A2414] text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alerts</span>
            {unreadNotifsCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab('appearance')}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              tab === 'appearance'
                ? 'bg-[#4A2414] text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Theme</span>
          </button>

          {profile && (
            <button
              onClick={() => setTab('logout')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                tab === 'logout'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-stone-500 hover:text-red-600 dark:text-stone-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          )}
        </div>

        {/* Body Content by Tab */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* ========================================================= */}
          {/* 1. ACCOUNT TAB */}
          {/* ========================================================= */}
          {tab === 'account' && profile && (
            <div className="space-y-4 animate-fadeIn">
              {/* Profile Card */}
              <div className="p-4 bg-white dark:bg-[#1E1815] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F47B16] to-[#4A2414] flex items-center justify-center text-white font-black text-xl shadow-xs">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-[#4A2414] dark:text-[#FFA756]">
                        {profile.name}
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                        +91 {profile.phone}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#2E7D32] dark:text-[#81C784] font-bold mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Mobile OTP Member
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsEditingName(!isEditingName)}
                    className="p-1.5 text-stone-500 dark:text-stone-400 hover:text-[#F47B16] hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{isEditingName ? 'Cancel' : 'Edit'}</span>
                  </button>
                </div>

                {/* Edit Name Form */}
                {isEditingName && (
                  <form onSubmit={handleSaveName} className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2">
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                      Update Display Name
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#F47B16]"
                        placeholder="Enter full name"
                        required
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-[#4A2414] hover:bg-[#35190D] text-white rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    </div>
                  </form>
                )}

                {nameSaveMsg && (
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-lg text-center font-bold">
                    {nameSaveMsg}
                  </div>
                )}

                {/* Membership stats */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-center">
                  <div className="p-2 bg-stone-50 dark:bg-stone-900/60 rounded-xl">
                    <span className="block text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase">
                      Tier
                    </span>
                    <span className="text-xs font-black text-[#F47B16]">
                      Gold Nutri
                    </span>
                  </div>
                  <div className="p-2 bg-stone-50 dark:bg-stone-900/60 rounded-xl">
                    <span className="block text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase">
                      Total Orders
                    </span>
                    <span className="text-xs font-black text-stone-800 dark:text-stone-200">
                      {orders.length}
                    </span>
                  </div>
                  <div className="p-2 bg-stone-50 dark:bg-stone-900/60 rounded-xl">
                    <span className="block text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase">
                      Points
                    </span>
                    <span className="text-xs font-black text-[#2E7D32] dark:text-[#81C784]">
                      {profile.totalPointsBalance}
                    </span>
                  </div>
                </div>
              </div>

              {/* Store & Location Details */}
              <div className="p-4 bg-white dark:bg-[#1E1815] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-[#F47B16]" />
                  <span>Favorite Store Location</span>
                </h5>
                <div className="text-xs text-stone-700 dark:text-stone-300 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#F47B16] shrink-0 mt-0.5" />
                    <span>Godda & Dumka, Jharkhand, India</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#2E7D32] shrink-0" />
                    <span>Morning Diet Hours: 7:00 AM – 11:00 AM Daily</span>
                  </div>
                </div>
              </div>

              {/* Security info & Logout button */}
              <div className="p-4 bg-white dark:bg-[#1E1815] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
                  <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
                  <span>Your account is secured with real SMS OTP login.</span>
                </div>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full py-2.5 px-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out from Account</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. ORDERS TAB */}
          {/* ========================================================= */}
          {tab === 'orders' && profile && (
            <div className="space-y-4 animate-fadeIn">
              {/* Order Sub-tabs: Current vs Past */}
              <div className="flex p-1 bg-stone-100 dark:bg-stone-900 rounded-xl">
                <button
                  onClick={() => setOrderSubTab('active')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    orderSubTab === 'active'
                      ? 'bg-white dark:bg-[#1E1815] text-[#4A2414] dark:text-[#FFA756] shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${activeOrders.length > 0 ? 'bg-emerald-500 animate-ping' : 'bg-stone-300 dark:bg-stone-700'}`} />
                  <span>Current Active ({activeOrders.length})</span>
                </button>
                <button
                  onClick={() => setOrderSubTab('past')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    orderSubTab === 'past'
                      ? 'bg-white dark:bg-[#1E1815] text-[#4A2414] dark:text-[#FFA756] shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>Past Orders ({pastOrders.length})</span>
                </button>
              </div>

              {/* ACTIVE ORDERS PATH TRACKER */}
              {orderSubTab === 'active' && (
                activeOrders.length === 0 ? (
                  <div className="text-center py-10 bg-white dark:bg-[#1E1815] rounded-2xl border border-stone-200 dark:border-stone-800 p-6">
                    <Package className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-700 mb-2" />
                    <h4 className="text-sm font-bold text-[#4A2414] dark:text-[#FFA756]">
                      No active orders right now
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs mx-auto">
                      Explore our fresh breakfast bowls and sandwiches to watch their live preparation path!
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-4 px-4 py-2 bg-[#F47B16] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#e06d0f] transition-all"
                    >
                      Browse Diet Menu
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeOrders.map((order) => {
                      const stepIdx = getStepIndex(order.status);
                      const steps = [
                        { label: 'Received', icon: Check, desc: 'Order placed' },
                        { label: 'Kitchen Prep', icon: Flame, desc: 'Fresh prep' },
                        { label: 'Ready', icon: BellRing, desc: 'At Counter' },
                        { label: 'Enjoy', icon: Utensils, desc: 'Completed' },
                      ];

                      return (
                        <div
                          key={order.id}
                          className="p-4 bg-white dark:bg-[#1E1815] rounded-2xl border-2 border-[#F47B16]/30 shadow-md space-y-4 relative overflow-hidden"
                        >
                          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold text-[#F47B16] font-mono bg-[#FFF7E8] dark:bg-stone-900 px-2 py-0.5 rounded border border-[#F47B16]/20">
                                  #{order.id}
                                </span>
                                <span className="text-[11px] text-stone-400 font-mono">
                                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <span className="text-xs text-stone-600 dark:text-stone-300 font-medium mt-1 inline-block">
                                {order.orderType === 'dine-in' ? `Dine-in (${order.tableNumber || 'Table'})` : 'Takeaway Counter Pickup'}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#2E7D32]/10 dark:bg-[#2E7D32]/30 text-[#2E7D32] dark:text-[#81C784] border border-[#2E7D32]/20 inline-block animate-pulse">
                                {order.status}
                              </span>
                              <span className="block text-[10px] text-stone-400 mt-0.5">
                                Pay at Counter (Offline)
                              </span>
                            </div>
                          </div>

                          {/* LIVE ORDER PATH STEPPER */}
                          <div className="py-2 px-1">
                            <div className="flex items-center justify-between relative">
                              <div className="absolute left-4 right-4 top-4 h-1 bg-stone-200 dark:bg-stone-800 -z-0" />
                              <div
                                className="absolute left-4 top-4 h-1 bg-[#2E7D32] transition-all duration-500 -z-0"
                                style={{ width: `${Math.min(100, (stepIdx / (steps.length - 1)) * 100)}%` }}
                              />

                              {steps.map((st, sIdx) => {
                                const IconComp = st.icon;
                                const isPassed = sIdx <= stepIdx;
                                const isCurrent = sIdx === stepIdx;

                                return (
                                  <div key={sIdx} className="flex flex-col items-center z-10">
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                        isPassed
                                          ? 'bg-[#2E7D32] text-white shadow-xs'
                                          : 'bg-white dark:bg-stone-800 text-stone-400 border-2 border-stone-200 dark:border-stone-700'
                                      } ${isCurrent ? 'ring-4 ring-[#2E7D32]/20 scale-110' : ''}`}
                                    >
                                      <IconComp className="w-4 h-4" />
                                    </div>
                                    <span
                                      className={`text-[10px] mt-1.5 font-bold ${
                                        isCurrent ? 'text-[#2E7D32] dark:text-[#81C784]' : isPassed ? 'text-stone-700 dark:text-stone-300' : 'text-stone-400'
                                      }`}
                                    >
                                      {st.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Order items itemized list */}
                          <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl space-y-1.5 text-xs">
                            <span className="text-[10px] font-bold uppercase text-stone-400 block tracking-wider">
                              Order Items
                            </span>
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-stone-700 dark:text-stone-300">
                                <span>{item.quantity}x {item.name}</span>
                                <span className="font-mono font-semibold">₹{item.price * item.quantity}</span>
                              </div>
                            ))}

                            {order.pointsDiscount > 0 && (
                              <div className="flex justify-between text-[#2E7D32] dark:text-[#81C784] font-semibold pt-1 border-t border-stone-200 dark:border-stone-800 text-xs">
                                <span>Points Discount Applied</span>
                                <span className="font-mono">-₹{order.pointsDiscount.toFixed(2)}</span>
                              </div>
                            )}

                            <div className="flex justify-between font-bold text-[#4A2414] dark:text-[#FFA756] pt-1.5 border-t border-stone-200 dark:border-stone-800 text-sm">
                              <span>Total to Pay at Counter</span>
                              <span className="font-mono text-[#2E7D32] dark:text-[#81C784] text-base font-black">
                                ₹{order.totalAmount}
                              </span>
                            </div>
                          </div>

                          {/* Scratch Card CTA */}
                          {order.scratchCardIssued && (
                            <button
                              onClick={() => handleClaimCard(order.id)}
                              className="w-full py-2.5 px-3 text-xs font-bold text-white bg-gradient-to-r from-[#F47B16] to-[#D96800] hover:brightness-105 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98"
                            >
                              <Sparkles className="w-4 h-4 text-[#FFD700]" />
                              <span>Scratch Digital Rewards Card (20-50 pts)</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {/* PAST ORDERS LIST */}
              {orderSubTab === 'past' && (
                pastOrders.length === 0 ? (
                  <div className="text-center py-10 bg-white dark:bg-[#1E1815] rounded-2xl border border-stone-200 dark:border-stone-800 p-6">
                    <Clock className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-700 mb-2" />
                    <h4 className="text-sm font-bold text-[#4A2414] dark:text-[#FFA756]">
                      No completed past orders yet
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      Your completed dining orders and receipts will show up here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pastOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-3.5 bg-white dark:bg-[#1E1815] rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-[#4A2414] dark:text-[#FFA756] font-mono">
                              #{order.id}
                            </span>
                            <span className="text-[11px] text-stone-400 ml-2">
                              {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              order.status === 'Completed'
                                ? 'bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300'
                                : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>

                        <div className="text-xs text-stone-600 dark:text-stone-300 space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>{item.quantity}x {item.name}</span>
                              <span className="font-mono text-stone-700 dark:text-stone-300">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                          <span className="text-stone-500 dark:text-stone-400">
                            {order.orderType === 'dine-in' ? `Dine-in (${order.tableNumber || 'Table'})` : 'Takeaway Pickup'}
                          </span>
                          <span className="font-black text-[#4A2414] dark:text-[#FFA756] font-mono text-sm">
                            Total: ₹{order.totalAmount}
                          </span>
                        </div>

                        {onReorder && (
                          <button
                            onClick={() => {
                              onReorder(order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })));
                              onClose();
                            }}
                            className="w-full mt-1 py-1.5 text-xs font-bold text-[#F47B16] bg-[#FFF7E8] dark:bg-stone-900 border border-[#F47B16]/30 hover:bg-[#FCE8D5] dark:hover:bg-stone-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Repeat This Order</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. REWARD POINTS TAB */}
          {/* ========================================================= */}
          {tab === 'rewards' && profile && (
            <div className="space-y-4 animate-fadeIn">
              {/* How it works banner */}
              <div className="p-4 bg-gradient-to-r from-amber-500/10 to-[#F47B16]/10 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl border border-amber-500/30 p-4 space-y-2">
                <h4 className="text-xs font-extrabold text-[#4A2414] dark:text-[#FFA756] uppercase tracking-wider flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-[#F47B16]" />
                  <span>How Magic Nutri Rewards Work</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-stone-700 dark:text-stone-300">
                  <div className="p-2.5 bg-white/80 dark:bg-stone-900/80 rounded-xl border border-stone-200 dark:border-stone-800">
                    <span className="font-bold text-[#2E7D32] dark:text-[#81C784] block">
                      1. Earn On Every Order
                    </span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">
                      Get a scratch card with 20 to 50 points on every purchase.
                    </span>
                  </div>
                  <div className="p-2.5 bg-white/80 dark:bg-stone-900/80 rounded-xl border border-stone-200 dark:border-stone-800">
                    <span className="font-bold text-[#F47B16] block">
                      2. Cash Discount at Counter
                    </span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">
                      20 points = ₹1.00 cash off on your bill (100 pts = ₹5.00).
                    </span>
                  </div>
                </div>
              </div>

              {/* Transactions Ledger */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                    Points Activity Ledger
                  </h4>
                  <span className="text-[11px] text-stone-400">
                    {transactions.length} entries
                  </span>
                </div>

                {transactions.length === 0 ? (
                  <div className="text-center py-10 bg-white dark:bg-[#1E1815] rounded-xl border border-stone-200 dark:border-stone-800 text-stone-500">
                    <Clock className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-700 mb-1" />
                    <p className="text-xs font-medium">No points transactions recorded yet</p>
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 bg-white dark:bg-[#1E1815] rounded-xl border border-stone-200 dark:border-stone-800 flex items-center justify-between shadow-2xs"
                    >
                      <div>
                        <p className="text-xs font-bold text-[#4A2414] dark:text-[#FFA756]">
                          {tx.description}
                        </p>
                        <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                          {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs font-black font-mono ${
                            tx.points > 0 ? 'text-[#2E7D32] dark:text-[#81C784]' : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {tx.points > 0 ? `+${tx.points}` : tx.points} pts
                        </span>
                        <p className="text-[10px] text-stone-400 font-mono">
                          Bal: {tx.balanceAfter}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. OFFERS & COUPONS TAB */}
          {/* ========================================================= */}
          {tab === 'offers' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Active Offers & Promo Codes
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Apply at checkout or mention at the Godda & Dumka counter.
                  </p>
                </div>
                <span className="text-[10px] bg-[#F47B16]/10 text-[#F47B16] font-bold px-2 py-0.5 rounded-full">
                  {storeOffers.filter((o) => o.isActive).length} Active for Customers
                </span>
              </div>

              <div className="space-y-3">
                {storeOffers.map((offer) => {
                  const statusInfo = checkOfferActiveStatus(offer);

                  return (
                    <div
                      key={offer.id || offer.code}
                      className={`p-4 bg-white dark:bg-[#1E1815] rounded-2xl border shadow-sm space-y-3 relative overflow-hidden transition-all ${
                        offer.isActive
                          ? statusInfo.isLive
                            ? 'border-emerald-300 dark:border-emerald-900/60 ring-1 ring-emerald-500/10'
                            : 'border-amber-300 dark:border-amber-900/60'
                          : 'border-stone-200 dark:border-stone-800 opacity-60 bg-stone-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-black uppercase bg-[#F47B16]/10 text-[#F47B16] px-2 py-0.5 rounded-full">
                              {offer.badge || 'Offer'}
                            </span>

                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                offer.isActive
                                  ? statusInfo.isLive
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                  : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  offer.isActive
                                    ? statusInfo.isLive
                                      ? 'bg-emerald-500 animate-pulse'
                                      : 'bg-amber-500'
                                    : 'bg-stone-400'
                                }`}
                              />
                              <span>
                                {offer.isActive
                                  ? statusInfo.isLive
                                    ? 'Available Now'
                                    : statusInfo.statusLabel
                                  : 'Currently Paused by Owner'}
                              </span>
                            </span>

                            {offer.validHours && (
                              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                                {offer.validHours}
                              </span>
                            )}
                          </div>

                          <h5 className="text-sm font-bold text-[#4A2414] dark:text-[#FFA756] mt-1.5">
                            {offer.title}
                          </h5>
                          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                            {offer.description}
                          </p>
                        </div>

                        <span className="text-xs font-black text-[#2E7D32] dark:text-[#81C784] font-mono shrink-0">
                          {offer.value}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                        <span className="text-[10px] text-stone-400 max-w-[200px] truncate">
                          {offer.terms}
                        </span>

                        <button
                          onClick={() => handleCopyOffer(offer.code)}
                          disabled={!offer.isActive}
                          className={`py-1.5 px-3 border text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 active:scale-95 ${
                            offer.isActive
                              ? 'bg-[#FFF7E8] dark:bg-stone-900 border-[#F47B16]/30 text-[#F47B16] hover:bg-[#FCE8D5] dark:hover:bg-stone-800'
                              : 'bg-stone-100 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-400 cursor-not-allowed'
                          }`}
                        >
                          {copiedCode === offer.code ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="font-mono">{offer.code}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. NOTIFICATIONS TAB */}
          {/* ========================================================= */}
          {tab === 'notifications' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Notification Preferences Toggles */}
              <div className="p-4 bg-white dark:bg-[#1E1815] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Notification & Audio Preferences
                </h4>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-900/60 transition-colors">
                    <div className="flex items-center gap-2.5">
                      {notifPrefs.soundEnabled ? (
                        <Volume2 className="w-4 h-4 text-[#2E7D32]" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-stone-400" />
                      )}
                      <div>
                        <span className="text-xs font-bold block text-stone-800 dark:text-stone-200">
                          Sound Effects & Chimes
                        </span>
                        <span className="text-[10px] text-stone-400 block">
                          Play celebration chime for scratch cards & orders
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTogglePref('soundEnabled')}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                        notifPrefs.soundEnabled ? 'bg-[#2E7D32]' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          notifPrefs.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-900/60 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <BellRing className="w-4 h-4 text-[#F47B16]" />
                      <div>
                        <span className="text-xs font-bold block text-stone-800 dark:text-stone-200">
                          Live Order Status Alerts
                        </span>
                        <span className="text-[10px] text-stone-400 block">
                          Alert when kitchen prepares & packs your bowl
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTogglePref('orderStatusAlerts')}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                        notifPrefs.orderStatusAlerts ? 'bg-[#F47B16]' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          notifPrefs.orderStatusAlerts ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-900/60 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <div>
                        <span className="text-xs font-bold block text-stone-800 dark:text-stone-200">
                          Digital Scratch Card Alerts
                        </span>
                        <span className="text-[10px] text-stone-400 block">
                          Notify when fresh scratch cards are unlocked
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTogglePref('scratchAlerts')}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                        notifPrefs.scratchAlerts ? 'bg-[#F47B16]' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          notifPrefs.scratchAlerts ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-900/60 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-[#2E7D32]" />
                      <div>
                        <span className="text-xs font-bold block text-stone-800 dark:text-stone-200">
                          Morning Diet Specials (7-11 AM)
                        </span>
                        <span className="text-[10px] text-stone-400 block">
                          Daily fresh diet notifications in Godda & Dumka
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTogglePref('morningOffers')}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                        notifPrefs.morningOffers ? 'bg-[#2E7D32]' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          notifPrefs.morningOffers ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notification Activity Feed */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Recent Activity Inbox
                  </h4>
                  {unreadNotifsCount > 0 && (
                    <button
                      onClick={handleMarkAllNotifsRead}
                      className="text-[11px] font-bold text-[#F47B16] hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border transition-all ${
                        n.read
                          ? 'bg-white dark:bg-[#1E1815] border-stone-200 dark:border-stone-800'
                          : 'bg-[#FFF7E8] dark:bg-amber-950/30 border-[#F47B16]/30 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-xs font-bold text-[#4A2414] dark:text-[#FFA756]">
                              {n.title}
                            </h5>
                            {!n.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#F47B16]" />
                            )}
                          </div>
                          <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                            {n.message}
                          </p>
                        </div>
                        <span className="text-[10px] text-stone-400 shrink-0 font-mono">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 6. APPEARANCE (DARK MODE / LIGHT MODE) TAB */}
          {/* ========================================================= */}
          {tab === 'appearance' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Theme Appearance & Display
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Choose your preferred look. Magic Nutri looks stunning in both light diet tones and dark obsidian.
                </p>
              </div>

              {/* Theme selector cards */}
              <div className="grid grid-cols-3 gap-3">
                {/* Light Mode */}
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all text-center ${
                    themeMode === 'light'
                      ? 'border-[#F47B16] bg-amber-50/60 dark:bg-amber-950/30 ring-2 ring-[#F47B16]/20'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1E1815] hover:border-stone-300'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-xs">
                    <Sun className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-extrabold text-[#4A2414] dark:text-stone-200">
                    Light Mode
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Warm diet beige
                  </span>
                  {themeMode === 'light' && (
                    <span className="text-[10px] bg-[#F47B16] text-white px-2 py-0.2 rounded-full font-bold">
                      Active
                    </span>
                  )}
                </button>

                {/* Dark Mode */}
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all text-center ${
                    themeMode === 'dark'
                      ? 'border-[#F47B16] bg-amber-50/60 dark:bg-amber-950/30 ring-2 ring-[#F47B16]/20'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1E1815] hover:border-stone-300'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center text-amber-400 shadow-xs">
                    <Moon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-extrabold text-[#4A2414] dark:text-stone-200">
                    Dark Mode
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Obsidian espresso
                  </span>
                  {themeMode === 'dark' && (
                    <span className="text-[10px] bg-[#F47B16] text-white px-2 py-0.2 rounded-full font-bold">
                      Active
                    </span>
                  )}
                </button>

                {/* System Mode */}
                <button
                  onClick={() => handleThemeChange('system')}
                  className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all text-center ${
                    themeMode === 'system'
                      ? 'border-[#F47B16] bg-amber-50/60 dark:bg-amber-950/30 ring-2 ring-[#F47B16]/20'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1E1815] hover:border-stone-300'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-200 shadow-xs">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-extrabold text-[#4A2414] dark:text-stone-200">
                    System
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Auto detect
                  </span>
                  {themeMode === 'system' && (
                    <span className="text-[10px] bg-[#F47B16] text-white px-2 py-0.2 rounded-full font-bold">
                      Active
                    </span>
                  )}
                </button>
              </div>

              {/* Theme Live Preview Box */}
              <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1E1815] shadow-xs space-y-2">
                <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">
                  Live Theme Preview
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F47B16]/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#F47B16]" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#4A2414] dark:text-[#FFA756]">
                      Magic Nutri Diet Snacks
                    </h5>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      High Protein & Clean Nutrition in Godda & Dumka
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 7. LOGOUT TAB */}
          {/* ========================================================= */}
          {tab === 'logout' && profile && (
            <div className="p-6 bg-white dark:bg-[#1E1815] rounded-2xl border border-stone-200 dark:border-stone-800 text-center space-y-4 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                <LogOut className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-[#4A2414] dark:text-[#FFA756]">
                  Log out of your account?
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
                  Your <strong className="text-stone-800 dark:text-stone-200">{profile.totalPointsBalance} loyalty points</strong> and active order tracking remain securely tied to <span className="font-mono text-stone-800 dark:text-stone-200">+91 {profile.phone}</span>. You can log back in anytime with an instant SMS OTP.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-center">
                <button
                  onClick={() => setTab('account')}
                  className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                >
                  Stay Logged In
                </button>
                <button
                  onClick={onLogout}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Confirm Log Out</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Floating Logout Confirmation Modal Overlay */}
        {showLogoutConfirm && (
          <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white dark:bg-[#1E1815] rounded-2xl p-6 max-w-sm w-full border border-stone-200 dark:border-stone-800 shadow-2xl text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-[#4A2414] dark:text-[#FFA756]">
                  Confirm Logout
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  Are you sure you want to log out? Your points and live orders will be safely waiting for your next login.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl hover:bg-stone-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onLogout();
                  }}
                  className="flex-1 py-2 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700 shadow-xs"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
