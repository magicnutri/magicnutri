import React from 'react';

interface MagicNutriLogoProps {
  className?: string;
  variant?: 'full' | 'horizontal' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const MagicNutriLogo: React.FC<MagicNutriLogoProps> = ({
  className = '',
  variant = 'full',
  size = 'md',
}) => {
  // If icon only
  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 200 200"
        className={`shrink-0 ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="nutriAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF2D6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFF9EE" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="magicGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9A825" />
            <stop offset="50%" stopColor="#F47B16" />
            <stop offset="100%" stopColor="#D96800" />
          </linearGradient>
          <linearGradient id="hatBrown" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5D2E16" />
            <stop offset="100%" stopColor="#371B0B" />
          </linearGradient>
          <linearGradient id="almondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B2501E" />
            <stop offset="100%" stopColor="#7A300C" />
          </linearGradient>
          <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#58A83A" />
            <stop offset="100%" stopColor="#256B1E" />
          </linearGradient>
        </defs>

        {/* Soft background aura */}
        <circle cx="100" cy="100" r="95" fill="url(#nutriAura)" />

        {/* Golden Magic Swirl Swooshes */}
        <path
          d="M 130 50 C 155 70 145 110 115 118 C 80 126 65 100 78 82 C 86 70 110 75 110 85 C 110 95 90 98 90 106"
          stroke="url(#magicGold)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 68 120 C 58 135 75 145 110 142 C 145 140 152 115 142 98"
          stroke="url(#magicGold)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Golden Sparkles */}
        <path d="M 135 38 L 138 46 L 146 49 L 138 52 L 135 60 L 132 52 L 124 49 L 132 46 Z" fill="#F47B16" />
        <path d="M 152 75 L 154 80 L 159 82 L 154 84 L 152 89 L 150 84 L 145 82 L 150 80 Z" fill="#F9A825" />
        <path d="M 62 70 L 64 74 L 68 75 L 64 76 L 62 80 L 60 76 L 56 75 L 60 74 Z" fill="#F9A825" />

        {/* Green Leaves Behind */}
        <path
          d="M 130 65 C 145 60 152 72 142 85 C 132 82 126 72 130 65 Z"
          fill="url(#leafGrad)"
        />
        <path
          d="M 65 95 C 60 108 72 118 82 112 C 80 100 72 94 65 95 Z"
          fill="url(#leafGrad)"
        />
        <path
          d="M 132 95 C 146 102 142 116 128 118 C 122 108 126 98 132 95 Z"
          fill="url(#leafGrad)"
        />

        {/* Witch/Magic Hat */}
        <path
          d="M 102 38 C 104 38 107 41 108 44 C 114 62 122 75 136 82 C 120 86 85 86 64 82 C 78 75 92 56 99 41 C 100 39 101 38 102 38 Z"
          fill="url(#hatBrown)"
        />
        {/* Hat curved brim */}
        <path
          d="M 52 82 C 80 77 122 77 148 83 C 142 88 115 92 85 91 C 65 90 52 85 52 82 Z"
          fill="#371B0B"
        />
        {/* Hat Sparkle Accent */}
        <path d="M 102 54 L 104 60 L 110 62 L 104 64 L 102 70 L 100 64 L 94 62 L 100 60 Z" fill="#FFF7E8" />

        {/* Roasted Almond (Left) */}
        <path
          d="M 90 85 C 80 92 78 108 86 116 C 94 122 102 112 101 100 C 100 90 95 84 90 85 Z"
          fill="url(#almondGrad)"
        />
        {/* Almond Texture Lines */}
        <path d="M 88 92 C 86 98 87 106 91 112" stroke="#87350F" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M 94 96 C 93 102 95 106 98 109" stroke="#87350F" strokeWidth="1.2" strokeLinecap="round" />

        {/* Roasted Almond (Right) */}
        <path
          d="M 120 90 C 126 96 128 108 122 114 C 116 118 111 110 112 100 C 113 92 117 88 120 90 Z"
          fill="url(#almondGrad)"
        />

        {/* Cream Cashew Nut (Center Front) */}
        <path
          d="M 102 96 C 110 93 118 97 116 106 C 114 113 106 115 100 113 C 94 111 96 104 100 102 C 104 100 102 97 100 97 C 98 97 97 99 97 99 Z"
          fill="#FDEED4"
          stroke="#E2CCA8"
          strokeWidth="1.2"
        />
      </svg>
    );
  }

  // If horizontal variant (for Top Navigation bar)
  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <MagicNutriLogo variant="icon" className="w-10 h-10 shrink-0" />
        <div className="flex flex-col">
          <div className="flex items-center gap-0.5">
            <span className="font-serif font-black tracking-wider text-[#4A2414] text-lg sm:text-xl leading-none">
              MAGIC
            </span>
            <span className="text-xs text-[#2E7D32] ml-0.5 font-bold">🌿</span>
          </div>
          <div className="flex items-center gap-1 -mt-0.5">
            <span className="h-[1.5px] w-3 bg-[#F47B16]" />
            <span className="text-[10px] sm:text-xs font-black tracking-[0.2em] text-[#F47B16] leading-none uppercase">
              NUTRI
            </span>
            <span className="h-[1.5px] w-3 bg-[#F47B16]" />
          </div>
        </div>
      </div>
    );
  }

  // Full Stacked Master Logo (matching the uploaded image exactly)
  const sizeClasses = {
    sm: 'w-36',
    md: 'w-48',
    lg: 'w-64',
    xl: 'w-80',
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${sizeClasses} ${className}`}>
      {/* Upper Logo Mark: Hat, Aura, Nuts & Leaves */}
      <div className="w-3/4 aspect-square relative -mb-2">
        <MagicNutriLogo variant="icon" className="w-full h-full" />
      </div>

      {/* Brand Title: MAGIC with serif flair */}
      <div className="relative flex items-center justify-center">
        <h1 className="text-3xl sm:text-4xl font-serif font-extrabold tracking-widest text-[#4A2414] leading-tight">
          MAGIC
        </h1>
        {/* Leaf embellishment on the C */}
        <svg
          className="w-5 h-5 absolute -right-2 top-1 text-[#2E7D32]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.75C6.2 7.6 5 9.3 5 11c0 2 1.5 3 3 3 2.5 0 6.5-4 9-6z" />
        </svg>
      </div>

      {/* Golden accent bar: — NUTRI — */}
      <div className="flex items-center justify-center gap-2 w-full mt-1">
        <div className="h-[2px] w-8 sm:w-12 bg-[#F47B16] rounded-full" />
        <span className="text-sm sm:text-base font-extrabold tracking-[0.3em] text-[#F47B16] uppercase font-sans">
          NUTRI
        </span>
        <div className="h-[2px] w-8 sm:w-12 bg-[#F47B16] rounded-full" />
      </div>

      {/* Tagline: DIET SNACKS */}
      <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-[#552B18] uppercase mt-1">
        DIET SNACKS
      </span>
    </div>
  );
};
