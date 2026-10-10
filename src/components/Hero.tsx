import React from 'react';
import { MagicNutriLogo } from './MagicNutriLogo';
import { Sparkles, QrCode, ArrowDown, Leaf, HeartPulse } from 'lucide-react';

interface HeroProps {
  onExploreMenu: () => void;
  onOpenQR: () => void;
  scannedTable?: string;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreMenu,
  onOpenQR,
  scannedTable,
}) => {
  return (
    <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 bg-gradient-to-b from-[#FFF7E8] via-[#FFFDF9] to-[#FFFDF9] dark:from-[#1E1713] dark:via-[#15110E] dark:to-[#15110E] transition-colors duration-200">
      {/* Decorative subtle background accents */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-[#F47B16]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-[#2E7D32]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              {scannedTable ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2E7D32]/10 dark:bg-[#2E7D32]/25 border border-[#2E7D32]/20 rounded-full text-xs font-bold text-[#2E7D32] dark:text-[#81C784]">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Ordering live for {scannedTable} • Pay at Counter</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFF0D4] dark:bg-amber-950/40 border border-[#F47B16]/20 rounded-full text-xs font-bold text-[#F47B16]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Instant QR Ordering • Digital Scratch Rewards</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-4">
              <MagicNutriLogo variant="icon" className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 drop-shadow-sm" />
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#4A2414] dark:text-[#FFA756] tracking-tight font-display leading-[1.15]">
                  Eat Healthy. <br />
                  <span className="text-[#F47B16]">Live Happy.</span>
                </h1>
              </div>
            </div>

            <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Fresh Ingredients. High Protein. Real Goodness. Nutrient-dense oats bowls, sprouted superfood salads, and brown rice cake sandwiches made fresh on order.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={onExploreMenu}
                className="py-3 px-6 bg-[#F47B16] hover:bg-[#e06d0f] text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2 active:scale-95"
              >
                <span>Explore Our Menu</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenQR}
                className="py-3 px-5 bg-white dark:bg-[#1E1815] hover:bg-stone-50 dark:hover:bg-stone-800 text-[#4A2414] dark:text-stone-200 border border-stone-200 dark:border-stone-800 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-2xs"
              >
                <QrCode className="w-4 h-4 text-[#2E7D32] dark:text-[#81C784]" />
                <span>Shop QR Code</span>
              </button>
            </div>

            {/* Value markers */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-stone-200/60 dark:border-stone-800 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-2 text-left">
                <Leaf className="w-4 h-4 text-[#2E7D32] dark:text-[#81C784] shrink-0" />
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">100% Wholesome</span>
              </div>
              <div className="flex items-center gap-2 text-left">
                <HeartPulse className="w-4 h-4 text-[#F47B16] shrink-0" />
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">High Protein</span>
              </div>
              <div className="flex items-center gap-2 text-left">
                <Sparkles className="w-4 h-4 text-[#FFD700] shrink-0" />
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">Scratch & Earn</span>
              </div>
            </div>
          </div>

          {/* Right Hero Image Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden shadow-xl border-4 border-white dark:border-stone-800 bg-white dark:bg-stone-900">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80"
                alt="Magic Nutri healthy spread"
                referrerPolicy="no-referrer"
                className="w-full h-80 sm:h-96 object-cover"
              />

              {/* Floating Hero Card Overlay */}
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 dark:bg-[#1C1613]/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#2E7D32] dark:text-[#81C784] tracking-wider block">
                    Featured Healthy Diet
                  </span>
                  <h4 className="text-xs sm:text-sm font-extrabold text-[#4A2414] dark:text-[#FFA756] font-display">
                    Fit High Protein Chocolate Bowl
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">22g Protein • Rolled Oats & Raw Cacao</p>
                </div>
                <div className="text-right pl-2">
                  <span className="text-sm sm:text-base font-extrabold text-[#F47B16] font-mono">
                    ₹79
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
