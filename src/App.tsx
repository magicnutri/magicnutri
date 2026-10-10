import React, { useState, useEffect } from 'react';
import {
  Product,
  ProductCategory,
  Order,
  ScratchCard,
  CustomerProfile,
  Campaign,
  ShopSettings
} from './types';
import { api } from './services/api';
import { soundManager } from './utils/sound';
import { initTheme } from './utils/theme';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SpecialCampaignBanner } from './components/SpecialCampaignBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { CartDrawer, CartItem } from './components/CartDrawer';
import { ScratchCardModal } from './components/ScratchCardModal';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { CustomerAccountDrawer, SettingsDrawerTab } from './components/CustomerAccountDrawer';
import { AdminDashboard } from './components/AdminDashboard';
import { QRCodeModal } from './components/QRCodeModal';
import { HowItWorks } from './components/HowItWorks';
import { Footer } from './components/Footer';

import { Sparkles, QrCode, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Utensils, ShoppingBag } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Filtering states
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All Items'>('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsDrawerTab>('orders');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [activeScratchCard, setActiveScratchCard] = useState<ScratchCard | null>(null);

  // Table QR detection
  const [scannedTable, setScannedTable] = useState<string | undefined>(undefined);

  // Order Confirmation Notice
  const [lastPlacedOrder, setLastPlacedOrder] = useState<{ order: Order; scratchCard: ScratchCard } | null>(null);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);

  const handleOpenAccount = (tab?: SettingsDrawerTab) => {
    if (tab) {
      setSettingsTab(tab);
    } else {
      setSettingsTab(customer ? 'orders' : 'appearance');
    }
    setIsAccountOpen(true);
  };

  const refreshActiveOrdersCount = async (phone: string) => {
    try {
      const orders = await api.getCustomerOrders(phone);
      const active = orders.filter((o) => o.status !== 'Completed' && o.status !== 'Cancelled');
      setActiveOrdersCount(active.length);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    initTheme();
    soundManager.init();
    api.init();

    // Check URL parameters for QR scan (e.g. ?table=Table%202)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tableParam = urlParams.get('table');
      if (tableParam) {
        setScannedTable(tableParam);
      }
    }

    loadData();
    const existingCustomer = api.getCurrentCustomer();
    if (existingCustomer) {
      setCustomer(existingCustomer);
      refreshActiveOrdersCount(existingCustomer.phone);
    }
  }, []);

  const loadData = async () => {
    try {
      const [allProducts, shopSettings, activeCampaign] = await Promise.all([
        api.getProducts(),
        api.getSettings(),
        api.getCampaign()
      ]);
      setProducts(allProducts);
      setSettings(shopSettings);
      setCampaign(activeCampaign);
    } catch {
      // ignore
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx].quantity += quantity;
        return next;
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Order placed handler
  const handleOrderPlaced = (order: Order, scratchCard: ScratchCard) => {
    setLastPlacedOrder({ order, scratchCard });
    // Prompt scratch card modal immediately!
    setActiveScratchCard(scratchCard);
    loadData();
    // Refresh customer balance and active orders count
    if (customer) {
      api.getCustomerProfile(customer.phone).then((p) => {
        if (p) setCustomer(p);
      });
      refreshActiveOrdersCount(customer.phone);
    }
  };

  const handleScratchCompleted = (newBalance: number) => {
    if (customer) {
      setCustomer({ ...customer, totalPointsBalance: newBalance });
      refreshActiveOrdersCount(customer.phone);
    }
    loadData();
  };

  const handleReorder = (items: { productId: string; quantity: number }[]) => {
    items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod && prod.inStock && !prod.comingSoon) {
        handleAddToCart(prod, item.quantity);
      }
    });
    setIsAccountOpen(false);
    setIsCartOpen(true);
  };

  // Filter products
  const categories: (ProductCategory | 'All Items')[] = [
    'All Items',
    'Oats Bowls',
    'Fruit Bowls',
    'Chia and Basil Seed Bowls',
    'Protein Sandwiches',
    'Brown Rice Cake Sandwiches',
    'Sprout Salads',
    'Healthy Snacks'
  ];

  const filteredProducts = products.filter((prod) => {
    if (selectedCategory !== 'All Items' && prod.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchName = prod.name.toLowerCase().includes(query);
      const matchIngredients = prod.ingredients.some((i) => i.toLowerCase().includes(query));
      const matchDesc = prod.description.toLowerCase().includes(query);
      if (!matchName && !matchIngredients && !matchDesc) return false;
    }
    if (selectedTag) {
      if (!prod.dietaryTags?.includes(selectedTag as any)) {
        return false;
      }
    }
    return true;
  });

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FFFDF9] dark:bg-[#15110E] flex flex-col text-[#2C1810] dark:text-[#F3EDE8] transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        cartCount={cartTotalCount}
        customer={customer}
        activeOrderCount={activeOrdersCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAccount={handleOpenAccount}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenQR={() => setIsQROpen(true)}
        scannedTable={scannedTable}
      />

      {/* Hero Section */}
      <Hero
        onExploreMenu={() => {
          const el = document.getElementById('menu-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenQR={() => setIsQROpen(true)}
        scannedTable={scannedTable}
      />

      {/* Special Campaign: 100 Orders = 1 Free Food */}
      {campaign && (
        <div id="special-offer">
          <SpecialCampaignBanner
            campaign={campaign}
            onExploreEligible={() => {
              const el = document.getElementById('menu-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>
      )}

      {/* Order Confirmation Banner if just placed */}
      {lastPlacedOrder && (
        <div className="bg-[#2E7D32] text-white py-3.5 px-4 shadow-sm animate-fadeIn">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#FFD700] shrink-0" />
              <div>
                <span className="font-bold text-sm">
                  Order #{lastPlacedOrder.order.id} Placed Successfully!
                </span>
                <span className="text-xs text-emerald-100 block sm:inline sm:ml-2">
                  Total Payable: ₹{lastPlacedOrder.order.totalAmount}
                  {lastPlacedOrder.order.pointsDiscount > 0 && ` (₹${lastPlacedOrder.order.pointsDiscount} discount applied from ${lastPlacedOrder.order.pointsRedeemed} pts)`} • Pay at Counter
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAccountOpen(true)}
                className="py-1.5 px-3 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Track Live Order Path</span>
              </button>
              <button
                onClick={() => setActiveScratchCard(lastPlacedOrder.scratchCard)}
                className="py-1.5 px-3.5 bg-white text-[#2E7D32] hover:bg-emerald-50 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-4 h-4 text-[#F47B16]" />
                <span>Scratch Card</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Food Menu Section */}
      <main id="menu-section" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#2E7D32]">
              Nutritious & Fresh
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#4A2414] font-display mt-0.5">
              Explore Our Diet Menu
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
              Clean ingredients, high protein options, zero refined sugar. Made fresh to support your fitness and wellbeing goals.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-500">
            <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
            <span>Pay Offline at Counter (No Gateway Fees)</span>
          </div>
        </div>

        {/* Category Filter & Search Bar */}
        <div className="mb-8">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
          />
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
            <p className="text-base font-bold text-[#4A2414]">No diet items match your filter</p>
            <p className="text-xs text-stone-500 mt-1">Try resetting the search or selecting another category.</p>
            <button
              onClick={() => {
                setSelectedCategory('All Items');
                setSearchQuery('');
                setSelectedTag(null);
              }}
              className="mt-4 px-4 py-2 text-xs font-bold bg-[#F47B16] text-white rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-5">
            {filteredProducts.map((product) => {
              const cartItem = cart.find((i) => i.product.id === product.id);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  cartQuantity={cartItem ? cartItem.quantity : 0}
                  onAddToCart={handleAddToCart}
                  onUpdateQuantity={handleUpdateCartQuantity}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* How It Works Section */}
      <div id="how-it-works">
        <HowItWorks />
      </div>

      {/* Footer */}
      {settings && (
        <Footer
          settings={settings}
          onOpenQR={() => setIsQROpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />
      )}

      {/* Sticky Floating View Cart Bottom Bar (Appears after customer adds products to cart) */}
      {cartTotalCount > 0 && !isCartOpen && !isAdminOpen && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-40 transition-all duration-300 animate-slideUp">
          <div
            onClick={() => {
              soundManager.playPop();
              setIsCartOpen(true);
            }}
            className="bg-[#4A2414] dark:bg-[#2C1810] text-white p-3 sm:p-3.5 rounded-2xl shadow-2xl border border-[#F47B16]/50 flex items-center justify-between cursor-pointer hover:shadow-[#F47B16]/30 hover:scale-[1.02] active:scale-[0.99] transition-all group backdrop-blur-md"
            role="button"
            aria-label="View Cart"
          >
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 bg-[#F47B16] rounded-xl text-white shadow-md group-hover:scale-105 transition-transform flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 bg-white text-[#4A2414] font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#4A2414] shadow-xs">
                  {cartTotalCount}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-amber-200/90 font-bold">
                    {cartTotalCount} {cartTotalCount === 1 ? 'item' : 'items'} in cart
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/70 px-1.5 py-0.2 rounded-full border border-emerald-500/40">
                    Pay Offline
                  </span>
                </div>
                <div className="text-base sm:text-lg font-mono font-extrabold text-white leading-tight">
                  ₹{cartSubtotal.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pl-3 border-l border-white/15">
              <span className="text-xs sm:text-sm font-bold text-[#FFD700] group-hover:text-white transition-colors">
                View Cart
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/10 group-hover:bg-[#F47B16] flex items-center justify-center text-white transition-colors shadow-xs">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals & Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        customer={customer}
        onOpenAuth={() => {
          setIsCartOpen(false);
          setIsAuthOpen(true);
        }}
        onOrderPlaced={handleOrderPlaced}
      />

      {activeScratchCard && (
        <ScratchCardModal
          card={activeScratchCard}
          isOpen={Boolean(activeScratchCard)}
          onClose={() => setActiveScratchCard(null)}
          onScratched={handleScratchCompleted}
        />
      )}

      <CustomerAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(prof) => {
          setCustomer(prof);
          loadData();
          refreshActiveOrdersCount(prof.phone);
        }}
      />

      <CustomerAccountDrawer
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        profile={customer}
        initialTab={settingsTab}
        onProfileUpdated={(updated) => setCustomer(updated)}
        onLogout={() => {
          api.logoutCustomer();
          setCustomer(null);
          setIsAccountOpen(false);
          setActiveOrdersCount(0);
        }}
        onOpenScratchCard={(card) => {
          setActiveScratchCard(card);
          setIsAccountOpen(false);
        }}
        onReorder={handleReorder}
        onOpenAuth={() => {
          setIsAccountOpen(false);
          setIsAuthOpen(true);
        }}
      />

      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          loadData();
        }}
        onOpenQRModal={() => {
          setIsAdminOpen(false);
          setIsQROpen(true);
        }}
      />

      <QRCodeModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        onSimulateScan={(table) => {
          setScannedTable(table || 'Counter Table');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
