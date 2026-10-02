import React, { useState } from 'react';
import { audio } from '../audio/soundEngine';

interface RadioModalProps {
  currentFreq: number;
  onFreqChange: (freq: number) => void;
  onClose: () => void;
  hapticsEnabled: boolean;
}

export const RadioModal: React.FC<RadioModalProps> = ({
  currentFreq,
  onFreqChange,
  onClose,
  hapticsEnabled
}) => {
  const [activeTab, setActiveTab] = useState<'radio' | 'music'>('radio');
  const [freq, setFreq] = useState<number>(currentFreq);
  const [currentSelectedTrack, setCurrentSelectedTrack] = useState<string>(audio.currentTrack);

  const triggerHaptic = (len = 10) => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(len); } catch { /* ignore */ }
    }
  };

  const handleSlider = (val: number) => {
    setFreq(val);
    onFreqChange(val);
    audio.playRadioStatic();
    triggerHaptic(6);
  };

  const handleSwitchTrack = (trackId: string) => {
    triggerHaptic(15);
    audio.playClick();
    audio.playTrack(trackId);
    setCurrentSelectedTrack(trackId);
  };

  const trackList = Object.entries(audio.tracks);

  const getBroadcast = () => {
    const rounded = Math.round(freq * 10) / 10;
    if (Math.abs(rounded - 94.2) < 0.3) {
      return {
        source: 'SURVIVOR ENCLAVE // SECTION 12',
        status: 'CLEAR SIGNAL',
        message: '"...SOS... Section 12 bulkhead breached... floodwater entering lower quarantine... if anyone hears this, do NOT trust the acoustic mimics. Maintain frequency 94.2..."',
        color: 'text-amber-400 border-amber-600 bg-amber-950/40'
      };
    }
    if (Math.abs(rounded - 89.6) < 0.3) {
      return {
        source: 'AUTOMATED BUOY 04',
        status: 'CARRIER WAVE',
        message: '"HYDROSTATIC SENSORS REPORT DEFORMATION AT 6,000 METERS. RECURSION LOOP CYCLE 22 ACTIVE."',
        color: 'text-cyan-400 border-cyan-600 bg-cyan-950/40'
      };
    }
    if (Math.abs(rounded - 104.8) < 0.3) {
      return {
        source: 'UNKNOWN ENTITY // VOID FREQUENCY',
        status: 'ACOUSTIC REVERB',
        message: '"...you keep listening... we can hear your hydrophone... stop turning the dial..."',
        color: 'text-red-400 border-red-600 bg-red-950/40 animate-pulse'
      };
    }
    if (Math.abs(rounded - 84.4) < 0.3) {
      return {
        source: 'SECRET FREQUENCY: ENTITY 00 // CHAMBER ZERO',
        status: 'NON-EUCLIDEAN CIPHER',
        message: '"...[BINARY TRANSMISSION: 01001111 01001101 01000101 01000111 01000001]... THE DRAFTING COMPASS IS AT COORDINATE 0. THE ARCHITECT WAITS BEYOND THE BULKHEAD FRAME..."',
        color: 'text-purple-300 border-purple-500 bg-purple-950/50 shadow-[0_0_15px_rgba(168,85,247,0.4)] animate-pulse'
      };
    }
    if (Math.abs(rounded - 91.8) < 0.3) {
      return {
        source: 'U-884 PHANTOM SUBMERSIBLE HYDROPHONE',
        status: 'ACTIVE SONAR RETURNING',
        message: '"...PING... [SLOW METALLIC DIESEL ENGINE RUMBLE]... TORPEDO TUBE 1 PRESSURIZING... 80 YEARS IN THE CRUSH DEPTH... COMMENCE DIVE ANGLE 45..."',
        color: 'text-emerald-400 border-emerald-600 bg-emerald-950/40'
      };
    }
    if (Math.abs(rounded - 97.6) < 0.3) {
      return {
        source: 'HADAL BONE WEAVER CAVITY RECORDING',
        status: 'CALCIFIED RESONANCE',
        message: '"...do not cut the white cords... the cords are holding the ceiling up... every twitch in the wire rings our dinner bell..."',
        color: 'text-rose-300 border-rose-700 bg-rose-950/40'
      };
    }
    if (Math.abs(rounded - 101.4) < 0.3) {
      return {
        source: 'BASILICA OF THE SUNKEN REQUIEM // 18Hz',
        status: 'LITURGICAL INFRASOUND',
        message: '"...BENEDICTUS QUI VENIT IN NOMINE ABYSSI... KNEEL BEFORE THE CRUSH DEPTH, FOR WATER IS WITHOUT SIN..."',
        color: 'text-yellow-400 border-yellow-600 bg-yellow-950/40'
      };
    }
    if (Math.abs(rounded - 106.2) < 0.3) {
      return {
        source: 'CHRONO-LEVIATHAN TEMPORAL HORIZON',
        status: 'CAUSALITY REVERSAL DETECTED',
        message: '"...[SLOW 12Hz WHALE DRONE WITH TICKING GEARS]... YOU HAVE ALREADY HEARD THIS MESSAGE. YOU WILL HEAR IT AGAIN WHEN YOUR ADRENALINE RUNS OUT..."',
        color: 'text-sky-300 border-sky-600 bg-sky-950/40'
      };
    }
    return {
      source: 'WHITE NOISE STATIC',
      status: 'DISPERSED',
      message: '[ Low-frequency underwater hiss and distant metallic groaning ]',
      color: 'text-[#717c9e] border-[#222944] bg-[#0d101c]'
    };
  };

  const broadcast = getBroadcast();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-mono text-xs">
      <div className="bg-[#0b0e1c] border-2 border-[#333d64] max-w-xl w-full p-5 rounded-lg shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#212842] pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-lg">📻</span>
            <div>
              <h3 className="text-amber-400 font-bold uppercase tracking-wider text-sm">
                HADAL TRANSCEIVER &amp; SOUND ARCHIVE
              </h3>
              <span className="text-[10px] text-[#717e9f]">
                ACOUSTIC HYDROPHONE &amp; SYNTHESIZED SOUNDTRACKS
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic(8);
              audio.playClick();
              onClose();
            }}
            className="text-[#727d9e] hover:text-white px-2 py-0.5 border border-[#2b3350] rounded cursor-pointer"
          >
            DISCONNECT
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => {
              triggerHaptic(6);
              setActiveTab('radio');
            }}
            className={`flex-1 py-1.5 rounded border text-xs font-bold transition cursor-pointer ${
              activeTab === 'radio'
                ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'bg-[#121626] border-[#25304e] text-[#818ea8] hover:text-white'
            }`}
          >
            📡 RADIO FREQUENCY
          </button>
          <button
            onClick={() => {
              triggerHaptic(6);
              setActiveTab('music');
            }}
            className={`flex-1 py-1.5 rounded border text-xs font-bold transition cursor-pointer ${
              activeTab === 'music'
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-[#121626] border-[#25304e] text-[#818ea8] hover:text-white'
            }`}
          >
            🎵 HADAL SOUNDTRACKS ({trackList.length})
          </button>
        </div>

        {/* Tab 1: Radio */}
        {activeTab === 'radio' && (
          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            {/* Frequency Tuning Dial */}
            <div className="bg-[#121626] border border-[#273252] p-4 rounded text-center space-y-2">
              <div className="text-[11px] text-[#8e9abf]">ANALOG DIAL TUNER</div>
              <div className="text-3xl font-black text-amber-400 tracking-wider">
                {freq.toFixed(1)} <span className="text-sm text-[#707c9e]">MHz</span>
              </div>

              <input
                type="range"
                min="88.0"
                max="108.0"
                step="0.2"
                value={freq}
                onChange={e => handleSlider(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-[#636f94]">
                <span>88.0 MHz (VLF)</span>
                <span>94.2 (SURVIVOR)</span>
                <span>108.0 MHz (HIGH)</span>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              <button
                onClick={() => handleSlider(84.4)}
                className="py-1 bg-[#1a0e28] hover:bg-[#2c1244] text-purple-300 border border-purple-800 rounded text-[9px] font-bold cursor-pointer"
                title="Entity 00 Non-Euclidean Cipher"
              >
                84.4 [CIPHER]
              </button>
              <button
                onClick={() => handleSlider(89.6)}
                className="py-1 bg-[#121b2d] hover:bg-[#1a2c4e] text-cyan-400 border border-cyan-800 rounded text-[9px] font-bold cursor-pointer"
                title="Automated Buoy 04"
              >
                89.6 [BUOY]
              </button>
              <button
                onClick={() => handleSlider(91.8)}
                className="py-1 bg-[#0f231a] hover:bg-[#143d2c] text-emerald-300 border border-emerald-800 rounded text-[9px] font-bold cursor-pointer"
                title="U-884 Phantom Sub Sonar"
              >
                91.8 [U-884]
              </button>
              <button
                onClick={() => handleSlider(94.2)}
                className="py-1 bg-[#26190e] hover:bg-[#422915] text-amber-400 border border-amber-700 rounded text-[9px] font-bold cursor-pointer"
                title="Section 12 Survivor SOS"
              >
                94.2 [SOS]
              </button>
              <button
                onClick={() => handleSlider(101.4)}
                className="py-1 bg-[#231e0f] hover:bg-[#3d3215] text-yellow-300 border border-yellow-800 rounded text-[9px] font-bold cursor-pointer"
                title="Hadal Liturgist Infrasonic Requiem"
              >
                101.4 [HYMN]
              </button>
              <button
                onClick={() => handleSlider(104.8)}
                className="py-1 bg-[#260e15] hover:bg-[#44121f] text-red-400 border border-red-800 rounded text-[9px] font-bold cursor-pointer"
                title="Void Reverb Frequency"
              >
                104.8 [VOID]
              </button>
            </div>

            {/* Transmission Decoder */}
            <div className={`border p-3.5 rounded space-y-1.5 ${broadcast.color}`}>
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span>[SOURCE: {broadcast.source}]</span>
                <span>{broadcast.status}</span>
              </div>
              <p className="text-xs italic leading-relaxed select-text">
                {broadcast.message}
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Music Jukebox */}
        {activeTab === 'music' && (
          <div className="space-y-3 overflow-y-auto flex-1 pr-1">
            <div className="bg-[#121628] border border-cyan-800/80 p-3 rounded flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-cyan-400 font-bold block">NOW PLAYING:</span>
                <b className="text-white text-sm">
                  {audio.tracks[currentSelectedTrack]?.name || currentSelectedTrack}
                </b>
                <span className="text-[10px] text-[#8695b8] block mt-0.5">
                  BPM: {audio.tracks[currentSelectedTrack]?.bpm} // MOOD: {audio.tracks[currentSelectedTrack]?.mood}
                </span>
              </div>
              <button
                onClick={() => {
                  triggerHaptic(12);
                  audio.toggleMusic();
                }}
                className={`px-3 py-1.5 rounded font-bold text-xs border cursor-pointer transition ${
                  audio.musicMuted
                    ? 'bg-red-950 text-red-300 border-red-700'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                }`}
              >
                {audio.musicMuted ? 'UNMUTE MUSIC' : 'PAUSE / MUTE'}
              </button>
            </div>

            {/* Track Selection List */}
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {trackList.map(([id, t]) => {
                const isPlaying = currentSelectedTrack === id && !audio.musicMuted;

                return (
                  <button
                    key={id}
                    onClick={() => handleSwitchTrack(id)}
                    className={`w-full p-2.5 rounded border text-left flex items-center justify-between transition cursor-pointer ${
                      currentSelectedTrack === id
                        ? 'bg-cyan-950/70 border-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                        : 'bg-[#101424] border-[#222a42] hover:border-cyan-800 text-[#a0aed4] hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={isPlaying ? 'text-emerald-400 animate-pulse' : 'text-[#556382]'}>
                          {isPlaying ? '▶' : '♫'}
                        </span>
                        <b className="text-xs font-bold">{t.name}</b>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/40 text-cyan-300 border border-cyan-900">
                          {t.bpm} BPM
                        </span>
                      </div>
                      <span className="text-[10px] text-[#7181a4] block mt-0.5 line-clamp-1 italic">
                        {t.desc}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                        currentSelectedTrack === id
                          ? 'bg-cyan-900/80 border-cyan-400 text-cyan-200'
                          : 'bg-[#151c33] border-[#2b3554] text-[#6d799b]'
                      }`}
                    >
                      {currentSelectedTrack === id ? 'ACTIVE' : 'SELECT'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-right pt-2 border-t border-[#1f2742] shrink-0">
          <button
            onClick={() => {
              triggerHaptic(8);
              audio.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded transition cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
