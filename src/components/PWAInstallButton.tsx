import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { audio } from '../audio/soundEngine';

interface PWAInstallButtonProps {
  compact?: boolean;
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  compact = false,
  className = ''
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  const triggerHaptic = (len = 15) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(len);
      } catch {
        // ignore
      }
    }
  };

  const handleInstallClick = async () => {
    triggerHaptic(25);
    audio.playClick();
    await install();
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (compact) {
      return (
        <button
          onClick={handleInstallClick}
          className={`px-2 py-1 text-[11px] font-black rounded border transition flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 hover:from-emerald-900 hover:to-teal-800 text-emerald-300 border-emerald-600/80 shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse ${className}`}
          title="Install Abyssal Echoes to Android Home Screen"
        >
          <span className="text-xs">📲</span>
          <span className="hidden sm:inline">INSTALL APP</span>
        </button>
      );
    }

    return (
      <button
        onClick={handleInstallClick}
        className={`w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-black font-black text-xs uppercase tracking-wider rounded border border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)] cursor-pointer transition flex items-center justify-center gap-2 ${className}`}
      >
        <span>📲</span>
        <span>INSTALL TO ANDROID DEVICE (OFFLINE PWA)</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => {
            triggerHaptic(10);
            audio.playClick();
            setShowIOSGuide(true);
          }}
          className={`px-2.5 py-1 text-[11px] font-bold rounded border transition flex items-center gap-1 cursor-pointer bg-[#121526] hover:bg-[#1c223d] text-cyan-300 border-cyan-800 ${className}`}
        >
          <span>📲</span>
          <span>Install Guide</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="w-full max-w-sm rounded-xl bg-[#090c18] border-2 border-cyan-600 p-6 shadow-2xl text-slate-200 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-cyan-900 pb-2">
                <h3 className="text-sm font-black text-cyan-400 uppercase tracking-wider">
                  Install on iOS / Safari
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="px-2 py-0.5 bg-cyan-950 text-cyan-300 rounded font-bold border border-cyan-800"
                >
                  ✕
                </button>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                1. Tap the <strong>Share</strong> icon in the Safari toolbar.<br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
                3. Launch from your home screen for full offline Hadal descent.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-black uppercase tracking-wider rounded transition cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback: If not installable yet or desktop browser
  if (!compact) {
    return (
      <div className="p-3 bg-[#080a14] border border-[#232945] rounded text-[11px] text-slate-400 font-mono flex items-center justify-between">
        <span>OFFLINE STANDALONE PWA:</span>
        <span className="text-emerald-400 font-bold">READY IN COMPATIBLE BROWSER</span>
      </div>
    );
  }

  return null;
};
