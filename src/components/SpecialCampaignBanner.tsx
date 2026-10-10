import React, { useState } from 'react';
import { Campaign } from '../types';
import { Gift, Info, ChevronRight, Award, CheckCircle, ShieldAlert } from 'lucide-react';

interface SpecialCampaignBannerProps {
  campaign: Campaign;
  onExploreEligible?: () => void;
}

export const SpecialCampaignBanner: React.FC<SpecialCampaignBannerProps> = ({
  campaign,
  onExploreEligible,
}) => {
  const [showTerms, setShowTerms] = useState(false);

  const percentage = Math.min(100, Math.round((campaign.currentOrderCount / campaign.targetOrders) * 100));

  return (
    <div className="bg-gradient-to-r from-[#FFF7E8] via-[#FDF3E0] to-[#FFF0D4] dark:from-[#201813] dark:via-[#1A1410] dark:to-[#17120E] border-y border-[#F47B16]/20 dark:border-stone-800 py-4 px-4 sm:px-6 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Left info */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F47B16] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-extrabold text-[#F47B16]">
                  Special Mega Draw
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                  Campaign #{campaign.id.slice(-3)}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#4A2414] dark:text-[#FFA756] font-display">
                100 Orders = 1 Lucky Customer Wins Free Food!
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                Every order placed is automatically entered into our server-verified lucky draw.
              </p>
            </div>
          </div>

          {/* Right progress indicator */}
          <div className="w-full md:w-72 bg-white/80 dark:bg-[#1E1815] p-3 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
            <div className="flex justify-between text-xs font-semibold text-[#4A2414] dark:text-[#FFA756] mb-1.5">
              <span>Campaign Progress</span>
              <span className="font-mono text-[#F47B16] font-bold">
                {campaign.currentOrderCount} / {campaign.targetOrders} Orders
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#F47B16] to-[#2E7D32] transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-stone-500 font-medium">
                {campaign.targetOrders - campaign.currentOrderCount} orders till next draw
              </span>
              <button
                onClick={() => setShowTerms(!showTerms)}
                className="text-[#2E7D32] font-bold hover:underline flex items-center gap-0.5"
              >
                <Info className="w-3 h-3" />
                <span>Rules</span>
              </button>
            </div>
          </div>
        </div>

        {/* Winner Announcement if completed */}
        {campaign.status === 'completed' && campaign.winnerCustomerName && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#2E7D32]" />
              <span className="text-xs font-bold text-emerald-900">
                🎉 Lucky Draw Winner: {campaign.winnerCustomerName} (Order #{campaign.winnerOrderId}) won a free {campaign.winningProductName}!
              </span>
            </div>
            {campaign.redeemed ? (
              <span className="text-[11px] bg-green-200 text-green-800 font-bold px-2 py-0.5 rounded">
                Prize Redeemed
              </span>
            ) : (
              <span className="text-[11px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                Awaiting Counter Claim
              </span>
            )}
          </div>
        )}

        {/* Terms Modal / Accordion */}
        {showTerms && (
          <div className="mt-3 p-4 bg-white rounded-xl border border-stone-200 text-xs text-stone-700 space-y-2">
            <h4 className="font-bold text-[#4A2414] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#F47B16]" />
              <span>Official Promotion Terms & Conditions</span>
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-stone-600">
              <li>Each valid customer order placed on Magic Nutri counts as 1 entry in the current 100-order cycle.</li>
              <li>When exactly 100 orders are completed, our server randomly selects 1 order from that batch using an auditable RNG.</li>
              <li>The winning customer receives 1 free menu item (Fit High Protein Chocolate Bowl, Brown Rice Cake Sandwich, or Oats Bowl).</li>
              <li>Prize can be claimed at the Magic Nutri counter by verifying customer phone number.</li>
              <li>Points scratch cards (20–50 points) are issued separately for every order and are independent of this promotional draw.</li>
            </ul>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowTerms(false)}
                className="text-stone-500 font-semibold hover:text-stone-800 text-[11px]"
              >
                Close terms
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
