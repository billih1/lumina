/**
 * Lumina iOS 27 — Quantum Photonic Torch
 * Built with Apple iOS 27 design language, dynamic hyper-island optics,
 * spatial haptic audio, and hardware camera torch control.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sun,
  Power,
  Zap,
  Sliders,
  ShieldAlert,
  Flame,
  Volume2,
  VolumeX,
  Maximize2,
  Lock,
  LayoutGrid,
  Radio,
  Eye,
  Camera,
  Compass,
  Download,
  Smartphone,
} from 'lucide-react';
import { AppViewMode, TorchMode, TelemetryState } from './types/torch';
import { kelvinToRgb } from './utils/colorUtils';
import { audioHaptics } from './utils/audioHaptics';
import { cameraTorch } from './utils/cameraTorch';
import { useWakeLock } from './hooks/useWakeLock';
import { usePWAInstall } from './hooks/usePWAInstall';
import { DynamicHyperIsland } from './components/DynamicHyperIsland';
import { PhotonicCoreButton } from './components/PhotonicCoreButton';
import { BeamOpticsControls } from './components/BeamOpticsControls';
import { ColorSpectrumBar } from './components/ColorSpectrumBar';
import { StrobeMatrix } from './components/StrobeMatrix';
import { ControlCenterView } from './components/ControlCenterView';
import { LockScreenView } from './components/LockScreenView';
import { ScreenTorchModal } from './components/ScreenTorchModal';
import { TacticalTelemetryBar } from './components/TacticalTelemetryBar';
import { HardwareTorchToggleCard } from './components/HardwareTorchToggleCard';
import { PWAInstallBar } from './components/PWAInstallBar';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  // Master Torch States
  const [isOn, setIsOn] = useState<boolean>(false);
  const [brightness, setBrightness] = useState<number>(85);
  const [beamAngle, setBeamAngle] = useState<number>(45);
  const [kelvin, setKelvin] = useState<number>(5500);
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [torchMode, setTorchMode] = useState<TorchMode>('continuous');
  const [strobeFrequency, setStrobeFrequency] = useState<number>(8);
  const [viewMode, setViewMode] = useState<AppViewMode>('console');
  const [isScreenLanternOpen, setIsScreenLanternOpen] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [isAudioBeaconEnabled, setIsAudioBeaconEnabled] = useState<boolean>(true);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  // Hardware torch state: default to TRUE so torch turns on the real phone LED
  const [isHardwareTorchActive, setIsHardwareTorchActive] = useState<boolean>(true);
  const [isHardwareSupported, setIsHardwareSupported] = useState<boolean>(false);

  // PWA Install & Android WakeLock
  const { isInstalled, isInstallable, isAndroid, install } = usePWAInstall();
  const isWakeLocked = useWakeLock(isOn || isScreenLanternOpen);

  // Optical strobe / flash output state (for visual blinking)
  const [isFlashActive, setIsFlashActive] = useState<boolean>(true);
  const [sosStepIndex, setSosStepIndex] = useState<number>(0);

  // Android Shortcuts / Deep Linking (?action=torch_on, ?action=strobe, etc.)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      if (action === 'torch_on') {
        setIsOn(true);
        audioHaptics.playPowerOn();
        cameraTorch.initTorch().then((supp) => {
          setIsHardwareSupported(supp);
          if (supp) cameraTorch.setTorchState(true);
        });
      } else if (action === 'strobe') {
        setIsOn(true);
        setTorchMode('strobe');
        audioHaptics.playPowerOn();
        cameraTorch.initTorch().then((supp) => setIsHardwareSupported(supp));
      } else if (action === 'sos') {
        setIsOn(true);
        setTorchMode('sos');
        audioHaptics.playPowerOn();
        cameraTorch.initTorch().then((supp) => setIsHardwareSupported(supp));
      } else if (action === 'lantern') {
        setIsScreenLanternOpen(true);
      }
    }
  }, []);

  // Telemetry
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    batteryLevel: 0.88,
    isCharging: false,
    emitterTempC: 31,
    luxOutput: 1250,
    lumensOutput: 960,
    estimatedRuntimeMinutes: 245,
  });

  // Calculate RGB & Hex from Kelvin
  const kelvinRgb = useMemo(() => kelvinToRgb(kelvin), [kelvin]);

  // Handle hardware camera torch syncing
  useEffect(() => {
    if (isHardwareTorchActive) {
      const activeState = isOn && isFlashActive;
      cameraTorch.setTorchState(activeState);
    }
  }, [isOn, isFlashActive, isHardwareTorchActive]);

  // Request or toggle hardware torch
  const handleToggleHardwareTorch = async () => {
    audioHaptics.playModeTap();
    if (isHardwareTorchActive) {
      cameraTorch.stop();
      setIsHardwareTorchActive(false);
    } else {
      const supported = await cameraTorch.initTorch();
      setIsHardwareSupported(supported);
      if (supported) {
        setIsHardwareTorchActive(true);
        if (isOn) {
          cameraTorch.setTorchState(true);
        }
      } else {
        // Fallback message via subtle feedback
        audioHaptics.playPowerOff();
      }
    }
  };

  // Battery status API
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as unknown as { getBattery: () => Promise<{ level: number; charging: boolean; addEventListener: (type: string, listener: () => void) => void }> })
        .getBattery()
        .then((battery) => {
          const updateBattery = () => {
            setTelemetry((prev) => ({
              ...prev,
              batteryLevel: battery.level,
              isCharging: battery.charging,
            }));
          };
          updateBattery();
          battery.addEventListener('levelchange', updateBattery);
          battery.addEventListener('chargingchange', updateBattery);
        })
        .catch(() => {});
    }
  }, []);

  // Thermal load simulation & runtime calculation
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => {
        let newTemp = prev.emitterTempC;
        if (isOn) {
          if (isTurbo) {
            newTemp = Math.min(46, newTemp + 0.3);
          } else if (brightness > 70) {
            newTemp = Math.min(39, newTemp + 0.15);
          } else {
            newTemp = Math.max(30, newTemp + 0.05);
          }
        } else {
          newTemp = Math.max(26, newTemp - 0.4);
        }

        const fluxRatio = (brightness / 100) * (isTurbo ? 1.25 : 1);
        const estMins = Math.round((prev.batteryLevel * 480) / Math.max(0.2, fluxRatio));

        return {
          ...prev,
          emitterTempC: Math.round(newTemp * 10) / 10,
          lumensOutput: isOn ? Math.round(brightness * (isTurbo ? 14.4 : 12)) : 0,
          luxOutput: isOn ? Math.round(brightness * 18.5) : 0,
          estimatedRuntimeMinutes: estMins,
        };
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [isOn, isTurbo, brightness]);

  // Signaling Engine: Continuous / Strobe / SOS / Pulse
  useEffect(() => {
    if (!isOn) {
      setIsFlashActive(false);
      setSosStepIndex(0);
      return;
    }

    if (torchMode === 'continuous') {
      setIsFlashActive(true);
      return;
    }

    if (torchMode === 'strobe') {
      const intervalMs = Math.max(25, 1000 / (strobeFrequency * 2));
      const interval = setInterval(() => {
        setIsFlashActive((prev) => !prev);
      }, intervalMs);
      return () => clearInterval(interval);
    }

    if (torchMode === 'pulse') {
      // Harmonic breathing: toggle smoothly
      let step = 0;
      const interval = setInterval(() => {
        step = (step + 1) % 40;
        const normalized = Math.sin((step / 40) * Math.PI * 2);
        setIsFlashActive(normalized > -0.2);
      }, 75);
      return () => clearInterval(interval);
    }

    if (torchMode === 'sos') {
      // Morse timing: S (dot dot dot) O (dash dash dash) S (dot dot dot)
      // Dot = 150ms, Dash = 450ms, gap = 150ms
      const morseUnits = [
        { on: true, dur: 160, charIdx: 0 },
        { on: false, dur: 140, charIdx: 0 },
        { on: true, dur: 160, charIdx: 1 },
        { on: false, dur: 140, charIdx: 1 },
        { on: true, dur: 160, charIdx: 2 },
        { on: false, dur: 360, charIdx: 2 },

        { on: true, dur: 450, charIdx: 3 },
        { on: false, dur: 140, charIdx: 3 },
        { on: true, dur: 450, charIdx: 4 },
        { on: false, dur: 140, charIdx: 4 },
        { on: true, dur: 450, charIdx: 5 },
        { on: false, dur: 360, charIdx: 5 },

        { on: true, dur: 160, charIdx: 6 },
        { on: false, dur: 140, charIdx: 6 },
        { on: true, dur: 160, charIdx: 7 },
        { on: false, dur: 140, charIdx: 7 },
        { on: true, dur: 160, charIdx: 8 },
        { on: false, dur: 1000, charIdx: 8 },
      ];

      let unitIndex = 0;
      let timer: NodeJS.Timeout;

      const runMorseStep = () => {
        const current = morseUnits[unitIndex];
        setIsFlashActive(current.on);
        setSosStepIndex(current.charIdx);

        if (current.on && isAudioBeaconEnabled) {
          audioHaptics.playMorseBeep(current.dur);
        }

        timer = setTimeout(() => {
          unitIndex = (unitIndex + 1) % morseUnits.length;
          runMorseStep();
        }, current.dur);
      };

      runMorseStep();

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isOn, torchMode, strobeFrequency, isAudioBeaconEnabled]);

  // Master Power Toggle: automatically controls real camera LED flashlight!
  const handleMasterToggle = async () => {
    const nextState = !isOn;
    setIsOn(nextState);

    if (nextState) {
      audioHaptics.playPowerOn();
      if (isHardwareTorchActive) {
        const supported = await cameraTorch.initTorch();
        setIsHardwareSupported(supported);
        if (supported) {
          cameraTorch.setTorchState(true);
        }
      }
    } else {
      audioHaptics.playPowerOff();
      cameraTorch.setTorchState(false);
    }
  };

  // Turbo Toggle
  const handleToggleTurbo = () => {
    setIsTurbo((prev) => {
      const next = !prev;
      if (next) {
        setBrightness(120);
      } else {
        setBrightness(100);
      }
      return next;
    });
  };

  // Sound Haptics Toggle
  const handleToggleSound = () => {
    const next = !isSoundEnabled;
    setIsSoundEnabled(next);
    audioHaptics.setSoundEnabled(next);
  };

  // Effective visible light status (taking into account strobe flickering)
  const isLightEffectivelyEmitting = isOn && isFlashActive;

  return (
    <div className="relative min-h-screen w-full bg-[#030712] text-slate-100 flex flex-col items-center justify-start overflow-x-hidden selection:bg-amber-400 selection:text-black">
      {/* Dynamic Ambient Environmental Light Field with genuine brightness/opacity response */}
      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: isLightEffectivelyEmitting ? Math.max(0.04, (brightness / 100) * 0.85) : 0,
          background: `radial-gradient(ellipse at 50% 30%, ${kelvinRgb.hex}66 0%, ${kelvinRgb.hex}15 50%, transparent 80%)`,
        }}
      />

      {/* Top Bar Contract (3 Zones) */}
      <header className="w-full max-w-5xl px-6 py-4 flex items-center justify-between border-b border-white/10 z-30 backdrop-blur-md bg-black/40">
        {/* Zone 1: Brand Wordmark (Single Text Element) */}
        <div className="flex items-center gap-2">
          <span className="text-base md:text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 shadow-sm shadow-amber-400" />
            Lumina iOS 27
          </span>
        </div>

        {/* Zone 2: Navigation Links (Single-Line Text with Underline Hover) */}
        <nav className="hidden sm:flex items-center gap-6 text-xs md:text-sm font-medium text-slate-400">
          <button
            type="button"
            onClick={() => {
              setViewMode('console');
              audioHaptics.playModeTap();
            }}
            className={`transition-colors whitespace-nowrap ${
              viewMode === 'console' ? 'text-white font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Photonic Console
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode('control-center');
              audioHaptics.playModeTap();
            }}
            className={`transition-colors whitespace-nowrap ${
              viewMode === 'control-center' ? 'text-white font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Control Center
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode('lock-screen');
              audioHaptics.playModeTap();
            }}
            className={`transition-colors whitespace-nowrap ${
              viewMode === 'lock-screen' ? 'text-white font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Lock Screen
          </button>
          <button
            type="button"
            onClick={() => {
              setIsScreenLanternOpen(true);
              audioHaptics.playModeTap();
            }}
            className="hover:text-slate-200 transition-colors whitespace-nowrap"
          >
            Display Lantern
          </button>
        </nav>

        {/* Zone 3: Primary Action & Quick Controls */}
        <div className="flex items-center gap-2.5">
          {!isInstalled && (
            <button
              type="button"
              onClick={() => {
                audioHaptics.playModeTap();
                setShowInstallModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400/20 to-yellow-400/10 hover:bg-amber-400/30 text-amber-300 text-xs font-semibold border border-amber-400/30 transition-all cursor-pointer"
              title="Install Lumina Torch on phone"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{isAndroid ? 'Install on Android' : 'Install App'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleSound}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title={isSoundEnabled ? 'Mute Spatial Haptics' : 'Enable Spatial Haptics'}
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => {
              handleMasterToggle();
              if (!isOn) audioHaptics.playPowerOn();
              else audioHaptics.playPowerOff();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shadow-md cursor-pointer ${
              isOn
                ? 'bg-amber-400 text-black shadow-amber-400/40 hover:bg-amber-300'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {isOn ? 'Turn Off' : 'Turn On'}
          </button>
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="w-full max-w-md px-4 py-3 flex-1 flex flex-col justify-start z-20">
        {/* In-App Android PWA Install Bar */}
        <PWAInstallBar
          forceOpenModal={showInstallModal}
          onCloseModal={() => setShowInstallModal(false)}
        />

        {/* iOS 27 Dynamic Hyper-Island 3.0 */}
        <DynamicHyperIsland
          isOn={isLightEffectivelyEmitting}
          onToggle={handleMasterToggle}
          brightness={brightness}
          beamAngle={beamAngle}
          kelvin={kelvin}
          isTurbo={isTurbo}
          onToggleTurbo={handleToggleTurbo}
          isStrobeActive={torchMode !== 'continuous'}
          onToggleStrobe={() => {
            setTorchMode((prev) => (prev === 'strobe' ? 'continuous' : 'strobe'));
          }}
          isSoundEnabled={isSoundEnabled}
          onToggleSound={handleToggleSound}
          onOpenScreenLantern={() => setIsScreenLanternOpen(true)}
          batteryLevel={telemetry.batteryLevel}
          isHardwareActive={isHardwareTorchActive}
        />

        {/* View Routing: Master Console vs Control Center vs Lock Screen */}
        {viewMode === 'console' && (
          <div className="w-full mt-2 space-y-4">
            {/* Centerpiece 3D Photonic Core Button */}
            <PhotonicCoreButton
              isOn={isLightEffectivelyEmitting}
              onToggle={handleMasterToggle}
              brightness={brightness}
              beamAngle={beamAngle}
              kelvinColorHex={kelvinRgb.hex}
              isTurbo={isTurbo}
              mode={torchMode}
            />

            {/* Real Hardware Phone LED Flash Card */}
            <HardwareTorchToggleCard
              isHardwareTorchActive={isHardwareTorchActive}
              onRequestHardwareToggle={handleToggleHardwareTorch}
              isHardwareSupported={isHardwareSupported}
              isOn={isLightEffectivelyEmitting}
            />

            {/* Tactical Telemetry Bar */}
            <TacticalTelemetryBar
              telemetry={telemetry}
              isHardwareTorchActive={isHardwareTorchActive}
              onRequestHardwareToggle={handleToggleHardwareTorch}
              isHardwareSupported={isHardwareSupported}
              isSoundEnabled={isSoundEnabled}
              onToggleSound={handleToggleSound}
              isOn={isOn}
              isWakeLocked={isWakeLocked}
            />

            {/* Beam Optics & Spread Controls */}
            <BeamOpticsControls
              brightness={brightness}
              onBrightnessChange={(val) => {
                setBrightness(val);
                if (val > 100) setIsTurbo(true);
                else setIsTurbo(false);
              }}
              beamAngle={beamAngle}
              onBeamAngleChange={setBeamAngle}
              isTurbo={isTurbo}
              onToggleTurbo={handleToggleTurbo}
              kelvinColorHex={kelvinRgb.hex}
              isOn={isLightEffectivelyEmitting}
            />

            {/* Spectral Color Temperature Bar */}
            <ColorSpectrumBar
              kelvin={kelvin}
              onKelvinChange={setKelvin}
              kelvinColorHex={kelvinRgb.hex}
            />

            {/* Signaling & Strobe Suite */}
            <StrobeMatrix
              mode={torchMode}
              onModeChange={setTorchMode}
              strobeFrequency={strobeFrequency}
              onFrequencyChange={setStrobeFrequency}
              sosStepIndex={sosStepIndex}
              isAudioBeaconEnabled={isAudioBeaconEnabled}
              onToggleAudioBeacon={() => {
                setIsAudioBeaconEnabled((prev) => !prev);
                audioHaptics.playModeTap();
              }}
              isOn={isLightEffectivelyEmitting}
            />
          </div>
        )}

        {viewMode === 'control-center' && (
          <div className="w-full h-[620px] rounded-3xl ios-glass-card mt-2 p-4">
            <ControlCenterView
              isOn={isLightEffectivelyEmitting}
              onToggle={handleMasterToggle}
              brightness={brightness}
              onBrightnessChange={(val) => {
                setBrightness(val);
                if (val > 100) setIsTurbo(true);
                else setIsTurbo(false);
              }}
              kelvinColorHex={kelvinRgb.hex}
              onClose={() => {
                setViewMode('console');
                audioHaptics.playModeTap();
              }}
            />
          </div>
        )}

        {viewMode === 'lock-screen' && (
          <div className="w-full h-[620px] rounded-3xl ios-glass-card mt-2 overflow-hidden">
            <LockScreenView
              isOn={isLightEffectivelyEmitting}
              onToggle={handleMasterToggle}
              kelvinColorHex={kelvinRgb.hex}
              brightness={brightness}
              onUnlock={() => {
                setViewMode('console');
                audioHaptics.playModeTap();
              }}
            />
          </div>
        )}

        {/* Mobile View Switcher Tabs Bar */}
        <div className="sm:hidden flex items-center justify-around py-3 px-2 mt-4 rounded-2xl bg-black/60 border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => {
              setViewMode('console');
              audioHaptics.playModeTap();
            }}
            className={`py-1.5 px-3 rounded-xl transition-all ${
              viewMode === 'console' ? 'bg-white/20 text-white font-bold' : 'text-slate-400'
            }`}
          >
            Console
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode('control-center');
              audioHaptics.playModeTap();
            }}
            className={`py-1.5 px-3 rounded-xl transition-all ${
              viewMode === 'control-center' ? 'bg-white/20 text-white font-bold' : 'text-slate-400'
            }`}
          >
            Control Center
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode('lock-screen');
              audioHaptics.playModeTap();
            }}
            className={`py-1.5 px-3 rounded-xl transition-all ${
              viewMode === 'lock-screen' ? 'bg-white/20 text-white font-bold' : 'text-slate-400'
            }`}
          >
            Lock Screen
          </button>
        </div>
      </main>

      {/* Screen Torch Full-Display Lantern Modal */}
      <ScreenTorchModal
        isOpen={isScreenLanternOpen}
        onClose={() => setIsScreenLanternOpen(false)}
        kelvin={kelvin}
        onKelvinChange={setKelvin}
        kelvinColorHex={kelvinRgb.hex}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator />

      {/* Subtle Unboxed Editorial Footer */}
      <footer className="w-full max-w-md py-6 px-4 flex items-center justify-between text-xs text-slate-400 z-10 border-t border-white/5 mt-auto">
        <button
          type="button"
          onClick={() => {
            audioHaptics.playModeTap();
            setShowInstallModal(true);
          }}
          className="hover:text-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer text-slate-300"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>Install / QR Code</span>
        </button>
        <span aria-hidden="true">·</span>
        <span>Lumina iOS 27</span>
        <span aria-hidden="true">·</span>
        <span>Android PWA Ready</span>
      </footer>
    </div>
  );
}
