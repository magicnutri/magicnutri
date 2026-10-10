import React from 'react';
import { ShopSettings } from '../types';
import { MagicNutriLogo } from './MagicNutriLogo';
import { MapPin, Phone, Clock, Sparkles, Heart } from 'lucide-react';

interface FooterProps {
  settings: ShopSettings;
  onOpenQR: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenQR,
  onOpenAdmin,
}) => {
  return (
    <footer className="bg-[#2C1810] text-[#FFF7E8] pt-12 pb-8 border-t border-[#4A2414]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="bg-white/5 p-2 rounded-xl inline-block">
              <MagicNutriLogo variant="horizontal" className="[&_span]:text-white [&_span.text-\[\#F47B16\]]:text-[#FFD700]" />
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              {settings.shopTagline} Wholesome diet foods, high-protein breakfast bowls, and sprouted healthy snacks.
            </p>
            <div className="pt-1">
              <span className="text-[11px] bg-white/10 px-2.5 py-1 rounded-full text-amber-200 font-semibold inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#FFD700]" />
                100 Points = ₹5.00 Loyalty Value
              </span>
            </div>
          </div>

          {/* Location & Hours */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFD700]">
              Visit Our Shop
            </h4>
            <div className="flex items-start gap-2 text-xs text-stone-300">
              <MapPin className="w-4 h-4 text-[#F47B16] shrink-0 mt-0.5" />
              <span>{settings.address}</span>
            </div>
            <a
              href={`tel:${settings.phone}`}
              className="flex items-center gap-2 text-xs text-stone-300 hover:text-white transition-colors"
            >
              <Phone className="w-4 h-4 text-[#2E7D32] shrink-0" />
              <span>{settings.phone}</span>
            </a>
          </div>

          {/* Timings */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFD700]">
              Kitchen Timings
            </h4>
            <div className="flex items-start gap-2 text-xs text-stone-300">
              <Clock className="w-4 h-4 text-[#F47B16] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">{settings.openingHours}</p>
                <p className="text-[11px] text-stone-400 mt-0.5">Dine-in & Counter Pickup Available</p>
              </div>
            </div>
          </div>

          {/* Quick Access */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFD700]">
              Shop Quick Tools
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-300">
              <li>
                <button onClick={onOpenQR} className="hover:text-amber-200 transition-colors">
                  Generate / Print Shop Table QR
                </button>
              </li>
              <li>
                <button onClick={onOpenAdmin} className="hover:text-amber-200 transition-colors">
                  Owner Admin Portal
                </button>
              </li>
              <li>
                <a href="#special-offer" className="hover:text-amber-200 transition-colors">
                  100-Order Lucky Draw Guidelines
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 gap-3">
          <p>© {new Date().getFullYear()} Magic Nutri. All rights reserved. Built for healthy living.</p>
          <div className="flex items-center gap-1 text-stone-400">
            <span>Freshly crafted with</span>
            <Heart className="w-3 h-3 text-[#F47B16] fill-[#F47B16]" />
            <span>in Godda & Dumka, Jharkhand, India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
