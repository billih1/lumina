import React from 'react';
import { Sun, Sliders, Zap, Eye, Compass } from 'lucide-react';
import { audioHaptics } from '../utils/audioHaptics';

interface BeamOpticsControlsProps {
  brightness: number;
  onBrightnessChange: (value: number) => void;
  beamAngle: number;
  onBeamAngleChange: (value: number) => void;
  isTurbo: boolean;
  onToggleTurbo: () => void;
  kelvinColorHex: string;
  isOn: boolean;
}

export const BeamOpticsControls: React.FC<BeamOpticsControlsProps> = ({
  brightness,
  onBrightnessChange,
  beamAngle,
  onBeamAngleChange,
  isTurbo,
  onToggleTurbo,
  kelvinColorHex,
  isOn,
}) => {
  const handleBrightnessInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onBrightnessChange(val);
    audioHaptics.playSliderTick();
  };

  const handleAngleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onBeamAngleChange(val);
    audioHaptics.playSliderTick();
  };

  // Quick preset buttons
  const brightnessSteps = [25, 50, 75, 100];

  return (
    <div className="ios-glass-card rounded-3xl p-5 mb-4 select-none">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold tracking-wider uppercase text-slate-200">
            Photonic Beam Optics
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              audioHaptics.playModeTap();
              onToggleTurbo();
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight transition-all flex items-center gap-1 ${
              isTurbo
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-md shadow-orange-500/30'
                : 'bg-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            <Zap className="w-3 h-3 fill-current" />
            <span>Overdrive 120%</span>
          </button>
        </div>
      </div>

      {/* Lumens / Brightness Slider */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-300" />
            <span>Photonic Flux (Brightness)</span>
          </span>
          <span className="font-mono-tabular font-bold text-white">
            {Math.round(brightness)}%
            <span className="text-slate-500 ml-1 font-normal">
              ({Math.round(brightness * 12)} lm)
            </span>
          </span>
        </div>

        {/* Custom Track Slider */}
        <div className="relative flex items-center h-8">
          <div className="absolute inset-0 my-auto h-3 rounded-full bg-slate-900/80 border border-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-75"
              style={{
                width: `${Math.min(100, (brightness / (isTurbo ? 120 : 100)) * 100)}%`,
                background: isTurbo
                  ? 'linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)'
                  : `linear-gradient(90deg, ${kelvinColorHex}88 0%, ${kelvinColorHex} 100%)`,
                boxShadow: isOn ? `0 0 12px ${kelvinColorHex}` : 'none',
              }}
            />
          </div>
          <input
            type="range"
            min="5"
            max={isTurbo ? "120" : "100"}
            step="1"
            value={brightness}
            onChange={handleBrightnessInput}
            className="relative z-10 w-full"
            aria-label="Adjust brightness percentage"
          />
        </div>

        {/* Quick Brightness Notch Buttons */}
        <div className="flex items-center justify-between gap-1.5 mt-2">
          {brightnessSteps.map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => {
                onBrightnessChange(step);
                audioHaptics.playSliderTick();
              }}
              className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-mono-tabular font-medium transition-all ${
                Math.round(brightness) === step
                  ? 'bg-white/25 text-white font-bold shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {step}%
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              onBrightnessChange(120);
              if (!isTurbo) onToggleTurbo();
              audioHaptics.playSliderTick();
            }}
            className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-mono-tabular font-medium transition-all ${
              isTurbo || brightness > 100
                ? 'bg-orange-500 text-white font-bold shadow-sm'
                : 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30'
            }`}
          >
            MAX
          </button>
        </div>
      </div>

      {/* Beam Collimation / Angle Slider & Visual Cone */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>Collimation Beam Spread</span>
          </span>
          <span className="font-mono-tabular font-bold text-white">
            {beamAngle}°
            <span className="text-slate-500 ml-1 font-normal">
              {beamAngle <= 25 ? 'Focused Spot' : beamAngle >= 90 ? 'Wide Flood' : 'Balanced'}
            </span>
          </span>
        </div>

        {/* Dynamic Beam Cone Graphic */}
        <div className="relative w-full h-16 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center overflow-hidden mb-3">
          <div className="absolute left-4 w-4 h-4 rounded-full bg-slate-700 border border-white/30 flex items-center justify-center">
            <div
              className="w-2 h-2 rounded-full transition-colors"
              style={{ backgroundColor: isOn ? kelvinColorHex : '#64748b' }}
            />
          </div>

          {/* Projected Cone */}
          {isOn ? (
            <div
              className="absolute left-6 h-full transition-all duration-150 origin-left"
              style={{
                width: '85%',
                clipPath: `polygon(0 50%, 100% ${Math.max(0, 50 - beamAngle / 2)}%, 100% ${Math.min(100, 50 + beamAngle / 2)}%)`,
                background: `linear-gradient(90deg, ${kelvinColorHex}cc 0%, ${kelvinColorHex}33 70%, transparent 100%)`,
                filter: 'blur(1px)',
              }}
            />
          ) : (
            <span className="text-[11px] text-slate-500 font-mono-tabular">
              Emitter inactive · {beamAngle}° preset
            </span>
          )}

          {/* Focal Distance Overlay */}
          <div className="absolute right-3 top-2 text-[10px] font-mono-tabular text-slate-400">
            {beamAngle <= 30 ? 'Range: ~120m' : beamAngle <= 70 ? 'Range: ~45m' : 'Range: ~15m (Flood)'}
          </div>
        </div>

        {/* Angle Range Input */}
        <div className="relative flex items-center h-8">
          <div className="absolute inset-0 my-auto h-3 rounded-full bg-slate-900/80 border border-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-75"
              style={{ width: `${((beamAngle - 15) / (120 - 15)) * 100}%` }}
            />
          </div>
          <input
            type="range"
            min="15"
            max="120"
            step="1"
            value={beamAngle}
            onChange={handleAngleInput}
            className="relative z-10 w-full"
            aria-label="Adjust beam spread angle"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 font-mono-tabular">
          <span>15° Laser Focus</span>
          <span>60° Standard</span>
          <span>120° Diffuse Flood</span>
        </div>
      </div>
    </div>
  );
};
