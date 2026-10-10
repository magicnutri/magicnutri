import React, { useState, useEffect } from 'react';
import { CustomerProfile, Order, ScratchCard, Product } from '../types';
import { api } from '../services/api';
import { soundManager } from '../utils/sound';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Utensils,
  Store,
  CheckCircle2,
  Coins,
  LogIn
} from 'lucide-react';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  customer: CustomerProfile | null;
  onOpenAuth: () => void;
  onOrderPlaced: (order: Order, scratchCard: ScratchCard) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  customer,
  onOpenAuth,
  onOrderPlaced,
}) => {
  const [orderType, setOrderType] = useState<'dine-in' | 'pickup'>('dine-in');
  const [tableNumber, setTableNumber] = useState('Table 1');
  const [notes, setNotes] = useState('');

  // Points redemption state
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [customPointsInput, setCustomPointsInput] = useState<string>('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Conversion rule: 20 points = ₹1 (100 points = ₹5)
  const availablePoints = customer ? customer.totalPointsBalance : 0;
  // Maximum allowed discount: 50% of subtotal
  const maxAllowedDiscountInRupees = Math.floor(subtotal * 0.5);
  const maxUsablePoints = Math.min(availablePoints, maxAllowedDiscountInRupees * 20);

  // Synchronize points to redeem whenever cart changes
  useEffect(() => {
    if (pointsToRedeem > maxUsablePoints) {
      setPointsToRedeem(maxUsablePoints);
      setCustomPointsInput(maxUsablePoints.toString());
    }
  }, [maxUsablePoints, pointsToRedeem]);

  if (!isOpen) return null;

  // Real-time monetary discount calculation
  const discountInRupees = Number((pointsToRedeem / 20).toFixed(2));
  const totalAmount = Math.max(0, Number((subtotal - discountInRupees).toFixed(2)));

  const handleApplyPresetPoints = (pts: number) => {
    const validPts = Math.min(pts, maxUsablePoints);
    setPointsToRedeem(validPts);
    setCustomPointsInput(validPts.toString());
  };

  const handleCustomPointsChange = (valStr: string) => {
    setCustomPointsInput(valStr);
    const parsed = parseInt(valStr.replace(/\D/g, '') || '0', 10);
    const clamped = Math.min(parsed, maxUsablePoints);
    setPointsToRedeem(clamped);
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    setError('');

    if (!customer) {
      onOpenAuth();
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await api.createOrder({
        customerPhone: customer.phone,
        customerName: customer.name,
        items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        orderType,
        tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
        notes: notes.trim() || undefined,
        pointsToRedeem: pointsToRedeem > 0 ? pointsToRedeem : undefined,
      });

      soundManager.playOrderSuccess();
      onClearCart();
      setPointsToRedeem(0);
      onClose();
      onOrderPlaced(result.order, result.scratchCard);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to place order.');
      } else {
        setError('Failed to place order.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md h-full bg-[#FFFDF9] dark:bg-[#181311] text-[#2C1810] dark:text-[#F3EDE8] flex flex-col shadow-2xl overflow-hidden transition-colors duration-200">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 bg-[#FFF7E8] dark:bg-[#201814] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#F47B16]" />
            <h3 className="text-base font-bold text-[#4A2414] dark:text-[#FFA756] font-display">
              Your Diet Basket
            </h3>
            <span className="text-xs bg-[#F47B16]/10 text-[#F47B16] font-bold px-2 py-0.5 rounded-full">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} items
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="py-20 text-center text-stone-500">
              <ShoppingBag className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-700 mb-3" />
              <p className="text-base font-bold text-[#4A2414] dark:text-[#FFA756]">Your basket is empty</p>
              <p className="text-xs text-stone-400 mt-1">Explore our healthy bowls and sandwiches to get started!</p>
            </div>
          ) : (
            <>
              {/* Product items */}
              <div className="space-y-2.5">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-3 p-3 bg-white dark:bg-[#1E1815] rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-lg object-cover shrink-0 bg-stone-100 dark:bg-stone-800"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#4A2414] dark:text-[#FFA756] truncate">
                        {item.product.name}
                      </h4>
                      <span className="text-xs font-bold text-[#2E7D32] dark:text-[#81C784] font-mono">
                        ₹{item.product.price}
                      </span>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, -1)}
                            className="p-1 rounded text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-1.5 font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, 1)}
                            className="p-1 rounded text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-stone-400 hover:text-red-600 dark:hover:text-red-400 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order options: Dine-in vs Takeaway */}
              <div className="pt-1">
                <label className="block text-xs font-bold text-[#4A2414] mb-2 uppercase tracking-wider">
                  Order Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType('dine-in')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                      orderType === 'dine-in'
                        ? 'border-[#2E7D32] bg-[#2E7D32]/10 text-[#2E7D32] shadow-2xs'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Utensils className="w-4 h-4" />
                    <span>Dine-in at Shop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('pickup')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                      orderType === 'pickup'
                        ? 'border-[#2E7D32] bg-[#2E7D32]/10 text-[#2E7D32] shadow-2xs'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>Takeaway / Pickup</span>
                  </button>
                </div>

                {orderType === 'dine-in' && (
                  <div className="mt-2.5">
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Table Number
                    </label>
                    <select
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="w-full text-xs font-medium bg-white border border-stone-200 rounded-lg p-2 focus:ring-1 focus:ring-[#2E7D32]"
                    >
                      <option value="Table 1">Table 1</option>
                      <option value="Table 2">Table 2</option>
                      <option value="Table 3">Table 3</option>
                      <option value="Table 4">Table 4</option>
                      <option value="Table 5">Table 5</option>
                      <option value="Table 6">Table 6</option>
                      <option value="Counter Table">Counter / Bar Stool</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Special instructions */}
              <div>
                <label className="block text-xs font-bold text-[#4A2414] mb-1.5 uppercase tracking-wider">
                  Special Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Less sweet, extra roasted almonds, no dairy"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#F47B16]"
                />
              </div>

              {/* PROMINENT POINTS TO MONEY DISCOUNT SECTION */}
              {customer ? (
                <div className="p-3.5 bg-gradient-to-br from-[#FFF9EE] to-[#FFF2DB] rounded-2xl border-2 border-[#F47B16]/30 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#F47B16] text-white flex items-center justify-center shadow-2xs">
                        <Coins className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-[#4A2414] uppercase tracking-wide">
                          Redeem Points For Money Discount
                        </h4>
                        <p className="text-[11px] text-stone-600">
                          Available: <strong className="font-mono text-[#F47B16]">{availablePoints} pts</strong> (worth ₹{(availablePoints / 20).toFixed(2)})
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-[#2E7D32]/10 text-[#2E7D32] font-bold px-2 py-0.5 rounded">
                      20 pts = ₹1.00
                    </span>
                  </div>

                  {availablePoints >= 20 ? (
                    <div className="space-y-2.5 pt-1">
                      {/* Preset quick buttons */}
                      <div className="grid grid-cols-4 gap-1.5 text-xs">
                        <button
                          type="button"
                          onClick={() => handleApplyPresetPoints(0)}
                          className={`py-1.5 px-1 rounded-lg font-bold border transition-all text-center ${
                            pointsToRedeem === 0
                              ? 'bg-[#4A2414] text-white border-[#4A2414]'
                              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          ₹0 Off
                        </button>
                        {maxUsablePoints >= 20 && (
                          <button
                            type="button"
                            onClick={() => handleApplyPresetPoints(20)}
                            className={`py-1.5 px-1 rounded-lg font-bold border transition-all text-center ${
                              pointsToRedeem === 20
                                ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                            }`}
                          >
                            -₹1.00
                          </button>
                        )}
                        {maxUsablePoints >= 40 && (
                          <button
                            type="button"
                            onClick={() => handleApplyPresetPoints(40)}
                            className={`py-1.5 px-1 rounded-lg font-bold border transition-all text-center ${
                              pointsToRedeem === 40
                                ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                            }`}
                          >
                            -₹2.00
                          </button>
                        )}
                        {maxUsablePoints >= 100 && (
                          <button
                            type="button"
                            onClick={() => handleApplyPresetPoints(100)}
                            className={`py-1.5 px-1 rounded-lg font-bold border transition-all text-center ${
                              pointsToRedeem === 100
                                ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                            }`}
                          >
                            -₹5.00
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleApplyPresetPoints(maxUsablePoints)}
                          className={`py-1.5 px-1 rounded-lg font-bold border transition-all text-center col-span-4 ${
                            pointsToRedeem === maxUsablePoints && maxUsablePoints > 0
                              ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                              : 'bg-white text-[#2E7D32] border-[#2E7D32]/30 hover:bg-emerald-50'
                          }`}
                        >
                          🔥 Redeem Maximum ({maxUsablePoints} pts = -₹{(maxUsablePoints / 20).toFixed(2)})
                        </button>
                      </div>

                      {/* Custom points input */}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[11px] text-stone-600 font-semibold shrink-0">
                          Custom Points:
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={maxUsablePoints}
                          step={5}
                          value={customPointsInput}
                          onChange={(e) => handleCustomPointsChange(e.target.value)}
                          className="w-24 px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-mono font-bold text-[#4A2414] text-center"
                        />
                        <span className="text-[11px] text-stone-500 font-mono">
                          = ₹{discountInRupees.toFixed(2)} off
                        </span>
                      </div>

                      {/* Active discount status banner */}
                      {pointsToRedeem > 0 ? (
                        <div className="p-2 bg-emerald-100/70 border border-emerald-300 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-900">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
                            <span>{pointsToRedeem} points applied</span>
                          </span>
                          <span className="font-mono text-[#2E7D32] text-sm">
                            -₹{discountInRupees.toFixed(2)} DISCOUNT
                          </span>
                        </div>
                      ) : (
                        <p className="text-[11px] text-stone-500">
                          Choose points above to deduct cash from your order total.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-2.5 bg-amber-50/80 rounded-xl text-[11px] text-stone-600">
                      You have <strong>{availablePoints} points</strong>. Minimum 20 points (₹1.00) needed to discount. Place this order to scratch and earn 20–50 points!
                    </div>
                  )}
                </div>
              ) : (
                /* Unauthenticated customer banner inviting them to redeem points */
                <div className="p-3.5 bg-gradient-to-br from-[#FFF7E8] to-[#FDF1D8] rounded-2xl border-2 border-[#F47B16]/30 shadow-xs space-y-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#F47B16] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#4A2414] uppercase">
                        Have Points To Discount Your Bill?
                      </h4>
                      <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
                        Log in with your phone to deduct your loyalty points directly from this order total (100 pts = ₹5.00)!
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="w-full py-2 px-3 text-xs font-bold text-[#F47B16] bg-white border border-[#F47B16]/30 hover:bg-[#FFF7E8] rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Log In to Redeem Points & Get Discount</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Cart Bottom Summary & Checkout */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-[#181311] space-y-3">
            {error && (
              <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Items Subtotal</span>
                <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">₹{subtotal.toFixed(2)}</span>
              </div>

              {/* Explicit points discount line item */}
              {discountInRupees > 0 && (
                <div className="flex justify-between text-[#2E7D32] dark:text-[#81C784] font-bold bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <span className="flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-[#F47B16]" />
                    <span>Points Discount ({pointsToRedeem} pts)</span>
                  </span>
                  <span className="font-mono text-sm">-₹{discountInRupees.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-bold text-[#4A2414] dark:text-[#FFA756] pt-2 border-t border-stone-100 dark:border-stone-800">
                <div>
                  <span>Total Payable at Counter</span>
                  <span className="block text-[10px] text-stone-400 font-normal">
                    {orderType === 'dine-in' ? `${tableNumber} • Dine-in` : 'Takeaway Pickup'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-lg text-[#2E7D32] dark:text-[#81C784] font-black">
                    ₹{totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Offline Payment Note as required by brief */}
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-200 leading-tight">
              <strong>💵 Pay at Counter (Offline):</strong> No online payment required now. Pay ₹{totalAmount.toFixed(2)} directly at the counter with Cash or UPI upon pickup.
            </div>

            {customer ? (
              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 text-sm font-bold text-white bg-[#F47B16] hover:bg-[#e06d0f] rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 active:scale-98"
              >
                <span>{isSubmitting ? 'Placing Order...' : `Confirm & Place Order (₹${totalAmount.toFixed(2)})`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="w-full py-3.5 px-4 text-sm font-bold text-white bg-[#4A2414] hover:bg-[#381a0e] rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Sign In to Place Order</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
