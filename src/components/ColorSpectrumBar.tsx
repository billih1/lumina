import React from 'react';
import { Flame, Sparkles, Moon } from 'lucide-react';
import { KELVIN_PRESETS } from '../utils/colorUtils';
import { audioHaptics } from '../utils/audioHaptics';

interface ColorSpectrumBarProps {
  kelvin: number;
  onKelvinChange: (kelvin: number) => void;
  kelvinColorHex: string;
}

export const ColorSpectrumBar: React.FC<ColorSpectrumBarProps> = ({
  kelvin,
  onKelvinChange,
  kelvinColorHex,
}) => {
  const handleRangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onKelvinChange(Number(e.target.value));
    audioHaptics.playSliderTick();
  };

  const handleSelectPreset = (presetKelvin: number) => {
    onKelvinChange(presetKelvin);
    audioHaptics.playModeTap();
  };

  return (
    <div className="ios-glass-card rounded-3xl p-5 mb-4 select-none">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <h3 className="text-xs font-bold tracking-wider uppercase text-slate-200">
            Spectral Color Temperature
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
            style={{ backgroundColor: kelvinColorHex }}
          />
          <span className="font-mono-tabular text-xs font-bold text-white">
            {kelvin}K
          </span>
        </div>
      </div>

      {/* Spectrum Continuous Slider */}
      <div className="relative flex items-center h-8 mb-4">
        {/* Continuous gradient track */}
        <div
          className="absolute inset-0 my-auto h-3 rounded-full border border-white/15 overflow-hidden"
          style={{
            background:
              'linear-gradient(90deg, #ff8400 0%, #ffa94d 20%, #ffe4b5 40%, #ffffff 60%, #cfe2fe 80%, #90b8f8 100%)',
          }}
        />
        <input
          type="range"
          min="1800"
          max="10000"
          step="50"
          value={kelvin}
          onChange={handleRangeInput}
          className="relative z-10 w-full"
          aria-label="Adjust color temperature in Kelvin"
        />
      </div>

      {/* Presets Horizontal Shelf */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {KELVIN_PRESETS.map((preset) => {
          const isSelected = Math.abs(kelvin - preset.kelvin) < 80;
          return (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleSelectPreset(preset.kelvin)}
              className={`flex-shrink-0 flex items-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-white/20 border-white/40 text-white shadow-md'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0 border border-black/30 shadow-xs"
                style={{ backgroundColor: preset.colorHex }}
              />
              <span className="whitespace-nowrap">{preset.name}</span>
            </button>
          );
        })}
      </div>

      {/* Special Night Vision Mode callout */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <Moon className="w-3.5 h-3.5 text-red-400" />
          <span>Tactical Red protects scotopic night adaptation</span>
        </span>
        <button
          type="button"
          onClick={() => handleSelectPreset(1200)}
          className="text-red-400 font-semibold hover:text-red-300 transition-colors"
        >
          Engage 660nm
        </button>
      </div>
    </div>
  );
};
