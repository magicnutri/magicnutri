import React, { useState, useEffect } from 'react';
import { CustomerProfile } from '../types';
import { MagicNutriLogo } from './MagicNutriLogo';
import { ShoppingBag, User, ShieldCheck, QrCode, Sparkles, Sun, Moon, Settings as SettingsIcon, Tag } from 'lucide-react';
import { ThemeMode, getStoredTheme, applyTheme } from '../utils/theme';
import { SettingsDrawerTab } from './CustomerAccountDrawer';

interface NavbarProps {
  cartCount: number;
  customer: CustomerProfile | null;
  activeOrderCount?: number;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenAccount: (tab?: SettingsDrawerTab) => void;
  onOpenAdmin: () => void;
  onOpenQR: () => void;
  scannedTable?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  customer,
  activeOrderCount = 0,
  onOpenCart,
  onOpenAuth,
  onOpenAccount,
  onOpenAdmin,
  onOpenQR,
  scannedTable,
}) => {
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme);

  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const custom = e as CustomEvent<{ mode: ThemeMode }>;
      if (custom.detail?.mode) {
        setTheme(custom.detail.mode);
      }
    };
    window.addEventListener('magic-nutri-theme-change', handleThemeChange);
    return () => window.removeEventListener('magic-nutri-theme-change', handleThemeChange);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 dark:bg-[#181311]/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Official Brand Logo Lockup */}
        <div className="flex items-center gap-2 shrink-0">
          <a href="#" className="flex items-center gap-2 group">
            <MagicNutriLogo variant="horizontal" className="group-hover:scale-102 transition-transform" />
            {scannedTable && (
              <span className="hidden sm:inline-block text-[10px] bg-[#2E7D32]/10 dark:bg-[#2E7D32]/30 text-[#2E7D32] dark:text-[#81C784] border border-[#2E7D32]/20 font-bold px-2 py-0.5 rounded-full ml-1">
                {scannedTable}
              </span>
            )}
          </a>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-stone-600 dark:text-stone-300">
          <a href="#menu-section" className="hover:text-[#F47B16] transition-colors whitespace-nowrap shrink-0">
            Fresh Menu
          </a>
          <button
            onClick={() => onOpenAccount('orders')}
            className="hover:text-[#F47B16] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 text-stone-700 dark:text-stone-300"
          >
            <span>Orders & Path</span>
            {activeOrderCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                {activeOrderCount} Live
              </span>
            )}
          </button>
          <button
            onClick={() => onOpenAccount('offers')}
            className="hover:text-[#F47B16] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
          >
            <Tag className="w-3.5 h-3.5 text-[#F47B16]" />
            <span>Offers & Draw</span>
          </button>
          <a href="#how-it-works" className="hover:text-[#F47B16] transition-colors whitespace-nowrap shrink-0">
            How It Works
          </a>
          <button
            onClick={onOpenQR}
            className="hover:text-[#2E7D32] dark:hover:text-[#81C784] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 text-stone-600 dark:text-stone-300"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Shop QR</span>
          </button>
        </nav>

        {/* Zone 3: Actions (Theme, Settings, Customer, Cart, Admin) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Active order quick chip */}
          {customer && activeOrderCount > 0 && (
            <button
              onClick={() => onOpenAccount('orders')}
              className="hidden sm:flex items-center gap-1.5 py-1.5 px-2.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold animate-pulse hover:bg-emerald-100 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{activeOrderCount} Live Order</span>
            </button>
          )}

          {/* Quick Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 text-stone-600 dark:text-stone-300 hover:text-[#F47B16] hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-stone-600" />
            )}
          </button>

          {/* Settings & Rewards Hub Button */}
          <button
            onClick={() => onOpenAccount('appearance')}
            title="App Settings & Preferences"
            className="p-2 text-stone-600 dark:text-stone-300 hover:text-[#F47B16] hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {/* Customer button */}
          {customer ? (
            <button
              onClick={() => onOpenAccount('account')}
              className="flex items-center gap-1.5 py-1.5 px-3 bg-[#FFF7E8] dark:bg-stone-900 border border-[#F47B16]/30 text-[#4A2414] dark:text-[#FFA756] rounded-xl hover:bg-[#FCE8D5] dark:hover:bg-stone-800 transition-colors text-xs font-bold"
            >
              <User className="w-3.5 h-3.5 text-[#F47B16]" />
              <span className="font-mono text-[#2E7D32] dark:text-[#81C784]">{customer.totalPointsBalance} pts</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="py-1.5 px-3 text-xs font-bold text-stone-700 dark:text-stone-200 hover:text-[#4A2414] hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors flex items-center gap-1"
            >
              <User className="w-3.5 h-3.5" />
              <span>Log in</span>
            </button>
          )}

          {/* Cart button */}
          <button
            onClick={onOpenCart}
            aria-label="Open Cart"
            className="relative py-2 px-3.5 bg-[#F47B16] hover:bg-[#e06d0f] text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Basket</span>
            {cartCount > 0 && (
              <span className="bg-white text-[#F47B16] font-mono text-[11px] font-extrabold px-1.5 py-0.2 rounded-full shadow-2xs">
                {cartCount}
              </span>
            )}
          </button>

          {/* Admin link */}
          <button
            onClick={onOpenAdmin}
            title="Owner Portal"
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

