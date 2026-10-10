import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Minus, Info, Check, Flame, Zap } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  cartQuantity: number;
  onAddToCart: (product: Product, quantity: number) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cartQuantity,
  onAddToCart,
  onUpdateQuantity,
}) => {
  const [showIngredients, setShowIngredients] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleAdd = () => {
    if (product.comingSoon || !product.inStock) return;
    onAddToCart(product, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 800);
  };

  return (
    <div className="group relative bg-white dark:bg-[#1C1613] rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full">
      {/* Product Image Frame */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FFF7E8] dark:bg-stone-900">
        {!imageError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          /* Zero-broken-image policy fallback */
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#FFF7E8] to-[#FCE8D5] dark:from-stone-900 dark:to-stone-800 text-stone-700 dark:text-stone-300">
            <div className="w-10 h-10 rounded-full bg-[#F47B16]/20 flex items-center justify-center mb-2">
              <Zap className="w-5 h-5 text-[#F47B16]" />
            </div>
            <span className="text-xs font-bold text-[#4A2414] dark:text-[#FFA756] text-center line-clamp-1">
              {product.name}
            </span>
            <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">Healthy Diet Choice</span>
          </div>
        )}

        {/* Dietary Tag Pill */}
        {product.proteinGrams && (
          <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#FFD700]" />
            <span>{product.proteinGrams}g Protein</span>
          </div>
        )}

        {/* Calories if available */}
        {product.calories && (
          <div className="absolute top-2.5 right-2.5 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xs text-[#4A2414] dark:text-amber-300 text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
            <Flame className="w-3 h-3 text-[#F47B16]" />
            <span>{product.calories} kcal</span>
          </div>
        )}

        {/* Stock status overlay if unavailable */}
        {product.comingSoon ? (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center">
            <span className="bg-[#4A2414] text-[#FFD700] border border-[#FFD700]/40 text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
              ⏳ Coming Soon
            </span>
          </div>
        ) : !product.inStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Sold Out Today
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category kicker */}
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2E7D32] dark:text-[#81C784]">
          {product.category}
        </span>

        {/* Product Title */}
        <h3 className="text-sm font-bold text-[#4A2414] dark:text-[#FFA756] mt-0.5 leading-snug font-display line-clamp-1">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Ingredients toggle */}
        <button
          onClick={() => setShowIngredients(!showIngredients)}
          className="mt-2 text-[11px] font-semibold text-stone-500 dark:text-stone-400 hover:text-[#F47B16] dark:hover:text-[#FFA756] flex items-center gap-1 self-start transition-colors"
        >
          <Info className="w-3 h-3" />
          <span>{showIngredients ? 'Hide ingredients' : 'View ingredients'}</span>
        </button>

        {/* Ingredients dropdown */}
        {showIngredients && (
          <div className="mt-2 p-2 bg-[#FFF7E8]/70 dark:bg-stone-900 border border-[#F47B16]/20 dark:border-stone-800 rounded-lg text-[11px] text-stone-700 dark:text-stone-300">
            <strong>Ingredients: </strong>
            {product.ingredients.join(', ')}
          </div>
        )}

        {/* Bottom Price & Add Action */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-stone-100 dark:border-stone-800">
          <div>
            <span className="text-base font-extrabold text-[#4A2414] dark:text-[#FFA756] font-mono">
              ₹{product.price}
            </span>
            <span className="text-[10px] text-stone-400 block -mt-0.5">
              Net Price (INR)
            </span>
          </div>

          <div>
            {product.comingSoon ? (
              <span className="py-1.5 px-3 text-xs font-bold rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/80 cursor-not-allowed inline-block">
                Coming Soon
              </span>
            ) : !product.inStock ? (
              <span className="text-xs font-medium text-stone-400">Unavailable</span>
            ) : cartQuantity > 0 ? (
              <div className="flex items-center gap-1.5 bg-[#FFF7E8] dark:bg-stone-900 border border-[#F47B16]/30 rounded-xl p-1">
                <button
                  onClick={() => onUpdateQuantity(product.id, -1)}
                  aria-label="Decrease quantity"
                  className="w-7 h-7 rounded-lg bg-white text-[#4A2414] hover:bg-[#F47B16] hover:text-white flex items-center justify-center transition-colors shadow-2xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-extrabold text-[#4A2414] px-1.5 font-mono min-w-5 text-center">
                  {cartQuantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(product.id, 1)}
                  aria-label="Increase quantity"
                  className="w-7 h-7 rounded-lg bg-[#F47B16] text-white hover:bg-[#e06d0f] flex items-center justify-center transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className={`py-2 px-3.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  addedAnimation
                    ? 'bg-[#2E7D32] text-white'
                    : 'bg-[#F47B16] text-white hover:bg-[#e06d0f] shadow-xs active:scale-95'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
