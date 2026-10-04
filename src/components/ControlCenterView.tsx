import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Sun, Power, Zap, Sliders, ChevronDown } from 'lucide-react';
import { audioHaptics } from '../utils/audioHaptics';

interface ControlCenterViewProps {
  isOn: boolean;
  onToggle: () => void;
  brightness: number;
  onBrightnessChange: (brightness: number) => void;
  kelvinColorHex: string;
  onClose: () => void;
}

export const ControlCenterView: React.FC<ControlCenterViewProps> = ({
  isOn,
  onToggle,
  brightness,
  onBrightnessChange,
  kelvinColorHex,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const levels = [
    { label: 'Off', val: 0 },
    { label: '1', val: 25 },
    { label: '2', val: 50 },
    { label: '3', val: 75 },
    { label: '4 (Max)', val: 100 },
  ];

  // Map brightness to current level step index
  const activeLevel = !isOn || brightness === 0 ? 0 : brightness <= 30 ? 1 : brightness <= 60 ? 2 : brightness <= 85 ? 3 : 4;

  const handleSelectLevel = (val: number) => {
    if (val === 0) {
      if (isOn) {
        onToggle();
        audioHaptics.playPowerOff();
      }
    } else {
      if (!isOn) {
        onToggle();
        audioHaptics.playPowerOn();
      } else {
        audioHaptics.playSliderTick();
      }
      onBrightnessChange(val);
    }
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const relativeY = Math.max(0, Math.min(rect.height, rect.bottom - clientY));
    const percentage = Math.round((relativeY / rect.height) * 100);

    if (percentage <= 5) {
      if (isOn) {
        onToggle();
        audioHaptics.playPowerOff();
      }
    } else {
      if (!isOn) {
        onToggle();
        audioHaptics.playPowerOn();
      }
      onBrightnessChange(percentage);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between h-full max-w-sm mx-auto px-4 py-6 select-none">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs text-slate-300 font-medium transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
          <span>Exit Module</span>
        </button>
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
          Control Center · iOS 27
        </span>
        <div className="w-8" />
      </div>

      {/* Main Vertical Segmented Pill Slider */}
      <div className="relative flex flex-col items-center my-auto">
        <div
          ref={containerRef}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseMove={(e) => isDragging && handleTouchMove(e)}
          onTouchMove={handleTouchMove}
          className="relative w-36 h-96 rounded-[44px] bg-slate-900/90 border border-white/20 p-2 flex flex-col-reverse justify-between shadow-2xl backdrop-blur-3xl overflow-hidden cursor-ns-resize"
          style={{
            boxShadow: isOn
              ? `0 0 50px ${kelvinColorHex}40, inset 0 2px 4px rgba(255,255,255,0.4)`
              : '0 20px 40px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.1)',
          }}
        >
          {/* Liquid Fill Level */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 rounded-[42px] transition-all duration-150 pointer-events-none"
            style={{
              height: isOn ? `${brightness}%` : '0%',
              background: `linear-gradient(180deg, #ffffff 0%, ${kelvinColorHex} 80%)`,
              boxShadow: isOn ? `0 0 25px ${kelvinColorHex}` : 'none',
            }}
          />

          {/* Vertical 4-bar segments overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none">
            {[4, 3, 2, 1].map((lvl) => (
              <div
                key={lvl}
                className="w-full h-0.5 bg-black/20 rounded-full"
              />
            ))}
          </div>

          {/* Flashlight Icon at bottom of slider */}
          <div className="relative z-10 w-full flex flex-col items-center pb-6 pointer-events-none">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isOn ? 'text-slate-950' : 'text-slate-500'
              }`}
            >
              <Sun className="w-7 h-7" />
            </div>
            <span
              className={`text-xs font-bold font-mono-tabular tracking-wider ${
                isOn ? 'text-slate-900' : 'text-slate-500'
              }`}
            >
              {isOn ? `${Math.round(brightness)}%` : 'OFF'}
            </span>
          </div>
        </div>

        {/* Level Quick Tap Dots on side */}
        <div className="flex items-center gap-3 mt-6">
          {levels.map((lvl) => {
            const isCurrent = activeLevel === lvl.val / 25;
            return (
              <button
                key={lvl.val}
                type="button"
                onClick={() => handleSelectLevel(lvl.val)}
                className={`py-2 px-3 rounded-xl text-xs font-mono-tabular font-bold transition-all ${
                  isCurrent
                    ? 'bg-white text-black shadow-lg shadow-white/30 scale-105'
                    : 'bg-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {lvl.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Instruction */}
      <p className="text-xs text-slate-400 text-center font-mono-tabular">
        Swipe up or down directly on the slider to modulate photonic flux
      </p>
    </div>
  );
};
