import React, { useState, useEffect } from 'react';
import { CustomerProfile } from '../types';
import { api } from '../services/api';
import { MagicNutriLogo } from './MagicNutriLogo';
import { X, User, KeyRound, ShieldCheck, ArrowRight, MessageSquare, RotateCw } from 'lucide-react';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: CustomerProfile) => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [smsNotification, setSmsNotification] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(30);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.requestOtp(cleanPhone);
      setSmsNotification(res.simulatedSms);
      setOtp(''); // strictly empty: user must input real received OTP
      setCountdown(30);
      setStep('otp');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to dispatch OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || loading) return;
    setError('');
    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const res = await api.requestOtp(cleanPhone);
      setSmsNotification(res.simulatedSms);
      setCountdown(30);
      setOtp('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Could not resend code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      await api.verifyOtp(cleanPhone, otp.trim());
      const profile = await api.loginCustomer(cleanPhone, name);
      onSuccess(profile);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid OTP code. Please enter the valid code sent to your phone.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-[#FFFDF9] dark:bg-[#181311] text-[#2C1810] dark:text-[#F3EDE8] rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200/60 dark:border-stone-800 bg-[#FFF7E8] dark:bg-[#201814]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#2E7D32] dark:text-[#81C784]" />
            <h3 className="text-sm font-bold text-[#4A2414] dark:text-[#FFA756] uppercase tracking-wide">
              {step === 'phone' ? 'Customer Sign In' : 'Verify Mobile OTP'}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <div className="flex justify-center mb-3">
            <MagicNutriLogo variant="full" size="sm" className="scale-85 -my-3" />
          </div>

          <div className="text-center mb-4">
            <h4 className="text-base font-bold text-[#4A2414] dark:text-[#FFA756] font-display">
              {step === 'phone' ? 'Log in to Order & Save Money' : 'Enter 6-Digit OTP'}
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
              {step === 'phone'
                ? 'Convert points to money discounts (100 pts = ₹5) & earn scratch cards.'
                : `Enter the verification code sent to +91 ${phone.slice(-10)}`}
            </p>
          </div>

          {/* Realistic SMS Incoming Push Notification */}
          {step === 'otp' && smsNotification && (
            <div className="mb-4 p-3 bg-[#2C1810] dark:bg-stone-900 text-[#FFF7E8] rounded-xl border border-[#FFD700]/30 shadow-md">
              <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#F47B16]" />
                  <span>SMS from MAGIC NUTRI</span>
                </span>
                <span className="text-stone-400 text-[10px]">Just now</span>
              </div>
              <p className="text-xs text-stone-200 dark:text-stone-300 font-mono leading-relaxed">
                {smsNotification}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F47B16]/30 focus:border-[#F47B16]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Mobile Number (for Order Updates & OTP)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-stone-500 dark:text-stone-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-3.5 py-2.5 text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F47B16]/30 focus:border-[#F47B16]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 mt-2 text-sm font-bold text-white bg-[#F47B16] hover:bg-[#e06d0f] rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Sending Code...' : 'Get OTP on Phone'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  6-Digit OTP Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                    className="w-full pl-10 pr-3.5 py-2.5 text-center tracking-widest text-lg font-mono font-bold bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 px-1">
                  <span>Didn't receive SMS?</span>
                  {countdown > 0 ? (
                    <span className="text-stone-400 font-mono">
                      Resend in {countdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="text-[#F47B16] font-bold hover:underline flex items-center gap-1"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>Resend OTP</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                  }}
                  className="w-1/3 py-2.5 px-3 text-xs font-semibold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors"
                >
                  Change No.
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-2/3 py-2.5 px-4 text-sm font-bold text-white bg-[#2E7D32] hover:bg-[#256628] rounded-xl shadow-md transition-colors disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-5 pt-4 border-t border-stone-200/60 dark:border-stone-800 text-center">
            <span className="text-[11px] text-stone-500 dark:text-stone-400">
              🔒 100% Genuine OTP verification • Direct to customer's mobile
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
