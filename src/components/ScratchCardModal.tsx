import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { ScratchCard } from '../types';
import { api } from '../services/api';
import { soundManager } from '../utils/sound';
import { MagicNutriLogo } from './MagicNutriLogo';
import { Sparkles, Volume2, VolumeX, X, Trophy, CheckCircle } from 'lucide-react';

interface ScratchCardModalProps {
  card: ScratchCard;
  isOpen: boolean;
  onClose: () => void;
  onScratched?: (newBalance: number) => void;
}

export const ScratchCardModal: React.FC<ScratchCardModalProps> = ({
  card,
  isOpen,
  onClose,
  onScratched,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercentage, setScratchedPercentage] = useState(0);
  const [isRevealed, setIsRevealed] = useState(card.isScratched);
  const [isMuted, setIsMuted] = useState(soundManager.isMuted());
  const [saving, setSaving] = useState(false);

  const pointsWon = card.pointsWon;
  const rupeeValue = card.rupeeValue;

  const handleRevealReward = useCallback(async () => {
    if (isRevealed) return;
    setIsRevealed(true);
    soundManager.playRewardFanfare();

    try {
      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F47B16', '#2E7D32', '#FFD700', '#F59E0B']
      });
    } catch {
      // ignore
    }

    setSaving(true);
    try {
      const res = await api.scratchCard(card.id);
      if (onScratched) {
        onScratched(res.newBalance);
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }, [card.id, isRevealed, onScratched]);

  // Canvas drawing & scratch logic
  useEffect(() => {
    if (!isOpen) return;

    if (card.isScratched) {
      setIsRevealed(true);
      return;
    }

    setIsRevealed(false);
    setScratchedPercentage(0);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset composite operation to draw the cover
    ctx.globalCompositeOperation = 'source-over';

    const width = canvas.width;
    const height = canvas.height;

    // Create luxurious gold-green metallic gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#B8860B'); // Dark goldenrod
    gradient.addColorStop(0.3, '#FFD700'); // Gold
    gradient.addColorStop(0.5, '#2E7D32'); // Brand Emerald Green
    gradient.addColorStop(0.75, '#FFD700'); // Gold
    gradient.addColorStop(1, '#996515'); // Deep Gold

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle diagonal scratch card security pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    for (let x = -height; x < width + height; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + height, height);
      ctx.stroke();
    }

    // Border highlight
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, width - 8, height - 8);

    // Cover Text
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 6;
    ctx.fillText('✨ MAGIC NUTRI REWARDS ✨', width / 2, height / 2 - 18);

    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#FFF7E8';
    ctx.fillText('Scratch here to reveal 20-50 pts', width / 2, height / 2 + 12);
    ctx.shadowBlur = 0;
  }, [isOpen, card.isScratched]);

  // Scratch action
  const scratchAt = (clientX: number, clientY: number) => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();

    soundManager.playScratch();

    // Calculate scratched area percentage approximately every few strokes
    if (Math.random() > 0.4) {
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imgData.data;
        let transparent = 0;
        const total = pixels.length / 4;
        for (let i = 3; i < pixels.length; i += 16) {
          if (pixels[i] < 128) {
            transparent++;
          }
        }
        const pct = Math.round((transparent / (total / 4)) * 100);
        setScratchedPercentage(pct);
        if (pct >= 40) {
          handleRevealReward();
        }
      } catch {
        // ignore
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsScratching(true);
    scratchAt(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isScratching) return;
    scratchAt(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    setIsScratching(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setIsScratching(true);
    if (e.touches[0]) {
      scratchAt(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isScratching) return;
    if (e.touches[0]) {
      scratchAt(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-[#FFFDF9] rounded-2xl shadow-2xl border border-[#F47B16]/20 overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-200/60 bg-[#FFF7E8]">
          <div className="flex items-center gap-2">
            <MagicNutriLogo variant="icon" className="w-6 h-6" />
            <h3 className="text-xs font-bold tracking-tight text-[#4A2414] uppercase">
              Magic Nutri Rewards
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
              className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-5 text-center">
          <p className="text-xs text-stone-600 mb-3 font-medium">
            Order #{card.orderId} • Guaranteed reward on every order
          </p>

          {/* Scratch Card Frame */}
          <div className="relative w-full h-56 mx-auto rounded-xl overflow-hidden shadow-inner border border-stone-200 bg-gradient-to-br from-[#FFF7E8] to-[#FDF1D8]">
            {/* Underlying Prize Layer */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center select-none">
              <div className="w-12 h-12 mb-2 rounded-full bg-[#2E7D32]/10 flex items-center justify-center">
                <Trophy className="w-7 h-7 text-[#2E7D32]" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#F47B16]">
                Congratulations!
              </span>
              <div className="text-3xl font-extrabold text-[#4A2414] tracking-tight my-1">
                +{pointsWon} Points
              </div>
              <div className="text-sm font-semibold text-[#2E7D32]">
                ₹{rupeeValue.toFixed(2)} Reward Value
              </div>
              <span className="text-[11px] text-stone-500 mt-1">
                (100 Points = ₹5.00 discount)
              </span>
            </div>

            {/* Canvas Scratch Cover Layer */}
            {!isRevealed && (
              <canvas
                ref={canvasRef}
                width={340}
                height={224}
                className="absolute inset-0 w-full h-full cursor-pointer touch-none-action"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
              />
            )}
          </div>

          {/* Footer controls */}
          <div className="mt-4 flex flex-col gap-2">
            {!isRevealed ? (
              <>
                <p className="text-xs text-stone-500">
                  {scratchedPercentage > 0
                    ? `Scratched: ${scratchedPercentage}% (auto-reveals at 40%)`
                    : 'Use your finger or mouse to scratch the gold card!'}
                </p>
                <button
                  onClick={handleRevealReward}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-[#F47B16] bg-[#F47B16]/10 hover:bg-[#F47B16]/15 rounded-xl transition-colors"
                >
                  Quick Reveal
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#2E7D32]">
                  <CheckCircle className="w-4 h-4" />
                  <span>+{pointsWon} points added to your loyalty balance!</span>
                </div>
                <button
                  onClick={onClose}
                  disabled={saving}
                  className="w-full py-3 px-4 text-sm font-bold text-white bg-[#2E7D32] hover:bg-[#256628] rounded-xl shadow-md transition-colors"
                >
                  Done & Continue
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
