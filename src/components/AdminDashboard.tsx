import React, { useState, useEffect } from 'react';
import {
  Product,
  Order,
  OrderStatus,
  ShopSettings,
  Campaign,
  ProductCategory,
  PromoOffer,
  OfferDiscountType
} from '../types';
import { api } from '../services/api';
import { soundManager } from '../utils/sound';
import { MagicNutriLogo } from './MagicNutriLogo';
import { checkOfferActiveStatus } from '../utils/preferences';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ReceiptText,
  Sparkles,
  Settings,
  X,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Check,
  Ban,
  Bell,
  Volume2,
  VolumeX,
  QrCode,
  DollarSign,
  AlertTriangle,
  Gift,
  Eye,
  EyeOff,
  KeyRound,
  RotateCcw,
  Calendar,
  Tag,
  ToggleLeft,
  ToggleRight,
  Search,
  Copy,
  Percent,
  SlidersHorizontal,
  TrendingUp,
  Users,
  ShoppingBag,
  Sun
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQRModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  onOpenQRModal,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPin, setShowPin] = useState(false);

  // Change PIN states in Settings tab
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinChangeMessage, setPinChangeMessage] = useState('');
  const [pinChangeError, setPinChangeError] = useState('');
  const [showNewPin, setShowNewPin] = useState(false);

  // Daily / Date-Time Order Reset states
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetMode, setResetMode] = useState<'today_reset' | 'before_datetime' | 'completed_only' | 'all'>('today_reset');
  const [resetCutoffDateTime, setResetCutoffDateTime] = useState(() => {
    const d = new Date();
    d.setHours(7, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'menu' | 'rewards' | 'offers' | 'settings'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);

  // Permanent Lifetime Orders & Overview Time Range (Today, past 1 week, month, year, or lifetime)
  const [masterOrders, setMasterOrders] = useState<Order[]>([]);
  const [overviewTimeRange, setOverviewTimeRange] = useState<'today' | 'week' | 'month' | 'year' | 'lifetime'>('today');

  // Offers management states
  const [offers, setOffers] = useState<PromoOffer[]>([]);
  const [offersFilter, setOffersFilter] = useState<'all' | 'active' | 'inactive' | 'scheduled'>('all');
  const [offersSearch, setOffersSearch] = useState('');
  const [editingOffer, setEditingOffer] = useState<PromoOffer | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isNewOffer, setIsNewOffer] = useState(false);
  const [offerToast, setOfferToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [copiedOfferCode, setCopiedOfferCode] = useState<string | null>(null);

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);

  // Orders status filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!isOpen) return;
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isOpen, isAuthenticated]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [allOrders, allMasterOrders, allProducts, shopSettings, camp, allOffers] = await Promise.all([
        api.getOrders(),
        api.getMasterOrders(),
        api.getProducts(),
        api.getSettings(),
        api.getCampaign(),
        api.getOffers()
      ]);
      setOrders(allOrders);
      setMasterOrders(allMasterOrders);
      setProducts(allProducts);
      setSettings(shopSettings);
      setCampaign(camp);
      setOffers(allOffers);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (api.verifyAdminPin(pinInput)) {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Incorrect Security PIN. Access denied.');
    }
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeMessage('');
    setPinChangeError('');

    if (newPinInput !== confirmPinInput) {
      setPinChangeError('New PIN and confirmation PIN do not match.');
      return;
    }

    const result = api.updateAdminPin(currentPinInput, newPinInput);
    if (result.success) {
      setPinChangeMessage('Admin Security PIN updated successfully! Use your new PIN next time.');
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
    } else {
      setPinChangeError(result.message);
    }
  };

  const handleExecuteReset = async () => {
    try {
      const res = await api.resetOrders({
        mode: resetMode,
        beforeIsoDateTime: resetMode === 'before_datetime' ? new Date(resetCutoffDateTime).toISOString() : undefined,
      });
      await loadAdminData();
      setIsResetModalOpen(false);
      setResetSuccessMessage(`Cleaned ${res.clearedCount} orders from live register! Lifetime overview data and past week/month/year analytics are preserved and not reset.`);
      setTimeout(() => setResetSuccessMessage(''), 8000);
    } catch {
      alert('Failed to reset orders. Please try again.');
    }
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, status);
      await loadAdminData();
    } catch {
      // ignore
    }
  };

  const handleMarkPayment = async (orderId: string) => {
    try {
      await api.markOrderPaymentPaid(orderId);
      await loadAdminData();
    } catch {
      // ignore
    }
  };

  const handleToggleStock = async (product: Product) => {
    const updated = { ...product, inStock: !product.inStock };
    await api.updateProduct(updated);
    await loadAdminData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      await api.deleteProduct(id);
      await loadAdminData();
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    await api.updateProduct(editingProduct);
    setEditingProduct(null);
    await loadAdminData();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    await api.updateSettings(settings);
    alert('Settings saved successfully!');
  };

  const handleClaimFreeFood = async () => {
    if (window.confirm('Confirm that the customer has collected their free winning meal at the counter?')) {
      await api.markCampaignWinnerRedeemed();
      await loadAdminData();
    }
  };

  const showOfferToast = (message: string, type: 'success' | 'error' = 'success') => {
    setOfferToast({ message, type });
    setTimeout(() => setOfferToast(null), 3500);
  };

  const handleToggleOfferActive = async (offer: PromoOffer) => {
    try {
      const updated = await api.toggleOfferActive(offer.id);
      setOffers((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      soundManager.playScratch();
      showOfferToast(
        updated.isActive
          ? `Offer "${updated.code}" is now LIVE & ACTIVE for customers!`
          : `Offer "${updated.code}" has been TURNED OFF.`
      );
    } catch {
      showOfferToast('Failed to toggle offer status', 'error');
    }
  };

  const handleDeleteOffer = async (offer: PromoOffer) => {
    if (!window.confirm(`Are you sure you want to delete offer "${offer.code} - ${offer.title}"?`)) {
      return;
    }
    try {
      await api.deleteOffer(offer.id);
      setOffers((prev) => prev.filter((o) => o.id !== offer.id));
      showOfferToast(`Offer "${offer.code}" deleted successfully.`);
    } catch {
      showOfferToast('Failed to delete offer', 'error');
    }
  };

  const handleOpenAddOffer = () => {
    setIsNewOffer(true);
    setEditingOffer({
      id: `offer-${Date.now()}`,
      code: '',
      title: '',
      description: '',
      discountType: 'percentage',
      value: '10% OFF',
      badge: 'Diet Deal',
      isActive: true,
      scheduleType: 'always',
      validHoursStart: '07:00',
      validHoursEnd: '11:00',
      validHours: '7:00 AM – 11:00 AM',
      terms: 'Applicable at Godda & Dumka store counter.',
    });
    setIsOfferModalOpen(true);
  };

  const handleOpenEditOffer = (offer: PromoOffer) => {
    setIsNewOffer(false);
    setEditingOffer({ ...offer });
    setIsOfferModalOpen(true);
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer) return;

    if (!editingOffer.code.trim()) {
      showOfferToast('Please enter an offer code (e.g. DIET10)', 'error');
      return;
    }
    if (!editingOffer.title.trim()) {
      showOfferToast('Please enter an offer title', 'error');
      return;
    }

    try {
      const saved = await api.saveOffer({
        ...editingOffer,
        code: editingOffer.code.trim().toUpperCase(),
        validHours:
          editingOffer.scheduleType === 'hours'
            ? `${editingOffer.validHoursStart || '07:00'} - ${editingOffer.validHoursEnd || '11:00'}`
            : editingOffer.validHours,
      });
      await loadAdminData();
      setIsOfferModalOpen(false);
      setEditingOffer(null);
      soundManager.playRewardFanfare();
      showOfferToast(
        isNewOffer
          ? `New offer "${saved.code}" added successfully!`
          : `Offer "${saved.code}" updated successfully!`
      );
    } catch (err: any) {
      showOfferToast(err?.message || 'Failed to save offer', 'error');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedOfferCode(code);
    soundManager.playScratch();
    setTimeout(() => setCopiedOfferCode(null), 2000);
  };

  const handleResetDefaultOffers = async () => {
    if (window.confirm('Reset all offers back to default store promotions?')) {
      const res = await api.resetDefaultOffers();
      setOffers(res);
      showOfferToast('Offers restored to default list.');
    }
  };

  if (!isOpen) return null;

  // PIN Protection Gate
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 border border-stone-200">
          <div className="flex justify-between items-start mb-2">
            <div className="flex justify-center w-full">
              <MagicNutriLogo variant="full" size="sm" className="scale-90 -my-2" />
            </div>
            <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700 -mr-2">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-stone-600 mb-4 text-center">
            Enter authorized owner PIN to manage orders, products, and loyalty campaigns.
          </p>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Admin Security PIN / Key
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter Security PIN"
                  autoFocus
                  className="w-full p-2.5 pr-10 text-center text-base font-mono font-bold tracking-wider border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#F47B16]"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {pinError && (
              <p className="text-xs text-red-600 font-medium text-center">
                {pinError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 text-sm font-bold text-white bg-[#4A2414] hover:bg-[#381a0e] rounded-xl shadow-md transition-colors"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Master Lifetime Orders Pool (Never reset across daily register resets)
  const masterPool = masterOrders.length > 0 ? masterOrders : orders;
  const nowTime = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // Filter master orders based on selected overview timeframe (today, week, month, year, or lifetime)
  const overviewFilteredOrders = masterPool.filter((o) => {
    if (overviewTimeRange === 'lifetime') return true;
    const orderDate = new Date(o.createdAt);
    const orderTime = orderDate.getTime();
    if (overviewTimeRange === 'today') {
      const today = new Date();
      return (
        orderDate.getFullYear() === today.getFullYear() &&
        orderDate.getMonth() === today.getMonth() &&
        orderDate.getDate() === today.getDate()
      );
    }
    if (overviewTimeRange === 'week') {
      return nowTime - orderTime <= 7 * dayMs;
    }
    if (overviewTimeRange === 'month') {
      return nowTime - orderTime <= 30 * dayMs;
    }
    if (overviewTimeRange === 'year') {
      return nowTime - orderTime <= 365 * dayMs;
    }
    return true;
  });

  // Overview Timeframe Metrics
  const overviewRevenue = overviewFilteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const overviewTotalCount = overviewFilteredOrders.length;
  const overviewAov = overviewTotalCount > 0 ? Math.round(overviewRevenue / overviewTotalCount) : 0;
  const overviewCompletedCount = overviewFilteredOrders.filter((o) => o.status === 'Completed').length;
  const overviewPointsRedeemed = overviewFilteredOrders.reduce((sum, o) => sum + (o.pointsRedeemed || 0), 0);
  const overviewUniqueCustomers = new Set(overviewFilteredOrders.map((o) => o.customerPhone)).size;

  // Aggregate top-selling products for the selected timeframe
  const productSalesMap = new Map<string, { name: string; quantity: number; revenue: number; image?: string }>();
  overviewFilteredOrders.forEach((order) => {
    order.items.forEach((item) => {
      const key = item.productId || item.name;
      const existing = productSalesMap.get(key) || {
        name: item.name,
        quantity: 0,
        revenue: 0,
        image: item.image
      };
      existing.quantity += item.quantity;
      existing.revenue += item.price * item.quantity;
      productSalesMap.set(key, existing);
    });
  });
  const topSoldProducts = Array.from(productSalesMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 4);

  // Live Register Queue Metrics (Today's live shift)
  const liveTotalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const livePendingCount = orders.filter((o) => o.status === 'Order Received').length;
  const livePreparingCount = orders.filter((o) => o.status === 'Preparing').length;
  const liveReadyCount = orders.filter((o) => o.status === 'Ready for Pickup').length;
  const liveCompletedCount = orders.filter((o) => o.status === 'Completed').length;
  const totalPointsRedeemed = masterPool.reduce((sum, o) => sum + (o.pointsRedeemed || 0), 0);

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'all') return true;
    return o.status === orderStatusFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-5xl h-[92vh] bg-[#FFFDF9] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-stone-200">
        {/* Top bar */}
        <div className="px-5 py-3.5 bg-[#4A2414] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-base font-extrabold text-[#F47B16] font-display">
              Magic Nutri
            </span>
            <span className="text-xs text-white/40">|</span>
            <span className="text-xs font-semibold text-white/90">
              Owner Administration Panel
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => soundManager.playAdminAlert()}
              title="Test Order Alert Sound"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors text-xs flex items-center gap-1"
            >
              <Bell className="w-3.5 h-3.5 text-[#FFD700]" />
              <span className="hidden sm:inline">Test Alert Sound</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 py-2 bg-[#FFF7E8] border-b border-stone-200/80 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-[#4A2414] text-white shadow-xs'
                : 'text-stone-700 hover:bg-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-[#4A2414] text-white shadow-xs'
                : 'text-stone-700 hover:bg-white'
            }`}
          >
            <ReceiptText className="w-3.5 h-3.5" />
            <span>Live Orders</span>
            {livePendingCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {livePendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'menu'
                ? 'bg-[#4A2414] text-white shadow-xs'
                : 'text-stone-700 hover:bg-white'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Menu Manager</span>
          </button>

          <button
            onClick={() => setActiveTab('rewards')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'rewards'
                ? 'bg-[#4A2414] text-white shadow-xs'
                : 'text-stone-700 hover:bg-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Rewards & 100-Order Draw</span>
          </button>

          <button
            onClick={() => setActiveTab('offers')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'offers'
                ? 'bg-[#4A2414] text-white shadow-xs'
                : 'text-stone-700 hover:bg-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-[#F47B16]" />
            <span>Offers & Deals</span>
            {offers.filter((o) => o.isActive).length > 0 && (
              <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {offers.filter((o) => o.isActive).length} ON
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-[#4A2414] text-white shadow-xs'
                : 'text-stone-700 hover:bg-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Shop Settings</span>
          </button>

          <button
            onClick={onOpenQRModal}
            className="ml-auto px-3 py-1.5 rounded-lg bg-[#2E7D32] text-white text-xs font-bold hover:bg-[#256628] flex items-center gap-1 whitespace-nowrap"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>View / Print Shop QR</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FAF7F2]">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Header & Timeframe Selector Bar */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#F47B16]" />
                    <h3 className="text-sm sm:text-base font-extrabold text-[#4A2414] font-display">
                      Overview & Performance Analytics
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Filter historical sales. Lifetime analytics are never erased by daily register resets.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Timeframe Chips */}
                  <div className="flex items-center gap-1.5 p-1 bg-stone-100/80 rounded-xl border border-stone-200/60 overflow-x-auto text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setOverviewTimeRange('today')}
                      className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        overviewTimeRange === 'today'
                          ? 'bg-[#F47B16] text-white shadow-xs font-bold'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>Today</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOverviewTimeRange('week')}
                      className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        overviewTimeRange === 'week'
                          ? 'bg-[#4A2414] text-white shadow-xs'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Past 1 Week</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOverviewTimeRange('month')}
                      className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        overviewTimeRange === 'month'
                          ? 'bg-[#4A2414] text-white shadow-xs'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Past 1 Month</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOverviewTimeRange('year')}
                      className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        overviewTimeRange === 'year'
                          ? 'bg-[#4A2414] text-white shadow-xs'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Past 1 Year</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOverviewTimeRange('lifetime')}
                      className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        overviewTimeRange === 'lifetime'
                          ? 'bg-[#2E7D32] text-white shadow-xs'
                          : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/60 font-bold'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
                      <span>Lifetime (Never Reset)</span>
                    </button>
                  </div>

                  {/* Reset Order Register Button */}
                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(true)}
                    className="px-3 py-1.5 bg-[#FFF7E8] hover:bg-[#FCE8D5] text-[#4A2414] border border-[#F47B16]/30 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-all shrink-0 active:scale-95 hover:border-[#F47B16]"
                    title="Reset daily register queue (Keeps lifetime analytics safe)"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#F47B16]" />
                    <span>Reset Register</span>
                  </button>
                </div>
              </div>

              {/* Reset Success Message Banner */}
              {resetSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center justify-between shadow-2xs animate-fadeIn">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{resetSuccessMessage}</span>
                  </span>
                  <button
                    onClick={() => setResetSuccessMessage('')}
                    className="text-emerald-700 hover:underline text-[11px] ml-2 font-bold"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Lifetime Protection Notice */}
              <div className="p-3 bg-gradient-to-r from-emerald-50 to-amber-50 rounded-xl border border-emerald-200/80 flex items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-600 text-white rounded-lg shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-emerald-900 block">
                      Lifetime Overview Never Resets
                    </span>
                    <span className="text-emerald-800 text-[11px]">
                      {overviewTimeRange === 'today' && "Filtered to today's real-time orders from master ledger."}
                      {overviewTimeRange === 'lifetime' && 'Showing all historical orders ever placed in Magic Nutri. Daily resets only wipe live kitchen queue.'}
                      {overviewTimeRange === 'week' && 'Filtered to past 7 days of business activity.'}
                      {overviewTimeRange === 'month' && 'Filtered to past 30 days of business activity.'}
                      {overviewTimeRange === 'year' && 'Filtered to past 365 days of business activity.'}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    {overviewFilteredOrders.length} orders analyzed
                  </span>
                </div>
              </div>

              {/* Metric KPI cards for selected timeframe */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                      Revenue ({overviewTimeRange === 'lifetime' ? 'Lifetime' : overviewTimeRange === 'today' ? 'Today' : overviewTimeRange === 'week' ? 'Past 1 Week' : overviewTimeRange === 'month' ? 'Past 1 Month' : 'Past 1 Year'})
                    </span>
                    <DollarSign className="w-4 h-4 text-[#2E7D32]" />
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#4A2414] font-mono mt-1">
                    ₹{overviewRevenue}
                  </div>
                  <span className="text-[10px] text-stone-400">Offline counter receipts</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                      Orders Placed
                    </span>
                    <ShoppingBag className="w-4 h-4 text-[#F47B16]" />
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#F47B16] font-mono mt-1">
                    {overviewTotalCount}
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium">
                    ₹{overviewAov} Average Order Value
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                      Completed / Fulfilled
                    </span>
                    <CheckCircle className="w-4 h-4 text-[#2E7D32]" />
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#2E7D32] font-mono mt-1">
                    {overviewCompletedCount}
                  </div>
                  <span className="text-[10px] text-stone-400">
                    {overviewTotalCount > 0 ? Math.round((overviewCompletedCount / overviewTotalCount) * 100) : 0}% completion rate
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                      Unique Diners
                    </span>
                    <Users className="w-4 h-4 text-stone-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-stone-700 font-mono mt-1">
                    {overviewUniqueCustomers}
                  </div>
                  <span className="text-[10px] text-stone-400">Customer phone profiles</span>
                </div>
              </div>

              {/* Live Shift Status vs Lifetime Ledger Strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Live Shift Queue Box */}
                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <h4 className="text-xs font-bold text-[#4A2414] uppercase tracking-wider">
                        Today's Live Shift Register
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#2E7D32]">
                      ₹{liveTotalRevenue} Today
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                      <span className="text-[10px] text-amber-800 font-bold block uppercase">Incoming</span>
                      <span className="text-lg font-mono font-bold text-amber-900">{livePendingCount}</span>
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                      <span className="text-[10px] text-emerald-800 font-bold block uppercase">Kitchen / Ready</span>
                      <span className="text-lg font-mono font-bold text-emerald-900">{livePreparingCount + liveReadyCount}</span>
                    </div>
                    <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                      <span className="text-[10px] text-stone-600 font-bold block uppercase">Finished</span>
                      <span className="text-lg font-mono font-bold text-stone-800">{liveCompletedCount}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between pt-1 gap-2 border-t border-stone-100">
                    <span className="text-[11px] text-stone-500">
                      {orders.length} orders in live shift
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsResetModalOpen(true)}
                        className="text-xs text-stone-600 hover:text-red-700 font-bold flex items-center gap-1 transition-colors px-2 py-0.5 rounded-md hover:bg-stone-100"
                        title="Reset live shift orders"
                      >
                        <RotateCcw className="w-3 h-3 text-[#F47B16]" />
                        <span>Reset Register</span>
                      </button>
                      <span className="text-stone-300">|</span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('orders')}
                        className="text-xs text-[#F47B16] font-bold hover:underline"
                      >
                        Manage Live Orders →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Campaign Progress & Points Liability */}
                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#4A2414] uppercase tracking-wider">
                      Loyalty & 100-Order Lucky Draw
                    </h4>
                    {campaign && (
                      <span className="text-xs font-mono font-bold text-[#F47B16]">
                        {campaign.currentOrderCount}/100 Cycle
                      </span>
                    )}
                  </div>

                  {campaign && (
                    <div className="space-y-1.5">
                      <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#F47B16] to-[#2E7D32]"
                          style={{ width: `${Math.min(100, campaign.currentOrderCount)}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-stone-500">
                        {campaign.status === 'completed'
                          ? `Winner: ${campaign.winnerCustomerName} (Order #${campaign.winnerOrderId})`
                          : 'Target: 100 total orders awards 1 customer a free diet meal!'}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-stone-500 block text-[11px]">Total Points Redeemed</span>
                      <span className="font-mono font-bold text-[#2E7D32]">
                        ₹{(totalPointsRedeemed / 20).toFixed(2)} ({totalPointsRedeemed} pts)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('rewards')}
                      className="text-xs text-[#F47B16] font-bold hover:underline"
                    >
                      Reward Rules →
                    </button>
                  </div>
                </div>
              </div>

              {/* Top Selling Diet Bowls & Sandwiches */}
              {topSoldProducts.length > 0 && (
                <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#4A2414] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#F47B16]" />
                      <span>Top Selling Items ({overviewTimeRange === 'lifetime' ? 'All-Time' : overviewTimeRange})</span>
                    </h4>
                    <span className="text-[11px] text-stone-400">By quantity sold</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {topSoldProducts.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex flex-col justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-9 h-9 rounded-lg object-cover shrink-0 border border-stone-200"
                            />
                          )}
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#4A2414] line-clamp-1 block">
                              {item.name}
                            </span>
                            <span className="text-[11px] font-mono text-[#F47B16] font-bold">
                              {item.quantity} sold
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px]">
                          <span className="text-stone-400">Revenue</span>
                          <span className="font-mono font-bold text-[#2E7D32]">
                            ₹{item.revenue}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Orders in Selected Timeframe */}
              <div className="bg-white rounded-xl border border-stone-200 p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-[#4A2414] uppercase tracking-wider">
                    Recent Orders ({overviewTimeRange === 'lifetime' ? 'Lifetime' : overviewTimeRange})
                  </h4>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-[#F47B16] font-bold hover:underline"
                  >
                    View Live Orders Queue →
                  </button>
                </div>

                <div className="space-y-2">
                  {overviewFilteredOrders.slice(0, 4).map((order) => (
                    <div
                      key={order.id}
                      className="p-3 bg-stone-50 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-[#4A2414]">
                          #{order.id}
                        </span>
                        <span className="text-stone-600 ml-2 font-medium">
                          {order.customerName} (+91 {order.customerPhone})
                        </span>
                        <span className="text-stone-400 ml-2">
                          • {order.orderType === 'dine-in' ? order.tableNumber || 'Dine-in' : 'Takeaway'}
                        </span>
                        <span className="text-stone-400 ml-2 text-[10px] font-mono">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-[#2E7D32]">
                          ₹{order.totalAmount}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Toolbar: Order filter buttons + Daily Reset action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1 border-b border-stone-100">
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
                  {['all', 'Order Received', 'Accepted', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                        orderStatusFilter === st
                          ? 'bg-[#4A2414] text-white shadow-xs'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {st === 'all' ? 'All Orders' : st}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(true)}
                  className="px-3 py-1.5 bg-[#FFF7E8] hover:bg-[#FCE8D5] text-[#4A2414] border border-[#F47B16]/30 text-xs font-bold rounded-lg shadow-2xs flex items-center justify-center gap-1.5 transition-all shrink-0 active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#F47B16]" />
                  <span>Daily Order Reset</span>
                </button>
              </div>

              {resetSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center justify-between shadow-2xs">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{resetSuccessMessage}</span>
                  </span>
                  <button
                    onClick={() => setResetSuccessMessage('')}
                    className="text-emerald-700 hover:underline text-[11px] ml-2"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-xs">
                  No orders found in this category.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2">
                        <div>
                          <span className="text-sm font-extrabold text-[#4A2414] font-mono">
                            #{order.id}
                          </span>
                          <span className="text-xs text-stone-500 ml-2">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-xs font-semibold text-stone-700 ml-3">
                            {order.customerName} (+91 {order.customerPhone})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#FFF7E8] text-[#F47B16] border border-[#F47B16]/20">
                            {order.orderType === 'dine-in' ? `${order.tableNumber || 'Table'}` : 'Takeaway'}
                          </span>
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                              order.status === 'Completed'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'Cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Item list */}
                      <div className="space-y-1 text-xs">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-stone-700">
                            <span>
                              <strong>{item.quantity}x</strong> {item.name}
                            </span>
                            <span className="font-mono">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                        {order.notes && (
                          <p className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded mt-1">
                            <strong>Note:</strong> {order.notes}
                          </p>
                        )}
                      </div>

                      {/* Financial info & Offline payment state */}
                      <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[#4A2414]">
                            Total: <span className="font-mono text-sm text-[#2E7D32]">₹{order.totalAmount}</span>
                          </span>
                          {order.pointsDiscount > 0 && (
                            <span className="text-stone-400">
                              (Saved ₹{order.pointsDiscount} via {order.pointsRedeemed} pts)
                            </span>
                          )}

                          {/* Payment status badge */}
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                              order.paymentStatus === 'Paid Offline'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {order.paymentStatus !== 'Paid Offline' && (
                            <button
                              onClick={() => handleMarkPayment(order.id)}
                              className="px-2.5 py-1 text-xs font-bold text-white bg-[#2E7D32] hover:bg-[#256628] rounded-lg transition-colors"
                            >
                              Mark Paid (Cash/UPI)
                            </button>
                          )}

                          {order.status === 'Order Received' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'Accepted')}
                                className="px-2.5 py-1 text-xs font-bold text-white bg-[#F47B16] hover:bg-[#e06d0f] rounded-lg"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                                className="px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {order.status === 'Accepted' && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'Preparing')}
                              className="px-2.5 py-1 text-xs font-bold text-white bg-[#F47B16] rounded-lg"
                            >
                              Start Preparing
                            </button>
                          )}

                          {order.status === 'Preparing' && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'Ready for Pickup')}
                              className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 rounded-lg"
                            >
                              Mark Ready
                            </button>
                          )}

                          {order.status === 'Ready for Pickup' && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'Completed')}
                              className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 rounded-lg"
                            >
                              Complete Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MENU MANAGER */}
          {activeTab === 'menu' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-[#4A2414]">
                    Product Catalog & Nutrition
                  </h3>
                  <p className="text-xs text-stone-500">
                    Edit names, ingredients, pricing, photo URLs, and stock status.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsNewProduct(true);
                    setEditingProduct({
                      id: `prod-${Date.now()}`,
                      name: '',
                      category: 'Oats Bowls',
                      price: 69,
                      description: '',
                      ingredients: ['Rolled Oats', 'Honey'],
                      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
                      inStock: true,
                      featured: false,
                      calories: 250,
                      proteinGrams: 15
                    });
                  }}
                  className="px-3 py-2 bg-[#F47B16] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Product cards list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 bg-white rounded-xl border border-stone-200 flex flex-col justify-between shadow-2xs"
                  >
                    <div>
                      <div className="flex gap-2">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-14 h-14 object-cover rounded-lg bg-stone-100 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-[#2E7D32]">
                            {prod.category}
                          </span>
                          <h4 className="text-xs font-bold text-[#4A2414] truncate">
                            {prod.name}
                          </h4>
                          <span className="text-xs font-mono font-bold text-[#4A2414]">
                            ₹{prod.price}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-stone-500 line-clamp-2 mt-2">
                        {prod.description}
                      </p>
                      <p className="text-[10px] text-stone-400 mt-1 line-clamp-1">
                        <strong>Ingredients:</strong> {prod.ingredients.join(', ')}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                      {/* Stock toggle */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleStock(prod)}
                          className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                            prod.inStock
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {prod.inStock ? 'In Stock' : 'Sold Out'}
                        </button>
                        {prod.comingSoon && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            Coming Soon
                          </span>
                        )}
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setIsNewProduct(false);
                            setEditingProduct(prod);
                          }}
                          className="p-1.5 text-stone-600 hover:text-[#F47B16] rounded hover:bg-stone-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 rounded hover:bg-stone-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: REWARDS & CAMPAIGN */}
          {activeTab === 'rewards' && (
            <div className="space-y-6">
              {campaign && (
                <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-[#F47B16]" />
                    <h3 className="text-sm font-bold text-[#4A2414]">
                      100-Order Lucky Draw Free Food Campaign
                    </h3>
                  </div>

                  <div className="p-3 bg-[#FFF7E8] rounded-xl border border-[#F47B16]/20">
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Completed in this cycle:</span>
                      <span className="font-mono font-bold text-[#F47B16]">
                        {campaign.currentOrderCount} / {campaign.targetOrders}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2E7D32]"
                        style={{ width: `${Math.min(100, campaign.currentOrderCount)}%` }}
                      />
                    </div>
                  </div>

                  {campaign.winnerCustomerName ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-emerald-900">
                          Selected Winner: {campaign.winnerCustomerName} (+91 {campaign.winnerCustomerPhone})
                        </h4>
                        <span className="text-xs font-mono font-bold text-emerald-800">
                          Order #{campaign.winnerOrderId}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-700">
                        Prize: Free <strong>{campaign.winningProductName}</strong>
                      </p>

                      <div className="pt-2">
                        {campaign.redeemed ? (
                          <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Prize redeemed at counter
                          </span>
                        ) : (
                          <button
                            onClick={handleClaimFreeFood}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-[#2E7D32] hover:bg-[#256628] rounded-lg"
                          >
                            Mark Free Meal Handed Over & Redeemed
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-stone-500">
                      When the 100th order is placed, the server automatically executes the random winner selection algorithm and selects 1 lucky order from the 100 batch.
                    </p>
                  )}
                </div>
              )}

              {/* Reward Policy rules */}
              <div className="bg-white p-5 rounded-xl border border-stone-200 space-y-3">
                <h4 className="text-xs font-bold text-[#4A2414] uppercase">
                  Scratch Card Reward Policy
                </h4>
                <ul className="text-xs text-stone-600 space-y-1.5 list-disc pl-4">
                  <li>Points awarded per order scratch card: <strong>20 to 50 points</strong> (Random server generator).</li>
                  <li>Exchange rate: <strong>100 points = ₹5.00 INR</strong> (20 points = ₹1.00).</li>
                  <li>Minimum points required to redeem on an order: <strong>50 points</strong> (₹2.50 discount).</li>
                  <li>Maximum bill discount: <strong>50% of subtotal</strong>.</li>
                  <li>Points ledger is stored immutably to prevent duplicate redemptions.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 5: OFFERS & DEALS MANAGEMENT (OWNER CONTROL) */}
          {activeTab === 'offers' && (
            <div className="space-y-6">
              {/* Toast Message if any */}
              {offerToast && (
                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all shadow-xs ${
                    offerToast.type === 'success'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-red-50 border-red-300 text-red-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {offerToast.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{offerToast.message}</span>
                  </div>
                  <button
                    onClick={() => setOfferToast(null)}
                    className="p-1 text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Header Banner */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#FFF7E8] text-[#F47B16] border border-[#F47B16]/20 flex items-center justify-center shrink-0 shadow-xs">
                    <Tag className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-[#4A2414] font-display">
                        Offers & Promotions Manager
                      </h3>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full uppercase">
                        Owner Control
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Toggle customer discount codes On or Off, configure valid time schedules (such as Morning Diet Hours 7:00 AM – 11:00 AM), or add custom store campaigns.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleResetDefaultOffers}
                    title="Restore default offers"
                    className="px-3 py-2 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                    <span>Reset Defaults</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenAddOffer}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#F47B16] hover:bg-[#e06d0f] rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Offer</span>
                  </button>
                </div>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Total Offers
                  </span>
                  <span className="text-2xl font-black text-[#4A2414] font-mono mt-0.5 block">
                    {offers.length}
                  </span>
                  <span className="text-[10px] text-stone-400">Promotions in register</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                    Active / Live [ON]
                  </span>
                  <span className="text-2xl font-black text-emerald-700 font-mono mt-0.5 block">
                    {offers.filter((o) => o.isActive).length}
                  </span>
                  <span className="text-[10px] text-emerald-600/80 font-semibold">Ready for customers</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    Turned OFF [OFF]
                  </span>
                  <span className="text-2xl font-black text-stone-600 font-mono mt-0.5 block">
                    {offers.filter((o) => !o.isActive).length}
                  </span>
                  <span className="text-[10px] text-stone-400">Hidden / Paused</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-[#F47B16] uppercase tracking-wider block">
                    Morning Hours Only
                  </span>
                  <span className="text-2xl font-black text-[#F47B16] font-mono mt-0.5 block">
                    {offers.filter((o) => o.scheduleType === 'hours').length}
                  </span>
                  <span className="text-[10px] text-amber-700 font-semibold">7:00 AM – 11:00 AM window</span>
                </div>
              </div>

              {/* Filter and Search controls */}
              <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={offersSearch}
                    onChange={(e) => setOffersSearch(e.target.value)}
                    placeholder="Search by offer code (e.g. MAGICDIET10), title, or discount..."
                    className="w-full pl-9 pr-8 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47B16] focus:bg-white transition-all"
                  />
                  {offersSearch && (
                    <button
                      onClick={() => setOffersSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
                  <button
                    onClick={() => setOffersFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                      offersFilter === 'all'
                        ? 'bg-[#4A2414] text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    All ({offers.length})
                  </button>

                  <button
                    onClick={() => setOffersFilter('active')}
                    className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
                      offersFilter === 'active'
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    <span>Active [ON]</span>
                    <span className="font-mono text-[11px]">({offers.filter((o) => o.isActive).length})</span>
                  </button>

                  <button
                    onClick={() => setOffersFilter('inactive')}
                    className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
                      offersFilter === 'inactive'
                        ? 'bg-stone-800 text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <span>Turned OFF</span>
                    <span className="font-mono text-[11px]">({offers.filter((o) => !o.isActive).length})</span>
                  </button>

                  <button
                    onClick={() => setOffersFilter('scheduled')}
                    className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
                      offersFilter === 'scheduled'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>Timed Hours</span>
                    <span className="font-mono text-[11px]">({offers.filter((o) => o.scheduleType === 'hours').length})</span>
                  </button>
                </div>
              </div>

              {/* Offer Cards List */}
              {offers.filter((o) => {
                if (offersFilter === 'active' && !o.isActive) return false;
                if (offersFilter === 'inactive' && o.isActive) return false;
                if (offersFilter === 'scheduled' && o.scheduleType !== 'hours') return false;
                if (offersSearch.trim()) {
                  const q = offersSearch.toLowerCase();
                  const matchCode = o.code.toLowerCase().includes(q);
                  const matchTitle = o.title.toLowerCase().includes(q);
                  const matchDesc = o.description.toLowerCase().includes(q);
                  const matchBadge = o.badge.toLowerCase().includes(q);
                  if (!matchCode && !matchTitle && !matchDesc && !matchBadge) return false;
                }
                return true;
              }).length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-8 space-y-3">
                  <Tag className="w-10 h-10 text-stone-300 mx-auto" />
                  <p className="text-sm font-bold text-stone-700">No offers matching your filter</p>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto">
                    Try clearing your search query or add a brand-new promotional offer.
                  </p>
                  <button
                    onClick={handleOpenAddOffer}
                    className="px-4 py-2 bg-[#F47B16] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#e06d0f]"
                  >
                    + Create First Offer
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {offers
                    .filter((o) => {
                      if (offersFilter === 'active' && !o.isActive) return false;
                      if (offersFilter === 'inactive' && o.isActive) return false;
                      if (offersFilter === 'scheduled' && o.scheduleType !== 'hours') return false;
                      if (offersSearch.trim()) {
                        const q = offersSearch.toLowerCase();
                        const matchCode = o.code.toLowerCase().includes(q);
                        const matchTitle = o.title.toLowerCase().includes(q);
                        const matchDesc = o.description.toLowerCase().includes(q);
                        const matchBadge = o.badge.toLowerCase().includes(q);
                        if (!matchCode && !matchTitle && !matchDesc && !matchBadge) return false;
                      }
                      return true;
                    })
                    .map((offer) => {
                      const statusInfo = checkOfferActiveStatus(offer);

                      return (
                        <div
                          key={offer.id || offer.code}
                          className={`bg-white rounded-2xl border p-4 shadow-sm transition-all flex flex-col justify-between space-y-3 relative overflow-hidden ${
                            offer.isActive
                              ? 'border-emerald-300 ring-1 ring-emerald-400/20 shadow-emerald-500/5'
                              : 'border-stone-200 opacity-85 bg-stone-50/60'
                          }`}
                        >
                          {/* Active / Inactive color indicator top bar */}
                          <div
                            className={`absolute top-0 left-0 right-0 h-1 ${
                              offer.isActive
                                ? statusInfo.isLive
                                  ? 'bg-emerald-500'
                                  : 'bg-amber-400'
                                : 'bg-stone-300'
                            }`}
                          />

                          {/* Top Card Bar: Badges + Live Status */}
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-black uppercase bg-[#F47B16]/10 text-[#F47B16] px-2 py-0.5 rounded-md">
                                  {offer.badge || 'Offer'}
                                </span>

                                <span
                                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${
                                    offer.isActive
                                      ? statusInfo.isLive
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-amber-100 text-amber-800'
                                      : 'bg-stone-100 text-stone-600'
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
                                        ? 'LIVE & ACTIVE'
                                        : 'SCHEDULED'
                                      : 'TURNED OFF'}
                                  </span>
                                </span>
                              </div>

                              {/* Big ON / OFF Switch */}
                              <button
                                type="button"
                                onClick={() => handleToggleOfferActive(offer)}
                                title={offer.isActive ? 'Click to Turn OFF' : 'Click to Turn ON'}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
                                  offer.isActive
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                                }`}
                              >
                                {offer.isActive ? (
                                  <>
                                    <ToggleRight className="w-4 h-4 text-white" />
                                    <span>ON</span>
                                  </>
                                ) : (
                                  <>
                                    <ToggleLeft className="w-4 h-4 text-stone-500" />
                                    <span>OFF</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Offer Code & Discount Value */}
                            <div className="flex items-center justify-between gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200/80 mb-2.5">
                              <div className="flex items-center gap-1.5 font-mono">
                                <span className="text-[10px] text-stone-500 uppercase font-bold">Code:</span>
                                <span className="text-xs font-black tracking-wider text-[#4A2414] bg-white px-2 py-0.5 rounded border border-stone-200">
                                  {offer.code}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyCode(offer.code)}
                                  title="Copy code"
                                  className="p-1 text-stone-400 hover:text-[#F47B16] transition-colors"
                                >
                                  {copiedOfferCode === offer.code ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>

                              <span className="text-xs font-extrabold text-[#2E7D32] font-mono bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                                {offer.value}
                              </span>
                            </div>

                            {/* Title & Description */}
                            <h4 className="text-sm font-bold text-[#4A2414] leading-snug">
                              {offer.title}
                            </h4>
                            <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                              {offer.description}
                            </p>
                          </div>

                          {/* Schedule / When Active details */}
                          <div className="space-y-2 pt-2 border-t border-stone-100">
                            <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-900 space-y-1">
                              <div className="flex items-center justify-between font-semibold">
                                <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800">
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Active Schedule:</span>
                                </span>
                                <span className="text-[11px] font-mono font-bold">
                                  {offer.scheduleType === 'always'
                                    ? '24/7 Always Active'
                                    : offer.scheduleType === 'hours'
                                    ? `${offer.validHoursStart || '07:00'} – ${offer.validHoursEnd || '11:00'} Daily`
                                    : `${offer.startDate || 'Start'} to ${offer.endDate || 'End'}`}
                                </span>
                              </div>

                              {offer.scheduleType === 'hours' && (
                                <p className="text-[10px] text-amber-700">
                                  Configured for store breakfast window (Morning Diet Hours: 7:00 AM – 11:00 AM).
                                </p>
                              )}

                              <p className="text-[10px] text-stone-500 italic">
                                Terms: {offer.terms || 'Applicable at Godda & Dumka store counter.'}
                              </p>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="flex items-center justify-between pt-1">
                              <div className="text-[10px] text-stone-400">
                                {offer.isActive ? (
                                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    <span>Visible to customers</span>
                                  </span>
                                ) : (
                                  <span className="text-stone-500 flex items-center gap-1">
                                    <Ban className="w-3 h-3" />
                                    <span>Hidden from store</span>
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditOffer(offer)}
                                  className="px-2.5 py-1 text-xs font-semibold text-stone-600 hover:text-[#4A2414] hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-1"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteOffer(offer)}
                                  className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete offer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'settings' && settings && (
            <div className="bg-white p-5 rounded-xl border border-stone-200 space-y-4 max-w-xl">
              <h3 className="text-sm font-bold text-[#4A2414]">
                Storefront & Service Configuration
              </h3>

              <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Shop Name
                  </label>
                  <input
                    type="text"
                    value={settings.shopName}
                    onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={settings.shopTagline}
                    onChange={(e) => setSettings({ ...settings, shopTagline: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Shop Address
                  </label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Opening Hours
                  </label>
                  <input
                    type="text"
                    value={settings.openingHours}
                    onChange={(e) => setSettings({ ...settings, openingHours: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg font-medium"
                  />
                </div>

                <div className="pt-2 flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.dineInEnabled}
                      onChange={(e) => setSettings({ ...settings, dineInEnabled: e.target.checked })}
                      className="rounded text-[#2E7D32]"
                    />
                    <span>Allow Table Dine-in</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.pickupEnabled}
                      onChange={(e) => setSettings({ ...settings, pickupEnabled: e.target.checked })}
                      className="rounded text-[#2E7D32]"
                    />
                    <span>Allow Takeaway Pickup</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="mt-4 px-4 py-2.5 bg-[#4A2414] text-white font-bold rounded-xl hover:bg-[#381a0e] shadow-xs"
                >
                  Save Store Settings
                </button>
              </form>

              {/* Change Admin Security PIN Card */}
              <div className="mt-10 pt-6 border-t border-stone-200">
                <div className="flex items-center gap-2 mb-2">
                  <KeyRound className="w-4 h-4 text-[#F47B16]" />
                  <h4 className="text-sm font-bold text-[#4A2414]">
                    Change Admin Security PIN / Key
                  </h4>
                </div>
                <p className="text-xs text-stone-500 mb-4">
                  Update the master security PIN used to unlock this owner dashboard. Never shared with customers.
                </p>

                <form onSubmit={handleChangePin} className="space-y-3 max-w-md bg-stone-50/70 p-4 rounded-xl border border-stone-200">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Current Security PIN
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPinInput}
                      onChange={(e) => setCurrentPinInput(e.target.value)}
                      placeholder="Enter current PIN"
                      className="w-full p-2.5 text-xs bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-[#F47B16]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      New Security PIN
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPin ? 'text' : 'password'}
                        required
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value)}
                        placeholder="Enter new PIN / Key"
                        className="w-full p-2.5 pr-10 text-xs bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-[#F47B16]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPin(!showNewPin)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                      >
                        {showNewPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Confirm New Security PIN
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPinInput}
                      onChange={(e) => setConfirmPinInput(e.target.value)}
                      placeholder="Confirm new PIN"
                      className="w-full p-2.5 text-xs bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-[#F47B16]"
                    />
                  </div>

                  {pinChangeMessage && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{pinChangeMessage}</span>
                    </div>
                  )}

                  {pinChangeError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{pinChangeError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#F47B16] hover:bg-[#e06d0f] text-white text-xs font-bold rounded-lg transition-all shadow-xs"
                  >
                    Update Security PIN
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Offer Modal */}
      {isOfferModalOpen && editingOffer && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFF7E8] text-[#F47B16] flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#4A2414]">
                    {isNewOffer ? 'Add New Promotional Offer' : 'Edit Offer & Schedule'}
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Set offer codes, discount rules, and control when the offer is active or turned off.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOfferModalOpen(false);
                  setEditingOffer(null);
                }}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="space-y-3.5 text-xs">
              {/* Promo Code & Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Promo Code (Uppercase)*
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MAGICDIET20"
                    value={editingOffer.code}
                    onChange={(e) =>
                      setEditingOffer({ ...editingOffer, code: e.target.value.toUpperCase() })
                    }
                    className="w-full p-2.5 font-mono font-bold uppercase tracking-wider bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-[#F47B16] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Badge Tag Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Diet Saver, Breakfast Deal"
                    value={editingOffer.badge}
                    onChange={(e) =>
                      setEditingOffer({ ...editingOffer, badge: e.target.value })
                    }
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-[#F47B16] focus:bg-white"
                  />
                </div>
              </div>

              {/* Offer Title */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Offer Title*
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10% Off Healthy Diet Bowls"
                  value={editingOffer.title}
                  onChange={(e) =>
                    setEditingOffer({ ...editingOffer, title: e.target.value })
                  }
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-[#F47B16] focus:bg-white font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Enjoy 10% off on all artisan Oats and Chia bowls for morning diet."
                  value={editingOffer.description}
                  onChange={(e) =>
                    setEditingOffer({ ...editingOffer, description: e.target.value })
                  }
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-[#F47B16] focus:bg-white"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={editingOffer.discountType}
                    onChange={(e) =>
                      setEditingOffer({
                        ...editingOffer,
                        discountType: e.target.value as OfferDiscountType,
                      })
                    }
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-[#F47B16] focus:bg-white"
                  >
                    <option value="percentage">Percentage Off (%)</option>
                    <option value="flat_rupees">Flat Cash Off (₹)</option>
                    <option value="points">Reward Points Bonus</option>
                    <option value="free_item">Free Item / Booster</option>
                    <option value="draw">Store Lucky Draw</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Discount Value Text*
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10% OFF, ₹20 OFF, 40 PTS"
                    value={editingOffer.value}
                    onChange={(e) =>
                      setEditingOffer({ ...editingOffer, value: e.target.value })
                    }
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg font-mono font-bold focus:ring-2 focus:ring-[#F47B16] focus:bg-white"
                  />
                </div>
              </div>

              {/* SECTION: ACTIVE OR OFF (THE PRIMARY REQUEST) */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#4A2414] block">
                      Offer Status: Active or Off
                    </span>
                    <span className="text-[11px] text-stone-500">
                      When turned OFF, the offer is disabled and unavailable to customers.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingOffer.isActive}
                      onChange={(e) =>
                        setEditingOffer({ ...editingOffer, isActive: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="text-[11px]">
                  {editingOffer.isActive ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Offer is currently marked ACTIVE (ON)</span>
                    </span>
                  ) : (
                    <span className="text-stone-600 font-bold flex items-center gap-1">
                      <Ban className="w-3.5 h-3.5" />
                      <span>Offer is currently TURNED OFF (OFF)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* SECTION: SCHEDULE - WHEN TO ACTIVE OR OFF */}
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3">
                <div>
                  <span className="font-bold text-amber-900 block flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span>When to Active or Off (Schedule Settings)</span>
                  </span>
                  <span className="text-[11px] text-amber-800">
                    Control active windows for morning diet hours or date validity.
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-amber-200 cursor-pointer">
                    <input
                      type="radio"
                      name="scheduleType"
                      value="always"
                      checked={editingOffer.scheduleType === 'always'}
                      onChange={() =>
                        setEditingOffer({ ...editingOffer, scheduleType: 'always' })
                      }
                      className="text-[#F47B16]"
                    />
                    <div>
                      <span className="font-bold text-stone-800 block text-xs">
                        Always Active 24/7 (Whenever Status is ON)
                      </span>
                      <span className="text-[10px] text-stone-500">
                        Available all operating hours without daily time restrictions.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-amber-200 cursor-pointer">
                    <input
                      type="radio"
                      name="scheduleType"
                      value="hours"
                      checked={editingOffer.scheduleType === 'hours'}
                      onChange={() =>
                        setEditingOffer({ ...editingOffer, scheduleType: 'hours' })
                      }
                      className="text-[#F47B16]"
                    />
                    <div>
                      <span className="font-bold text-stone-800 block text-xs">
                        Daily Hours Window (e.g. Morning Diet Hours 7:00 AM – 11:00 AM)
                      </span>
                      <span className="text-[10px] text-stone-500">
                        Automatically active only during specified hours of the day.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-amber-200 cursor-pointer">
                    <input
                      type="radio"
                      name="scheduleType"
                      value="date_range"
                      checked={editingOffer.scheduleType === 'date_range'}
                      onChange={() =>
                        setEditingOffer({ ...editingOffer, scheduleType: 'date_range' })
                      }
                      className="text-[#F47B16]"
                    />
                    <div>
                      <span className="font-bold text-stone-800 block text-xs">
                        Date Window (Calendar Start and End Dates)
                      </span>
                      <span className="text-[10px] text-stone-500">
                        Valid for seasonal or limited-time promotional weeks.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Sub-inputs for Daily Hours */}
                {editingOffer.scheduleType === 'hours' && (
                  <div className="grid grid-cols-2 gap-3 p-2.5 bg-white rounded-xl border border-amber-200 mt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Active Start Time
                      </label>
                      <input
                        type="time"
                        value={editingOffer.validHoursStart || '07:00'}
                        onChange={(e) =>
                          setEditingOffer({
                            ...editingOffer,
                            validHoursStart: e.target.value,
                          })
                        }
                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Active End Time
                      </label>
                      <input
                        type="time"
                        value={editingOffer.validHoursEnd || '11:00'}
                        onChange={(e) =>
                          setEditingOffer({
                            ...editingOffer,
                            validHoursEnd: e.target.value,
                          })
                        }
                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Sub-inputs for Date Range */}
                {editingOffer.scheduleType === 'date_range' && (
                  <div className="grid grid-cols-2 gap-3 p-2.5 bg-white rounded-xl border border-amber-200 mt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={editingOffer.startDate || ''}
                        onChange={(e) =>
                          setEditingOffer({ ...editingOffer, startDate: e.target.value })
                        }
                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={editingOffer.endDate || ''}
                        onChange={(e) =>
                          setEditingOffer({ ...editingOffer, endDate: e.target.value })
                        }
                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Terms and conditions */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Terms & Conditions / Counter Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Applicable at Godda & Dumka store counter during morning hours."
                  value={editingOffer.terms}
                  onChange={(e) =>
                    setEditingOffer({ ...editingOffer, terms: e.target.value })
                  }
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
                />
              </div>

              {/* Form buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsOfferModalOpen(false);
                    setEditingOffer(null);
                  }}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-[#F47B16] hover:bg-[#e06d0f] text-white font-bold rounded-xl shadow-md transition-all"
                >
                  {isNewOffer ? 'Create Offer' : 'Save Offer Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl border border-stone-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold text-[#4A2414]">
                {isNewProduct ? 'Add Menu Product' : 'Edit Menu Product'}
              </h4>
              <button onClick={() => setEditingProduct(null)}>
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full p-2 border border-stone-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as ProductCategory })}
                    className="w-full p-2 border border-stone-200 rounded-lg"
                  >
                    <option value="Oats Bowls">Oats Bowls</option>
                    <option value="Fruit Bowls">Fruit Bowls</option>
                    <option value="Chia and Basil Seed Bowls">Chia and Basil Seed Bowls</option>
                    <option value="Protein Sandwiches">Protein Sandwiches</option>
                    <option value="Brown Rice Cake Sandwiches">Brown Rice Cake Sandwiches</option>
                    <option value="Sprout Salads">Sprout Salads</option>
                    <option value="Healthy Snacks">Healthy Snacks</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Price (₹ INR)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full p-2 border border-stone-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full p-2 border border-stone-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Ingredients (comma separated)
                </label>
                <input
                  type="text"
                  value={editingProduct.ingredients.join(', ')}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    ingredients: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  })}
                  className="w-full p-2 border border-stone-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Product Image URL
                </label>
                <input
                  type="text"
                  value={editingProduct.image}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  className="w-full p-2 border border-stone-200 rounded-lg text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Calories (kcal)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.calories || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, calories: Number(e.target.value) })}
                    className="w-full p-2 border border-stone-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Protein (grams)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.proteinGrams || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, proteinGrams: Number(e.target.value) })}
                    className="w-full p-2 border border-stone-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.inStock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                    className="rounded text-[#2E7D32]"
                  />
                  <span>In Stock</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.comingSoon)}
                    onChange={(e) => setEditingProduct({ ...editingProduct, comingSoon: e.target.checked })}
                    className="rounded text-[#F47B16]"
                  />
                  <span>Mark as Coming Soon (Cannot Order)</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2E7D32] text-white font-bold rounded-lg hover:bg-[#256628]"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daily / Date-Time Order Reset Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#F47B16] flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#4A2414]">
                    Daily Order Reset & Clean Interface
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Reset register for fresh daily operations (7:00 AM – 11:00 AM)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-stone-600">
                Current orders in system: <strong className="font-mono text-[#4A2414]">{orders.length} orders</strong>. Select how to clear the register:
              </p>

              <div className="space-y-2">
                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-stone-200 hover:border-[#F47B16] cursor-pointer transition-colors bg-stone-50/50">
                  <input
                    type="radio"
                    name="resetMode"
                    value="today_reset"
                    checked={resetMode === 'today_reset'}
                    onChange={() => setResetMode('today_reset')}
                    className="mt-0.5 text-[#F47B16]"
                  />
                  <div>
                    <span className="font-bold text-[#4A2414] block">
                      🌅 Start Fresh Daily Shift (Recommended)
                    </span>
                    <span className="text-stone-500 text-[11px]">
                      Clears all past & completed orders to give a pristine dashboard, keeping any active orders.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-stone-200 hover:border-[#F47B16] cursor-pointer transition-colors bg-stone-50/50">
                  <input
                    type="radio"
                    name="resetMode"
                    value="before_datetime"
                    checked={resetMode === 'before_datetime'}
                    onChange={() => setResetMode('before_datetime')}
                    className="mt-0.5 text-[#F47B16]"
                  />
                  <div className="w-full">
                    <span className="font-bold text-[#4A2414] block">
                      📅 Reset Orders Before Specific Date & Time
                    </span>
                    <span className="text-stone-500 text-[11px] block mb-2">
                      Purges all orders created before your chosen date/time cutoff.
                    </span>
                    {resetMode === 'before_datetime' && (
                      <div className="mt-1">
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Cutoff Date & Time:
                        </label>
                        <input
                          type="datetime-local"
                          value={resetCutoffDateTime}
                          onChange={(e) => setResetCutoffDateTime(e.target.value)}
                          className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs font-mono"
                        />
                      </div>
                    )}
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-stone-200 hover:border-[#F47B16] cursor-pointer transition-colors bg-stone-50/50">
                  <input
                    type="radio"
                    name="resetMode"
                    value="completed_only"
                    checked={resetMode === 'completed_only'}
                    onChange={() => setResetMode('completed_only')}
                    className="mt-0.5 text-[#F47B16]"
                  />
                  <div>
                    <span className="font-bold text-[#4A2414] block">
                      🧹 Clear Completed / Delivered Orders Only
                    </span>
                    <span className="text-stone-500 text-[11px]">
                      Removes finished orders while keeping ongoing kitchen tickets open.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-red-200 hover:border-red-400 cursor-pointer transition-colors bg-red-50/30">
                  <input
                    type="radio"
                    name="resetMode"
                    value="all"
                    checked={resetMode === 'all'}
                    onChange={() => setResetMode('all')}
                    className="mt-0.5 text-red-600"
                  />
                  <div>
                    <span className="font-bold text-red-800 block">
                      🗑️ Complete Clean Slate (Clear All Orders)
                    </span>
                    <span className="text-red-600/80 text-[11px]">
                      Empties all orders for a brand-new clean daily register.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="w-1/2 py-2 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteReset}
                className="w-1/2 py-2 text-xs font-bold text-white bg-[#4A2414] hover:bg-[#381a0e] rounded-xl shadow-xs"
              >
                Execute Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
