import React from 'react';
import { motion } from 'motion/react';
import { Sun, Power, Zap } from 'lucide-react';
import { audioHaptics } from '../utils/audioHaptics';

interface PhotonicCoreButtonProps {
  isOn: boolean;
  onToggle: () => void;
  brightness: number;
  beamAngle: number;
  kelvinColorHex: string;
  isTurbo: boolean;
  mode: string;
}

export const PhotonicCoreButton: React.FC<PhotonicCoreButtonProps> = ({
  isOn,
  onToggle,
  brightness,
  beamAngle,
  kelvinColorHex,
  isTurbo,
  mode,
}) => {
  const handleClick = () => {
    if (!isOn) {
      audioHaptics.playPowerOn();
    } else {
      audioHaptics.playPowerOff();
    }
    onToggle();
  };

  // Calculate dynamic glow and shadow based on brightness and kelvin color
  const glowOpacity = isOn ? Math.min(1, Math.max(0.3, brightness / 100)) : 0;
  const glowSpread = isOn ? 30 + (brightness / 100) * 50 : 0;

  return (
    <div className="relative flex flex-col items-center justify-center py-6 select-none">
      {/* Background Volumetric Beam Cone Illusion */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-500 rounded-full"
        style={{
          width: isOn ? `${240 + (120 - beamAngle)}px` : '180px',
          height: isOn ? `${240 + (120 - beamAngle)}px` : '180px',
          background: isOn
            ? `radial-gradient(circle, ${kelvinColorHex}${Math.round(glowOpacity * 65).toString(16).padStart(2, '0')} 0%, ${kelvinColorHex}15 45%, transparent 70%)`
            : 'transparent',
          filter: `blur(${isOn ? 36 : 10}px)`,
        }}
      />

      {/* Outer Halo Rings */}
      <div className="relative flex items-center justify-center">
        {/* Animated concentric optical pulse when ON */}
        {isOn && (
          <>
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.15, 0.6] }}
              transition={{ repeat: Infinity, duration: isTurbo ? 1.2 : 2.5, ease: 'easeInOut' }}
              className="absolute w-56 h-56 rounded-full border border-amber-300/30 pointer-events-none"
              style={{ borderColor: `${kelvinColorHex}40` }}
            />
            <motion.div
              animate={{ scale: [1, 1.12, 1], opacity: [0.8, 0.3, 0.8] }}
              transition={{ repeat: Infinity, duration: isTurbo ? 0.9 : 2, ease: 'easeInOut', delay: 0.3 }}
              className="absolute w-48 h-48 rounded-full border border-dashed border-white/25 pointer-events-none"
            />
          </>
        )}

        {/* Master Physical Emitter Button */}
        <motion.button
          type="button"
          onClick={handleClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className={`relative z-10 w-40 h-40 rounded-full flex flex-col items-center justify-center p-3 outline-none transition-all duration-300 cursor-pointer shadow-2xl ${
            isOn
              ? 'ring-2 ring-white/70 shadow-amber-500/30'
              : 'ring-1 ring-white/10 hover:ring-white/20'
          }`}
          style={{
            background: isOn
              ? `radial-gradient(circle at 35% 30%, #ffffff 0%, ${kelvinColorHex} 40%, #151a28 95%)`
              : 'radial-gradient(circle at 35% 30%, #1c2436 0%, #0d121c 60%, #050811 100%)',
            boxShadow: isOn
              ? `0 0 ${glowSpread}px ${kelvinColorHex}aa, 0 12px 30px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -6px 12px rgba(0,0,0,0.6)`
              : '0 12px 28px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -4px 8px rgba(0,0,0,0.8)',
          }}
          aria-label={isOn ? 'Turn torch off' : 'Turn torch on'}
        >
          {/* Specular glass reflections */}
          <div className="absolute inset-2 rounded-full border border-white/20 pointer-events-none opacity-60" />
          <div className="absolute top-3 left-6 right-6 h-6 rounded-full bg-gradient-to-b from-white/35 to-transparent pointer-events-none" />

          {/* Central Icon */}
          <div className="relative flex flex-col items-center justify-center text-center">
            {isOn ? (
              <motion.div
                initial={{ scale: 0.8, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-1 text-slate-950 shadow-inner">
                  <Sun className="w-7 h-7 drop-shadow-sm fill-current" />
                </div>
                <span className="text-[10px] font-extrabold tracking-widest uppercase text-slate-900 drop-shadow-sm">
                  {isTurbo ? 'TURBO 120%' : 'ACTIVE'}
                </span>
                <span className="text-[9px] font-mono-tabular font-bold text-slate-800/80">
                  {Math.round(brightness)}%
                </span>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-1 text-slate-400 group-hover:text-white transition-colors">
                  <Power className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                  IGNITE
                </span>
                <span className="text-[9px] font-mono-tabular text-slate-500">
                  OPTIC 27
                </span>
              </div>
            )}
          </div>
        </motion.button>
      </div>

      {/* Subtext info under button */}
      <div className="mt-4 flex items-center gap-2 text-xs font-mono-tabular text-slate-400">
        <span className="flex items-center gap-1">
          <span
            className={`w-2 h-2 rounded-full ${
              isOn ? 'bg-amber-400 shadow-sm shadow-amber-400 animate-pulse' : 'bg-slate-600'
            }`}
          />
          <span className="font-medium text-slate-300">
            {isOn ? (mode === 'strobe' ? 'STROBE PULSE' : mode === 'sos' ? 'EMERGENCY S.O.S.' : 'PHOTONIC CORE') : 'STANDBY'}
          </span>
        </span>
        <span className="text-slate-600">·</span>
        <span>{beamAngle}° Collimation</span>
      </div>
    </div>
  );
};
