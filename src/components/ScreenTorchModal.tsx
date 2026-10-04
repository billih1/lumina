import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sun, Sliders, Flame, Moon, Sparkles } from 'lucide-react';
import { audioHaptics } from '../utils/audioHaptics';

interface ScreenTorchModalProps {
  isOpen: boolean;
  onClose: () => void;
  kelvin: number;
  onKelvinChange: (kelvin: number) => void;
  kelvinColorHex: string;
}

export const ScreenTorchModal: React.FC<ScreenTorchModalProps> = ({
  isOpen,
  onClose,
  kelvin,
  onKelvinChange,
  kelvinColorHex,
}) => {
  const [screenBrightness, setScreenBrightness] = useState<number>(100);
  const [isHudVisible, setIsHudVisible] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleToggleHud = () => {
    setIsHudVisible((prev) => !prev);
    audioHaptics.playSliderTick();
  };

  const presets = [
    { name: 'Warm Bedside', k: 2200, hex: '#ff9a3d' },
    { name: 'Paper White', k: 4500, hex: '#ffeecc' },
    { name: 'Pure Studio', k: 6500, hex: '#ffffff' },
    { name: 'Night Crimson', k: 1200, hex: '#ff1e1e' },
  ];

  return (
    <div
      onClick={handleToggleHud}
      className="fixed inset-0 z-50 flex flex-col justify-between p-6 select-none cursor-pointer bg-black"
    >
      {/* Dynamic Lantern Light Layer - Smoothly dims with screenBrightness */}
      <div
        className="absolute inset-0 transition-opacity duration-150 pointer-events-none"
        style={{
          backgroundColor: kelvinColorHex,
          opacity: Math.max(0.04, screenBrightness / 100),
        }}
      />

      {/* HUD overlay - click inside stops propagation */}
      <AnimatePresence>
        {isHudVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md mx-auto flex items-center justify-between p-4 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/20 text-white shadow-2xl"
          >
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Display Photonic Lantern
              </h3>
              <p className="text-[11px] text-slate-400 font-mono-tabular">
                Tap anywhere to toggle minimal screen mode
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                audioHaptics.playModeTap();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom HUD Controls */}
      <AnimatePresence>
        {isHudVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md mx-auto p-5 rounded-3xl bg-black/80 backdrop-blur-2xl border border-white/20 text-white shadow-2xl space-y-4"
          >
            {/* Screen Luminance Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                  <span>Display Luminance</span>
                </span>
                <span className="font-mono-tabular font-bold">
                  {screenBrightness}%
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="100"
                value={screenBrightness}
                onChange={(e) => {
                  setScreenBrightness(Number(e.target.value));
                  audioHaptics.playSliderTick();
                }}
                className="w-full"
              />
            </div>

            {/* Presets */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
              {presets.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    onKelvinChange(p.k);
                    audioHaptics.playModeTap();
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-medium transition-all flex flex-col items-center gap-1 ${
                    Math.abs(kelvin - p.k) < 100
                      ? 'bg-white/30 border border-white/40 text-white'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/30"
                    style={{ backgroundColor: p.hex }}
                  />
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
