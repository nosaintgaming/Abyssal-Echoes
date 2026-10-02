import React, { useState, useEffect, useRef } from 'react';
import { VoidEventData } from '../types';
import { audio } from '../audio/soundEngine';

interface VoidEventTerminalProps {
  voidEvent: VoidEventData;
  onEscapeSuccess: (escapeCode: string) => void;
  onEscapeFailedAttempt: (attemptCount: number) => void;
  hapticsEnabled?: boolean;
}

export const VoidEventTerminal: React.FC<VoidEventTerminalProps> = ({
  voidEvent,
  onEscapeSuccess,
  onEscapeFailedAttempt,
  hapticsEnabled
}) => {
  const [inputVal, setInputVal] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDecompressing, setIsDecompressing] = useState(false);
  const [glitchFlicker, setGlitchFlicker] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const triggerHaptic = (len = 25) => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(len);
      } catch {
        /* ignore */
      }
    }
  };

  // Play entry stinger and start glitch oscillation
  useEffect(() => {
    audio.playVoidBreachSound();
    triggerHaptic(60);

    const interval = window.setInterval(() => {
      setGlitchFlicker(prev => (prev + 1) % 4);
    }, 450);

    // Auto-focus input
    if (inputRef.current) {
      inputRef.current.focus();
    }

    return () => clearInterval(interval);
  }, []);

  const handleCharInput = (char: string) => {
    if (isDecompressing) return;
    audio.playClick();
    triggerHaptic(10);
    setInputVal(prev => (prev + char).toUpperCase());
    if (inputRef.current) inputRef.current.focus();
  };

  const handleBackspace = () => {
    if (isDecompressing) return;
    audio.playClick();
    setInputVal(prev => prev.slice(0, -1));
    if (inputRef.current) inputRef.current.focus();
  };

  const handleClear = () => {
    if (isDecompressing) return;
    audio.playClick();
    setInputVal('');
    if (inputRef.current) inputRef.current.focus();
  };

  const handleVerify = () => {
    if (isDecompressing) return;
    const cleanInput = inputVal.trim().toUpperCase().replace(/\s+/g, '');
    const targetCode = voidEvent.escapeCode.toUpperCase().replace(/\s+/g, '');

    if (cleanInput === targetCode) {
      // Escape Success!
      setIsDecompressing(true);
      setErrorMessage(null);
      audio.playVoidEscapeSuccess();
      triggerHaptic(80);

      window.setTimeout(() => {
        onEscapeSuccess(voidEvent.escapeCode);
      }, 1600);
    } else {
      // Failed attempt
      audio.playAlarm();
      audio.playGlitchDistortion();
      triggerHaptic(50);
      const nextAttempts = voidEvent.attempts + 1;
      onEscapeFailedAttempt(nextAttempts);
      setErrorMessage(`CHECKSUM MISMATCH: INVALID SEQUENCE [${cleanInput || 'NULL'}] // CORRUPTION ELEVATING`);

      if (nextAttempts >= 2) {
        setShowHint(true);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleVerify();
    }
  };

  // Quick characters present in target code for easy tap entry on mobile
  const uniqueCodeChars = Array.from(
    new Set([...voidEvent.escapeCode.toUpperCase().replace(/\s+/g, '').split(''), '-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
  ).slice(0, 16);

  return (
    <div
      id="void-event-screen"
      role="dialog"
      aria-modal="true"
      aria-label="Void Event Terminal Breach"
      className={`fixed inset-0 z-50 bg-[#030206] text-red-500 font-mono flex flex-col justify-between p-3 sm:p-6 overflow-hidden select-none transition-colors duration-300 ${
        isDecompressing ? 'bg-cyan-950 text-cyan-200' : ''
      }`}
    >
      {/* Glitch & CRT Scanline Overlay Layers */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.45)_50%)] bg-[length:100%_4px] z-10 opacity-70" />
      <div
        className={`pointer-events-none absolute inset-0 z-10 transition-opacity duration-150 ${
          glitchFlicker === 1
            ? 'opacity-30 bg-red-950/40 mix-blend-difference'
            : glitchFlicker === 3
            ? 'opacity-25 bg-cyan-950/40 mix-blend-exclusion'
            : 'opacity-0'
        }`}
      />

      {/* Top Telemetry & Anomaly Warning */}
      <header className="relative z-20 border-2 border-red-700/80 bg-red-950/70 p-3 sm:p-4 rounded-lg shadow-[0_0_40px_rgba(255,0,0,0.5)] flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <h1 className="text-sm sm:text-base font-black tracking-widest text-red-100 uppercase animate-pulse">
              ⚠️ CRITICAL VOID SINGULARITY // CHAMBER {voidEvent.chamber}
            </h1>
          </div>
          <p className="text-[11px] sm:text-xs text-red-300 font-bold tracking-wider">
            ANOMALY: {voidEvent.anomalyTitle} • DEPTH: {voidEvent.depth}m • ATTEMPTS: {voidEvent.attempts}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-black/80 border border-red-500 text-red-400 text-[10px] font-black rounded uppercase tracking-wider">
            STATUS: REALITY BUFFER SEVERED
          </span>
        </div>
      </header>

      {/* Terminal Body with Glitch Memory Hex Stream */}
      <main className="relative z-20 flex-1 my-3 bg-[#06040a]/90 border border-red-900/80 rounded-lg p-3 sm:p-5 overflow-y-auto flex flex-col justify-between shadow-inner space-y-4">
        {/* Terminal Header Narrative */}
        <div className="space-y-2 border-b border-red-900/60 pb-3">
          <div className="flex items-center justify-between text-[11px] text-red-400">
            <span>[KERNEL PANIC: 0x000000VOID]</span>
            <span>SYSTEM CORRUPTION: SEVERE</span>
          </div>
          <p className="text-xs sm:text-sm text-red-200 leading-relaxed">
            The sub-oceanic pressure hull has ceased to register physical matter. The expedition telemetry has disintegrated into a recursive void loop. You are stranded outside the material continuum.
          </p>
          <p className="text-[11px] sm:text-xs text-red-400/90 italic">
            To force emergency reality decompression, input the emergency escape checksum sequence hidden within the memory registers below.
          </p>
        </div>

        {/* Memory Diagnostic Log & Highlighted Escape Code Clue */}
        <div className="space-y-2.5 font-mono">
          <div className="text-[10px] text-red-400 uppercase font-black tracking-wider flex items-center justify-between">
            <span>MEMORY DUMP REGISTERS:</span>
            <span className="text-red-500 animate-pulse">[ANOMALOUS DATA STREAM]</span>
          </div>

          <div className="bg-black/90 p-3 rounded border border-red-800/60 space-y-1.5 text-[11px] sm:text-xs leading-tight overflow-x-auto">
            {voidEvent.diagnosticDump.map((line, idx) => (
              <div key={idx} className="text-red-400/80 flex items-center gap-2 font-mono">
                <span className="text-red-600 select-none">&gt;&gt;</span>
                <span>{line}</span>
              </div>
            ))}

            {/* High-visibility Emergency Override Key Banner */}
            <div className="my-2 p-2.5 bg-red-950/90 border-2 border-red-500 rounded flex flex-wrap items-center justify-between gap-2 shadow-[0_0_20px_rgba(255,0,0,0.4)]">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold text-sm">🔑</span>
                <div>
                  <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">
                    EMERGENCY OVERRIDE CHECKSUM:
                  </span>
                  <span className="text-xs sm:text-sm text-white font-black tracking-widest font-mono select-all">
                    {voidEvent.escapeCode}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  triggerHaptic(15);
                  setInputVal(voidEvent.escapeCode);
                  if (inputRef.current) inputRef.current.focus();
                }}
                className="px-2.5 py-1 bg-red-800 hover:bg-red-700 text-white font-black text-[10px] rounded uppercase border border-red-400 transition cursor-pointer"
                title="Autofill extracted checksum sequence"
              >
                INSERT TO PROMPT ➔
              </button>
            </div>
          </div>

          {/* Error Message Notice */}
          {errorMessage && (
            <div className="p-2 bg-red-950 border border-red-500 text-red-200 text-xs font-bold rounded flex items-center gap-2 animate-shake">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Decompression Screen */}
          {isDecompressing && (
            <div className="p-3 bg-cyan-950 border-2 border-cyan-400 text-cyan-200 rounded text-xs font-bold space-y-1 animate-pulse">
              <div className="flex items-center gap-2 text-sm text-cyan-100">
                <span>⚡</span>
                <span className="font-black">ESCAPE CHECKSUM ACCEPTED: {voidEvent.escapeCode}</span>
              </div>
              <p>COLLAPSING VOID HORIZON... DECOMPRESSING NEURAL COHERENCE... RESTORING DIVER TO SECTOR.</p>
            </div>
          )}
        </div>

        {/* Interactive Terminal Prompt Input */}
        <div className="space-y-2 pt-2 border-t border-red-900/60">
          <label htmlFor="void-escape-input" className="text-[10px] sm:text-xs font-black text-red-300 uppercase flex items-center justify-between">
            <span>INPUT ESCAPE CODE:</span>
            {showHint && (
              <span className="text-amber-400 font-bold">
                REQUIRED: <b className="underline font-mono">{voidEvent.escapeCode}</b>
              </span>
            )}
          </label>

          <div className="flex items-center gap-2">
            <span className="text-red-500 font-black text-sm select-none">root@void:~#</span>
            <input
              ref={inputRef}
              id="void-escape-input"
              type="text"
              value={inputVal}
              disabled={isDecompressing}
              onChange={e => setInputVal(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder={`TYPE: ${voidEvent.escapeCode}`}
              autoComplete="off"
              spellCheck="false"
              className="flex-1 px-3 py-2.5 bg-black border-2 border-red-600 focus:border-red-400 focus:ring-1 focus:ring-red-400 text-sm sm:text-base font-mono text-red-100 rounded outline-none placeholder-red-900/80 uppercase tracking-widest shadow-inner"
            />
            <button
              type="button"
              disabled={isDecompressing || !inputVal.trim()}
              onClick={handleVerify}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-black text-xs sm:text-sm rounded border border-red-400 uppercase tracking-wider transition cursor-pointer shadow-[0_0_15px_rgba(255,0,0,0.5)]"
            >
              EXECUTE ➔
            </button>
          </div>

          {/* Quick Character Buttons for Touch Devices */}
          <div className="pt-2 flex flex-wrap items-center gap-1">
            <span className="text-[9px] text-red-400 uppercase font-bold mr-1">KEYPAD:</span>
            {uniqueCodeChars.map(ch => (
              <button
                key={ch}
                type="button"
                disabled={isDecompressing}
                onClick={() => handleCharInput(ch)}
                className="w-8 h-8 flex items-center justify-center bg-[#180f1b] hover:bg-red-900/80 active:scale-95 text-red-200 border border-red-800 rounded font-mono text-xs font-black transition cursor-pointer"
              >
                {ch}
              </button>
            ))}
            <button
              type="button"
              disabled={isDecompressing}
              onClick={handleBackspace}
              className="px-2 h-8 flex items-center justify-center bg-[#251016] hover:bg-red-900 text-red-300 border border-red-700 rounded font-mono text-xs font-bold transition cursor-pointer"
            >
              DEL
            </button>
            <button
              type="button"
              disabled={isDecompressing}
              onClick={handleClear}
              className="px-2 h-8 flex items-center justify-center bg-[#200f14] hover:bg-red-900 text-red-400 border border-red-800 rounded font-mono text-xs font-bold transition cursor-pointer"
            >
              CLR
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Emergency Help & Safe Bypass */}
      <footer className="relative z-20 flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
        <span className="text-[10px] text-red-400/80">
          VOID PROTOCOL 0x25 • CRITICAL COGNITIVE THREAT • SOLVE TO RETURN
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              audio.playClick();
              setShowHint(prev => !prev);
            }}
            className="px-2.5 py-1 bg-[#160d16] hover:bg-[#251224] text-amber-300 border border-amber-800/80 rounded text-[10px] font-bold uppercase transition cursor-pointer"
          >
            {showHint ? 'HIDE OVERRIDE HINT' : 'OVERRIDE HINT'}
          </button>

          {/* Emergency fail-safe if the player struggled (>= 3 attempts) */}
          {voidEvent.attempts >= 3 && (
            <button
              type="button"
              disabled={isDecompressing}
              onClick={() => {
                setInputVal(voidEvent.escapeCode);
                triggerHaptic(30);
              }}
              className="px-2.5 py-1 bg-amber-900 hover:bg-amber-800 text-amber-100 border border-amber-500 rounded text-[10px] font-black uppercase transition cursor-pointer animate-pulse"
            >
              AUTOPASTE OVERRIDE CODE
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};
