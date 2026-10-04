import React from 'react';
import { ShieldAlert, Radio, Activity, Volume2, VolumeX } from 'lucide-react';
import { TorchMode } from '../types/torch';
import { audioHaptics } from '../utils/audioHaptics';

interface StrobeMatrixProps {
  mode: TorchMode;
  onModeChange: (mode: TorchMode) => void;
  strobeFrequency: number;
  onFrequencyChange: (freq: number) => void;
  sosStepIndex: number;
  isAudioBeaconEnabled: boolean;
  onToggleAudioBeacon: () => void;
  isOn: boolean;
}

export const StrobeMatrix: React.FC<StrobeMatrixProps> = ({
  mode,
  onModeChange,
  strobeFrequency,
  onFrequencyChange,
  sosStepIndex,
  isAudioBeaconEnabled,
  onToggleAudioBeacon,
  isOn,
}) => {
  const modes: { id: TorchMode; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'continuous',
      label: 'Solid',
      icon: <Activity className="w-4 h-4" />,
      desc: 'Uniform steady photonic flux',
    },
    {
      id: 'strobe',
      label: 'Strobe',
      icon: <Radio className="w-4 h-4" />,
      desc: 'Variable flicker frequency',
    },
    {
      id: 'sos',
      label: 'S.O.S.',
      icon: <ShieldAlert className="w-4 h-4 text-red-400" />,
      desc: 'International Morse distress',
    },
    {
      id: 'pulse',
      label: 'Pulse',
      icon: <Activity className="w-4 h-4 text-cyan-400" />,
      desc: 'Organic rhythmic breathing',
    },
  ];

  const handleSelectMode = (newMode: TorchMode) => {
    onModeChange(newMode);
    audioHaptics.playModeTap();
  };

  const handleFreqChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFrequencyChange(Number(e.target.value));
    audioHaptics.playSliderTick();
  };

  // Morse pattern visualization for SOS: 3 dots, 3 dashes, 3 dots
  // dots = short, dashes = long
  const morsePattern = [
    { type: 'dot', char: 'S' },
    { type: 'dot', char: 'S' },
    { type: 'dot', char: 'S' },
    { type: 'dash', char: 'O' },
    { type: 'dash', char: 'O' },
    { type: 'dash', char: 'O' },
    { type: 'dot', char: 'S' },
    { type: 'dot', char: 'S' },
    { type: 'dot', char: 'S' },
  ];

  return (
    <div className="ios-glass-card rounded-3xl p-5 mb-4 select-none">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold tracking-wider uppercase text-slate-200">
            Signaling & Strobe Suite
          </h3>
        </div>
        {mode === 'sos' && (
          <button
            type="button"
            onClick={onToggleAudioBeacon}
            className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white"
          >
            {isAudioBeaconEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{isAudioBeaconEnabled ? 'Acoustic Tone' : 'Muted'}</span>
          </button>
        )}
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {modes.map((item) => {
          const isActive = mode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectMode(item.id)}
              className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl border transition-all ${
                isActive
                  ? 'bg-white/20 border-white/40 text-white font-semibold shadow-lg shadow-black/30'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="mb-1">{item.icon}</div>
              <span className="text-xs tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mode-Specific Sub-Panel */}
      {mode === 'strobe' && (
        <div className="bg-black/40 border border-white/10 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400">Frequency Rate</span>
            <span className="font-mono-tabular font-bold text-amber-300">
              {strobeFrequency} Hz
              <span className="text-slate-500 ml-1 font-normal">
                ({strobeFrequency * 60} flashes/min)
              </span>
            </span>
          </div>

          <div className="relative flex items-center h-8 mb-2">
            <div className="absolute inset-0 my-auto h-3 rounded-full bg-slate-900 border border-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500"
                style={{ width: `${((strobeFrequency - 1) / (30 - 1)) * 100}%` }}
              />
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={strobeFrequency}
              onChange={handleFreqChange}
              className="relative z-10 w-full"
              aria-label="Adjust strobe frequency"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono-tabular">
            <span>1 Hz (Slow beacon)</span>
            <span>10 Hz (Tactical disorient)</span>
            <span>30 Hz (Hyper speed)</span>
          </div>
        </div>
      )}

      {mode === 'sos' && (
        <div className="bg-black/40 border border-red-500/20 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-xs mb-2.5">
            <span className="text-red-400 font-semibold tracking-wide">
              DISTRESS BEACON (. . . - - - . . .)
            </span>
            <span className="font-mono-tabular text-[11px] text-slate-400">
              Active Loop
            </span>
          </div>

          {/* Morse visual dots/dashes */}
          <div className="flex items-center justify-center gap-2 py-2">
            {morsePattern.map((p, idx) => {
              const isCurrent = isOn && sosStepIndex === idx;
              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center gap-1 transition-all ${
                    isCurrent ? 'scale-125' : 'opacity-60'
                  }`}
                >
                  <div
                    className={`rounded-full transition-all ${
                      p.type === 'dot' ? 'w-2.5 h-2.5' : 'w-6 h-2.5'
                    } ${
                      isCurrent
                        ? 'bg-red-400 shadow-md shadow-red-400 ring-2 ring-white'
                        : 'bg-slate-700'
                    }`}
                  />
                  <span className="text-[9px] font-mono-tabular text-slate-400">
                    {p.char}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {mode === 'pulse' && (
        <div className="bg-black/40 border border-cyan-500/20 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-cyan-300 font-medium">Harmonic Breathing Light</span>
            <span className="text-slate-400 text-[11px]">3.2s Cycle</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Modulates intensity in a relaxed sinusoidal curve, ideal for night navigation or campsite presence.
          </p>
        </div>
      )}
    </div>
  );
};
