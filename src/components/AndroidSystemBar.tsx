import React, { useState, useEffect } from 'react';
import { usePWAInstall, useOnlineStatus } from '../utils/usePWAInstall';
import { audio } from '../audio/soundEngine';

interface AndroidSystemBarProps {
  chamber: number;
  maxChambers: number;
  hapticsEnabled: boolean;
  onToggleHaptics: () => void;
  activeEntity?: string;
  onOpenEntities?: () => void;
}

export const AndroidSystemBar: React.FC<AndroidSystemBarProps> = ({
  chamber,
  maxChambers,
  hapticsEnabled,
  onToggleHaptics,
  activeEntity,
  onOpenEntities
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showAndroidInfoModal, setShowAndroidInfoModal] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Battery API detection if available on Android
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as unknown as { getBattery: () => Promise<{ level: number }> }).getBattery()
        .then(battery => {
          setBatteryLevel(Math.round(battery.level * 100));
        })
        .catch(() => {
          setBatteryLevel(88);
        });
    } else {
      setBatteryLevel(88);
    }
  }, []);

  const triggerAndroidHaptic = (pattern: number | number[]) => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // unsupported
      }
    }
  };

  return (
    <>
      <div className="w-full bg-[#030408] border-b border-[#1a1f33] px-3 py-1.5 flex flex-wrap items-center justify-between text-[11px] font-mono select-none z-30 shadow-md">
        {/* Left: Android Exclusive OS Badge & Time */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerAndroidHaptic([15, 30, 15]);
              audio.playClick();
              setShowAndroidInfoModal(true);
            }}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-400 border border-emerald-600/70 font-black tracking-wider transition cursor-pointer"
            title="Android Exclusive Hadal System Info"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px]">A-OS 15 HADAL EXCLUSIVE</span>
          </button>

          <span className="text-slate-400 font-bold hidden xs:inline">
            {currentTime || '12:00'}
          </span>
        </div>

        {/* Center: Offline Air-Gapped Subsurface Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#0a0d17] border border-[#273252] rounded text-[10px] text-cyan-300">
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-cyan-400' : 'bg-amber-400 animate-ping'}`} />
            <span className="font-semibold tracking-wide">
              {isOnline ? 'OFFLINE SECURE // LOCAL ENGINE' : 'AIR-GAPPED // 100% OFFLINE'}
            </span>
          </div>

          {activeEntity && onOpenEntities && (
            <button
              onClick={() => {
                triggerAndroidHaptic(20);
                audio.playEntityStinger(45);
                onOpenEntities();
              }}
              className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-700/80 rounded text-[10px] font-bold cursor-pointer transition"
            >
              <span>👁️</span>
              <span className="truncate max-w-[120px]">{activeEntity.toUpperCase()} ADAPTING</span>
            </button>
          )}
        </div>

        {/* Right: Android Telemetry Icons & In-App PWA Install */}
        <div className="flex items-center gap-2">
          {/* Haptic Quick Toggle */}
          <button
            onClick={() => {
              onToggleHaptics();
              triggerAndroidHaptic([30, 50, 30]);
              audio.playClick();
            }}
            className={`px-1.5 py-0.5 rounded border text-[10px] font-bold transition cursor-pointer ${
              hapticsEnabled
                ? 'bg-amber-950/70 text-amber-300 border-amber-600'
                : 'bg-[#12141f] text-slate-500 border-[#2b3047]'
            }`}
            title={hapticsEnabled ? 'Android Haptics: ON' : 'Android Haptics: OFF'}
          >
            📳 {hapticsEnabled ? 'HAPTIC' : 'MUTE'}
          </button>

          {/* Battery Status */}
          <div className="flex items-center gap-1 text-slate-300 text-[10px]">
            <span className="text-emerald-400">🔋</span>
            <span>{batteryLevel !== null ? `${batteryLevel}%` : '88%'}</span>
          </div>

          {/* Android PWA Install Button */}
          {isInstallable && !isInstalled && (
            <button
              onClick={() => {
                triggerAndroidHaptic([40, 60, 40]);
                install();
              }}
              className="px-2 py-0.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-black font-black rounded border border-emerald-300 text-[10px] uppercase tracking-wider shadow-[0_0_12px_rgba(16,185,129,0.5)] cursor-pointer transition animate-pulse"
            >
              INSTALL APK / PWA
            </button>
          )}
        </div>
      </div>

      {/* Android Exclusive System Dossier Modal */}
      {showAndroidInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0d18] border-2 border-emerald-500 rounded-lg p-5 font-mono shadow-[0_0_40px_rgba(16,185,129,0.3)] space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-emerald-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <div>
                  <h3 className="text-emerald-400 font-black text-sm uppercase tracking-wider">
                    ANDROID EXCLUSIVE TACTICAL FRAMEWORK
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    A-OS 15 HADAL AIR-GAPPED SPECIFICATION
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  triggerAndroidHaptic(10);
                  setShowAndroidInfoModal(false);
                }}
                className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded font-bold border border-emerald-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-slate-300 leading-relaxed text-[11px]">
              <div className="bg-[#050810] border border-emerald-900/60 p-3 rounded space-y-1.5">
                <b className="text-emerald-400 block font-bold">1. 100% AIR-GAPPED OFFLINE OPERATION</b>
                <p className="text-slate-400">
                  All procedural scenarios, audio synthesis engines, AI behavioral models, and abyss memory storage run 100% locally on your Android device. Zero external network telemetry required.
                </p>
              </div>

              <div className="bg-[#050810] border border-emerald-900/60 p-3 rounded space-y-1.5">
                <b className="text-emerald-400 block font-bold">2. ANDROID HARDWARE HAPTIC FEEDBACK</b>
                <p className="text-slate-400">
                  Custom frequency vibrations calibrate with entity proximity, hull decompression, and hydraulic bulkhead locks.
                </p>
                <button
                  onClick={() => {
                    triggerAndroidHaptic([40, 80, 40, 120, 40]);
                    audio.playHeartbeat();
                  }}
                  className="mt-1 px-2.5 py-1 bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 rounded font-bold border border-emerald-600 text-[10px] cursor-pointer"
                >
                  TEST HAPTIC SENSOR PULSE (VIBRATE)
                </button>
              </div>

              <div className="bg-[#050810] border border-emerald-900/60 p-3 rounded space-y-1.5">
                <b className="text-emerald-400 block font-bold">3. ANDROID SYSTEM NAVIGATION GESTURE BINDING</b>
                <p className="text-slate-400">
                  Hardware and gesture Back button events natively intercept open modals, preventing accidental page exit during critical hadal encounters.
                </p>
              </div>

              <div className="bg-[#050810] border border-emerald-900/60 p-3 rounded space-y-1.5">
                <b className="text-emerald-400 block font-bold">4. SENTIENT ENTITY NEURAL ADAPTATION</b>
                <p className="text-slate-400">
                  Entities monitor touch velocity, door selection bias, and hesitation duration, mutating their countermeasures specifically to exploit your behavioral habits.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                triggerAndroidHaptic(10);
                setShowAndroidInfoModal(false);
              }}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-black rounded uppercase tracking-wider text-xs transition cursor-pointer"
            >
              RESUME HADAL MISSION
            </button>
          </div>
        </div>
      )}
    </>
  );
};
