import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Volume2, VolumeX, Maximize2, ShieldAlert, Sparkles, Sun } from 'lucide-react';
import { audioHaptics } from '../utils/audioHaptics';

interface DynamicHyperIslandProps {
  isOn: boolean;
  onToggle: () => void;
  brightness: number;
  beamAngle: number;
  kelvin: number;
  isTurbo: boolean;
  onToggleTurbo: () => void;
  isStrobeActive: boolean;
  onToggleStrobe: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  onOpenScreenLantern: () => void;
  batteryLevel: number;
  isHardwareActive: boolean;
}

export const DynamicHyperIsland: React.FC<DynamicHyperIslandProps> = ({
  isOn,
  onToggle,
  brightness,
  beamAngle,
  kelvin,
  isTurbo,
  onToggleTurbo,
  isStrobeActive,
  onToggleStrobe,
  isSoundEnabled,
  onToggleSound,
  onOpenScreenLantern,
  batteryLevel,
  isHardwareActive,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpand = () => {
    audioHaptics.playModeTap();
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="w-full flex justify-center py-2 px-4 z-40 select-none">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
        onClick={handleToggleExpand}
        className={`relative cursor-pointer overflow-hidden rounded-[26px] bg-black/90 border border-white/15 backdrop-blur-2xl shadow-2xl shadow-black/80 transition-shadow ${
          isOn ? 'ring-1 ring-amber-400/30 shadow-amber-500/10' : ''
        }`}
        style={{
          width: isExpanded ? '100%' : isOn ? '240px' : '180px',
          maxWidth: isExpanded ? '390px' : '280px',
        }}
      >
        {/* Collapsed Pill Content */}
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between px-3.5 py-2.5 h-11"
          >
            {/* Left status dot or glowing emitter */}
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center w-5 h-5">
                {isOn ? (
                  <>
                    <span className="absolute w-5 h-5 rounded-full bg-amber-400/30 animate-ping" />
                    <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 shadow-md shadow-amber-400/80" />
                  </>
                ) : (
                  <span className="w-3 h-3 rounded-full bg-slate-700 border border-slate-600" />
                )}
              </div>
              <span className="text-xs font-semibold tracking-tight text-white">
                {isStrobeActive ? 'STROBE' : isOn ? `${Math.round(brightness)}%` : 'OFF'}
              </span>
            </div>

            {/* Right mini indicators */}
            <div className="flex items-center gap-2 text-[11px] font-mono-tabular text-slate-400">
              {isOn ? (
                <>
                  <span className="text-amber-300 font-medium">{kelvin}K</span>
                  <span className="text-slate-600">·</span>
                  <span>{beamAngle}°</span>
                </>
              ) : (
                <div className="flex items-center gap-1 text-slate-500">
                  <span>{Math.round(batteryLevel * 100)}%</span>
                  {isHardwareActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Expanded Island Card */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="p-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isOn ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/40' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-wide uppercase">Photonic Island</h4>
                    <p className="text-[11px] text-slate-400 font-mono-tabular">
                      {isOn ? `Emitting ${Math.round(brightness * 12)} Lumens · ${kelvin}K` : 'Optics in Standby'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleExpand}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 text-xs transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-4 gap-2 mt-3.5">
                {/* Power Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    onToggle();
                    if (!isOn) audioHaptics.playPowerOn();
                    else audioHaptics.playPowerOff();
                  }}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all ${
                    isOn
                      ? 'bg-amber-400 text-black font-semibold shadow-md shadow-amber-400/30'
                      : 'bg-white/10 text-white hover:bg-white/15'
                  }`}
                >
                  <Sun className="w-4 h-4 mb-1" />
                  <span className="text-[10px] leading-none">{isOn ? 'Power Off' : 'Power On'}</span>
                </button>

                {/* Turbo Boost */}
                <button
                  type="button"
                  onClick={() => {
                    audioHaptics.playModeTap();
                    onToggleTurbo();
                  }}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all ${
                    isTurbo
                      ? 'bg-orange-500 text-white font-semibold shadow-md shadow-orange-500/40'
                      : 'bg-white/10 text-slate-300 hover:bg-white/15'
                  }`}
                >
                  <Zap className="w-4 h-4 mb-1" />
                  <span className="text-[10px] leading-none">Turbo 120%</span>
                </button>

                {/* Strobe */}
                <button
                  type="button"
                  onClick={() => {
                    audioHaptics.playModeTap();
                    onToggleStrobe();
                  }}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all ${
                    isStrobeActive
                      ? 'bg-red-500 text-white font-semibold shadow-md shadow-red-500/40'
                      : 'bg-white/10 text-slate-300 hover:bg-white/15'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 mb-1" />
                  <span className="text-[10px] leading-none">Strobe</span>
                </button>

                {/* Screen Lantern Mode */}
                <button
                  type="button"
                  onClick={() => {
                    audioHaptics.playModeTap();
                    onOpenScreenLantern();
                  }}
                  className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-white/10 text-slate-300 hover:bg-white/15 transition-all"
                >
                  <Maximize2 className="w-4 h-4 mb-1" />
                  <span className="text-[10px] leading-none">Display</span>
                </button>
              </div>

              {/* Sound & Haptics toggle footer */}
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 font-mono-tabular">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {isHardwareActive ? 'Hardware Torch Paired' : 'Matrix Emulation'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onToggleSound();
                    audioHaptics.playSliderTick();
                  }}
                  className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                >
                  {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>{isSoundEnabled ? 'Haptics Active' : 'Silent'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
