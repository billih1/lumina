import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  Download,
  X,
  CheckCircle2,
  Share2,
  PlusSquare,
  Sparkles,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Lightbulb,
  CloudUpload,
  Globe,
  Terminal,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { audioHaptics } from '../utils/audioHaptics';

interface PWAInstallBarProps {
  forceOpenModal?: boolean;
  onCloseModal?: () => void;
}

export const PWAInstallBar: React.FC<PWAInstallBarProps> = ({
  forceOpenModal = false,
  onCloseModal,
}) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(forceOpenModal);
  const [activeTab, setActiveTab] = useState<'install' | 'qr' | 'vercel' | 'features'>('install');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedVercelCmd, setCopiedVercelCmd] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    if (forceOpenModal) {
      setShowGuideModal(true);
    }
  }, [forceOpenModal]);

  // Determine public shareable app URL (converts internal dev proxy to public preview URL)
  const getPublicAppUrl = () => {
    if (typeof window === 'undefined') {
      return 'https://ais-pre-fby4fvqvfanqw5qmkluhuo-967047734242.asia-east1.run.app';
    }
    let url = window.location.href.split('?')[0];
    if (url.includes('ais-dev-')) {
      url = url.replace('ais-dev-', 'ais-pre-');
    }
    return url;
  };

  const appUrl = getPublicAppUrl();

  // Generate QR Code data URL
  useEffect(() => {
    if (appUrl) {
      QRCode.toDataURL(appUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#030712',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('QR code generation failed:', err));
    }
  }, [appUrl]);

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(appUrl);
      setCopiedLink(true);
      audioHaptics.playModeTap();
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleInstallClick = async () => {
    audioHaptics.playModeTap();
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        setInstallSuccess(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowGuideModal(false);
    if (onCloseModal) onCloseModal();
  };

  return (
    <>
      {/* Floating / Pinned Android Install Banner (Shown when not in standalone mode) */}
      {!isInstalled && !isDismissed && (
        <div className="w-full max-w-md mx-auto px-4 pt-2 pb-1 z-30">
          <div className="relative overflow-hidden rounded-2xl p-3.5 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-600/15 border border-amber-400/35 backdrop-blur-xl shadow-lg shadow-black/50">
            <div className="flex items-center justify-between gap-3">
              <div
                className="flex items-center gap-3 min-w-0 cursor-pointer"
                onClick={() => setShowGuideModal(true)}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30">
                  <Smartphone className="w-5 h-5 text-black" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white tracking-wide">
                      {isAndroid ? 'Install on Android Phone' : 'Install Phone App'}
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-amber-400/25 text-amber-300 rounded border border-amber-400/40">
                      PWA
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">
                    Tap to install or scan QR code with your phone
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-black text-xs font-bold shadow-sm shadow-amber-400/30 hover:brightness-110 active:scale-95 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isInstallable ? 'Install' : 'Guide'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDismissed(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Phone Installation Hub Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#0c1220] border border-white/20 p-5 shadow-2xl text-slate-100 my-auto animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-400 flex items-center justify-center text-black shadow-lg shadow-amber-400/30">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Install on Android Phone</h3>
                <p className="text-xs text-slate-400">Native full-screen app with real hardware flash</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 mb-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('install')}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                  activeTab === 'install'
                    ? 'bg-amber-400 text-black font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Install
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('qr')}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
                  activeTab === 'qr'
                    ? 'bg-amber-400 text-black font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Code</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('vercel')}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
                  activeTab === 'vercel'
                    ? 'bg-amber-400 text-black font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CloudUpload className="w-3.5 h-3.5" />
                <span>Vercel</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('features')}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                  activeTab === 'features'
                    ? 'bg-amber-400 text-black font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Perks
              </button>
            </div>

            {/* Tab 1: How to Install on Android */}
            {activeTab === 'install' && (
              <div className="space-y-3">
                {/* 1-Tap Install Button if Browser Supports beforeinstallprompt */}
                {isInstallable && (
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await install();
                      if (res) {
                        setInstallSuccess(true);
                        handleCloseModal();
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 text-black text-sm font-bold shadow-lg shadow-amber-400/30 hover:brightness-110 active:scale-95 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tap Here to Install App Now</span>
                  </button>
                )}

                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mt-2">
                  {isIOS ? 'Instructions for iPhone / iPad' : 'Google Chrome on Android Phone'}
                </div>

                {!isIOS ? (
                  <div className="space-y-2.5 text-xs text-slate-200">
                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/5">
                      <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 font-bold flex items-center justify-center shrink-0">
                        1
                      </span>
                      <span>
                        Open this link in <strong>Google Chrome</strong> or <strong>Samsung Internet</strong> on your Android phone.
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/5">
                      <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 font-bold flex items-center justify-center shrink-0">
                        2
                      </span>
                      <span>
                        Tap the <strong>three vertical dots (⋮)</strong> menu in Chrome's top-right corner.
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/5">
                      <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 font-bold flex items-center justify-center shrink-0">
                        3
                      </span>
                      <span>
                        Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong> and tap <strong>Install</strong>.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 text-xs text-slate-200">
                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/5">
                      <Share2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        Tap the <strong>Share</strong> button at the bottom of Safari.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/5">
                      <PlusSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        Scroll down and tap <strong>"Add to Home Screen"</strong>.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        Tap <strong>Add</strong>. Lumina will launch in full screen with no browser UI!
                      </span>
                    </div>
                  </div>
                )}

                {/* Share Link Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold border border-white/10 transition-colors"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Link to Open on Phone'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Scan QR Code */}
            {activeTab === 'qr' && (
              <div className="flex flex-col items-center justify-center py-2 space-y-3">
                <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-amber-400/40">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="Scan to open Lumina Torch on phone"
                      className="w-48 h-48 block rounded-lg"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-slate-600 text-xs">
                      Generating QR...
                    </div>
                  )}
                </div>

                <div className="text-center space-y-1 px-2">
                  <p className="text-xs font-bold text-white">
                    Scan with your Android Camera / Google Lens
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Points directly to your public preview URL:
                  </p>
                  <div className="p-1.5 rounded-lg bg-black/40 border border-white/10 text-[10px] font-mono text-amber-300 break-all select-all">
                    {appUrl}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 border border-amber-400/30 text-xs text-amber-300 hover:bg-amber-400/30 transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Direct URL'}</span>
                </button>

                {/* Why access error happens & how to fix */}
                <div className="w-full text-left p-3 rounded-2xl bg-amber-500/10 border border-amber-400/25 text-[11px] text-amber-200/95 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Seeing "You cannot access this"?</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    Google protects preview apps with your Google Account. Make sure your phone's browser is signed in with:
                  </p>
                  <div className="px-2 py-1 rounded bg-black/40 text-amber-300 font-mono text-[10px] font-bold">
                    tayyabhassan1530@gmail.com
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Deploy to Vercel */}
            {activeTab === 'vercel' && (
              <div className="space-y-3 py-1">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/15 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs">
                      ▲
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Deploy Free to Vercel</h4>
                      <p className="text-[10px] text-slate-300">Public .vercel.app link without Google login barriers</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Vercel hosts Lumina Torch publicly so any phone can open and install it without seeing Google access errors.
                  </p>
                </div>

                <div className="space-y-2 text-xs text-slate-200">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-black font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <div>
                      <strong className="text-white block">Export to GitHub</strong>
                      <span className="text-slate-300 text-[11px]">
                        Tap the <strong>GitHub / Export</strong> button in Google AI Studio to push this project to your GitHub account.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-black font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <div>
                      <strong className="text-white block">Import to Vercel</strong>
                      <span className="text-slate-300 text-[11px]">
                        Go to <strong>vercel.com/new</strong>, select the repository, and click <strong>Deploy</strong>. Pre-configured <code className="text-amber-300 bg-black/40 px-1 rounded">vercel.json</code> is already in the codebase!
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-black font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <div>
                      <strong className="text-white block">Install on Phone</strong>
                      <span className="text-slate-300 text-[11px]">
                        Your public <code className="text-amber-300 bg-black/40 px-1 rounded">*.vercel.app</code> link opens directly on any Android phone without logins!
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vercel CLI Quick Command */}
                <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Terminal className="w-3 h-3 text-amber-400" />
                      <span>Deploy via Terminal:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== 'undefined' && navigator.clipboard) {
                          navigator.clipboard.writeText('npx vercel --prod');
                          setCopiedVercelCmd(true);
                          setTimeout(() => setCopiedVercelCmd(false), 2000);
                        }
                      }}
                      className="text-[10px] text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedVercelCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedVercelCmd ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-1.5 rounded bg-black/70 text-[11px] font-mono text-emerald-400 select-all">
                    npx vercel --prod
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: App Perks */}
            {activeTab === 'features' && (
              <div className="space-y-2.5 text-xs text-slate-200 py-1">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Real Camera LED Torch</strong>
                    <span className="text-slate-300 text-[11px]">
                      Android Chrome connects to your phone's back camera LED flashlight with full brightness.
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Screen Never Sleeps (Wake Lock)</strong>
                    <span className="text-slate-300 text-[11px]">
                      Display stays continuously awake while the torch or lantern is ON.
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Works 100% Offline</strong>
                    <span className="text-slate-300 text-[11px]">
                      Cached by service worker. Works in remote areas, dark basements, or during power outages.
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                  <Smartphone className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Full-Screen Native Feel</strong>
                    <span className="text-slate-300 text-[11px]">
                      Hides browser address bars. Long-press the home screen icon to launch directly into Strobe or SOS!
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Dismiss Button */}
            <div className="mt-5">
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {installSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 p-3 rounded-2xl bg-emerald-500 text-black font-semibold text-xs shadow-xl animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Lumina installed to your Android home screen!</span>
        </div>
      )}
    </>
  );
};
