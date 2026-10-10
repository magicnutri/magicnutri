import React from 'react';
import { QrCode, ShoppingBag, Banknote, Sparkles, Gift } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      icon: QrCode,
      title: 'Scan Shop QR',
      description: 'Point your phone camera at the QR code on your table or shop counter to open our fresh live menu instantly.'
    },
    {
      step: '02',
      icon: ShoppingBag,
      title: 'Order Fresh Meals',
      description: 'Browse wholesome oats bowls, sprouted salads, and healthy brown rice cake sandwiches customized to your taste.'
    },
    {
      step: '03',
      icon: Banknote,
      title: 'Pay at Counter',
      description: 'No online payment required! Simply pay at the counter via Cash or UPI when your food is freshly served.'
    },
    {
      step: '04',
      icon: Sparkles,
      title: 'Scratch & Win Points',
      description: 'Reveal 20 to 50 guaranteed loyalty points immediately after ordering. 100 points = ₹5.00 discount on future meals.'
    },
    {
      step: '05',
      icon: Gift,
      title: 'Win Free Food',
      description: 'Every completed order enters the 100-order lucky draw cycle where 1 winner enjoys a free healthy food meal!'
    }
  ];

  return (
    <section className="py-12 px-4 sm:px-6 bg-[#FFF7E8]/60 dark:bg-[#1E1713]/60 border-y border-stone-200/60 dark:border-stone-800 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#F47B16]">
            Smart Ordering Experience
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#4A2414] dark:text-[#FFA756] font-display mt-1">
            How Magic Nutri Works
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-2">
            Seamless table ordering, zero online payment hassles, and guaranteed scratch rewards with every order.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="relative bg-white dark:bg-[#1C1613] rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-2xs flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-[#F47B16]">
                    {s.step}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#FFF7E8] dark:bg-stone-900 text-[#4A2414] dark:text-[#FFA756] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#F47B16]" />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[#4A2414] dark:text-[#FFA756] font-display">
                  {s.title}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1.5 leading-relaxed">
                  {s.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
