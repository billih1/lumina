import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sun, Camera, Lock, ChevronUp } from 'lucide-react';
import { audioHaptics } from '../utils/audioHaptics';

interface LockScreenViewProps {
  isOn: boolean;
  onToggle: () => void;
  kelvinColorHex: string;
  brightness: number;
  onUnlock: () => void;
}

export const LockScreenView: React.FC<LockScreenViewProps> = ({
  isOn,
  onToggle,
  kelvinColorHex,
  brightness,
  onUnlock,
}) => {
  const [timeStr, setTimeStr] = useState('09:41');
  const [dateStr, setDateStr] = useState('Sunday, October 4');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
      setDateStr(
        now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFlashlightPress = () => {
    if (!isOn) {
      audioHaptics.playPowerOn();
    } else {
      audioHaptics.playPowerOff();
    }
    onToggle();
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 select-none overflow-hidden">
      {/* Background Radiance from Torch */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: isOn
            ? `radial-gradient(circle at 18% 90%, ${kelvinColorHex}${Math.round((brightness / 100) * 80).toString(16).padStart(2, '0')} 0%, ${kelvinColorHex}15 45%, #030712 85%)`
            : 'radial-gradient(circle at 50% 20%, #172138 0%, #030712 100%)',
        }}
      />

      {/* Top Lock Header */}
      <div className="relative z-10 flex flex-col items-center pt-8">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-2">
          <Lock className="w-3.5 h-3.5" />
          <span>iOS 27 Spatial Lock</span>
        </div>

        <span className="text-sm font-semibold tracking-wide text-slate-300">
          {dateStr}
        </span>

        {/* Large Cinematic Clock */}
        <h1 className="text-7xl font-extrabold tracking-tighter text-white font-mono-tabular drop-shadow-2xl mt-1">
          {timeStr}
        </h1>

        {/* Ambient Widget Pill */}
        <div className="mt-4 flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 text-xs text-slate-200">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isOn ? 'bg-amber-400 animate-ping' : 'bg-slate-500'
              }`}
            />
            <span className="font-semibold">{isOn ? 'Torch Emitting' : 'Optics Asleep'}</span>
          </div>
          {isOn && (
            <>
              <span className="text-slate-500">·</span>
              <span className="font-mono-tabular">{Math.round(brightness)}% Flux</span>
            </>
          )}
        </div>
      </div>

      {/* Center Prompt to Unlock */}
      <div className="relative z-10 flex flex-col items-center cursor-pointer group" onClick={onUnlock}>
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="text-slate-400 group-hover:text-white transition-colors"
        >
          <ChevronUp className="w-6 h-6" />
        </motion.div>
        <span className="text-xs font-medium tracking-wider uppercase text-slate-400 group-hover:text-white transition-colors">
          Swipe up to unlock console
        </span>
      </div>

      {/* Bottom Action Triggers */}
      <div className="relative z-10 flex items-center justify-between pb-6">
        {/* Iconic Flashlight 3D Press Button */}
        <motion.button
          type="button"
          onClick={handleFlashlightPress}
          whileTap={{ scale: 0.88 }}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isOn
              ? 'bg-white text-black shadow-xl shadow-white/40 ring-4 ring-white/30'
              : 'bg-black/50 text-white border border-white/20 backdrop-blur-xl hover:bg-black/60'
          }`}
          aria-label={isOn ? 'Turn flashlight off' : 'Turn flashlight on'}
        >
          <Sun className="w-6 h-6" />
        </motion.button>

        {/* Camera Shortcut */}
        <div className="w-14 h-14 rounded-full bg-black/50 text-white/70 border border-white/20 backdrop-blur-xl flex items-center justify-center">
          <Camera className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
