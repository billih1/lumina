export type AppViewMode = 'console' | 'control-center' | 'lock-screen' | 'screen-lantern';

export type TorchMode = 'continuous' | 'strobe' | 'sos' | 'pulse';

export interface KelvinPreset {
  name: string;
  kelvin: number;
  description: string;
  colorHex: string;
  isSpecial?: boolean;
}

export interface TelemetryState {
  batteryLevel: number;
  isCharging: boolean;
  emitterTempC: number;
  luxOutput: number;
  lumensOutput: number;
  estimatedRuntimeMinutes: number;
}
