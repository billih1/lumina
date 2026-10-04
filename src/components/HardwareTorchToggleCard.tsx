import React, { useState } from 'react';
import { Camera, Zap, Check, AlertCircle, Sparkles, Smartphone } from 'lucide-react';
import { audioHaptics } from '../utils/audioHaptics';
import { cameraTorch } from '../utils/cameraTorch';

interface HardwareTorchToggleCardProps {
  isHardwareTorchActive: boolean;
  onRequestHardwareToggle: () => void;
  isHardwareSupported: boolean;
  isOn: boolean;
}

export const HardwareTorchToggleCard: React.FC<HardwareTorchToggleCardProps> = ({
  isHardwareTorchActive,
  onRequestHardwareToggle,
  isHardwareSupported,
  isOn,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleToggle = async () => {
    audioHaptics.playModeTap();
    onRequestHardwareToggle();
    const err = cameraTorch.getErrorMessage();
    if (err) {
      setErrorMessage(err);
      setTimeout(() => setErrorMessage(null), 6000);
    }
  };

  return (
    <div className="ios-glass-card rounded-3xl p-4 select-none border border-white/10 transition-all hover:border-white/20">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
              isHardwareTorchActive
                ? isOn
                  ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/40 animate-pulse'
                  : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                : 'bg-white/5 text-slate-400 border border-white/5'
            }`}
          >
            <Camera className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-wide">
                Physical Phone Flashlight (LED)
              </span>
              <span
                className={`px-1.5 py-0.5 text-[9px] font-semibold rounded ${
                  isHardwareTorchActive
                    ? isOn
                      ? 'bg-amber-400 text-black'
                      : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                    : 'bg-white/10 text-slate-400'
                }`}
              >
                {isHardwareTorchActive ? (isOn ? 'EMITTING' : 'LINKED') : 'OFF'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              {isHardwareTorchActive
                ? isOn
                  ? 'Physical rear LED is shining bright'
                  : 'Synced with master switch'
                : 'Tap to use your phone\'s real back camera LED'}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          type="button"
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isHardwareTorchActive ? 'bg-amber-400' : 'bg-white/20'
          }`}
          role="switch"
          aria-checked={isHardwareTorchActive}
          title={isHardwareTorchActive ? 'Disconnect physical LED' : 'Connect physical LED'}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              isHardwareTorchActive ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Camera permission explanation banner if error occurs */}
      {errorMessage && (
        <div className="mt-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-300 flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
