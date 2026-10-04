import React from 'react';
import { Battery, BatteryCharging, Thermometer, Camera, Eye, Zap, ShieldCheck } from 'lucide-react';
import { TelemetryState } from '../types/torch';

interface TacticalTelemetryBarProps {
  telemetry: TelemetryState;
  isHardwareTorchActive: boolean;
  onRequestHardwareToggle: () => void;
  isHardwareSupported: boolean;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  isOn: boolean;
  isWakeLocked?: boolean;
}

export const TacticalTelemetryBar: React.FC<TacticalTelemetryBarProps> = ({
  telemetry,
  isHardwareTorchActive,
  onRequestHardwareToggle,
  isHardwareSupported,
  isOn,
  isWakeLocked,
}) => {
  const formatRuntime = (mins: number) => {
    if (!isOn) return 'Standby';
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="ios-glass-card rounded-3xl p-4 select-none">
      <div className="grid grid-cols-3 gap-2 divide-x divide-white/10 text-center">
        {/* Hardware Phone Flash LED */}
        <div className="flex flex-col items-center justify-center px-1">
          <button
            type="button"
            onClick={onRequestHardwareToggle}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
            title="Toggle Android camera LED flash"
          >
            <Camera className={`w-3.5 h-3.5 ${isHardwareTorchActive ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
            <span className="truncate">
              {isHardwareTorchActive ? 'Rear Flash ON' : 'Phone LED'}
            </span>
          </button>
          <span className="text-[10px] font-mono-tabular text-slate-400 mt-0.5">
            {isHardwareTorchActive ? 'Android LED' : 'Tap to sync'}
          </span>
        </div>

        {/* Battery & Runtime */}
        <div className="flex flex-col items-center justify-center px-1">
          <div className="flex items-center gap-1 text-xs font-mono-tabular font-bold text-slate-200">
            {telemetry.isCharging ? (
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Battery className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{Math.round(telemetry.batteryLevel * 100)}%</span>
          </div>
          <span className="text-[10px] font-mono-tabular text-slate-400 mt-0.5">
            {formatRuntime(telemetry.estimatedRuntimeMinutes)}
          </span>
        </div>

        {/* Emitter Thermals & Wake Lock */}
        <div className="flex flex-col items-center justify-center px-1">
          <div className="flex items-center gap-1 text-xs font-mono-tabular font-bold text-slate-200">
            <Thermometer
              className={`w-3.5 h-3.5 ${
                telemetry.emitterTempC > 38 ? 'text-red-400' : 'text-sky-400'
              }`}
            />
            <span>{telemetry.emitterTempC}°C</span>
          </div>
          <span className="text-[10px] font-mono-tabular text-slate-400 mt-0.5">
            {isWakeLocked ? 'Screen Awake' : telemetry.emitterTempC > 38 ? 'Thermal Warn' : 'Optics Nominal'}
          </span>
        </div>
      </div>
    </div>
  );
};
