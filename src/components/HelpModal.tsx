import React, { useState } from 'react';
import { audio } from '../audio/soundEngine';

interface HelpModalProps {
  onClose: () => void;
  hapticsEnabled: boolean;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose, hapticsEnabled }) => {
  const [activeTab, setActiveTab] = useState<'basics' | 'entities' | 'crafting' | 'controls'>('basics');

  const triggerHaptic = (len = 10) => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(len); } catch { /* ignore */ }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0b0e1b] border-2 border-[#3a446c] w-full max-w-2xl max-h-[90vh] rounded-lg shadow-2xl flex flex-col font-mono text-xs overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#101424] border-b border-[#2a3352]">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-base">❓</span>
            <h3 className="text-amber-400 font-bold tracking-wider text-sm sm:text-base uppercase">
              TACTICAL SURVIVAL FIELD GUIDE
            </h3>
          </div>
          <button
            onClick={() => {
              triggerHaptic(8);
              audio.playClick();
              onClose();
            }}
            className="w-7 h-7 flex items-center justify-center bg-[#181d32] hover:bg-red-950 text-white border border-[#374268] hover:border-red-500 rounded font-bold transition cursor-pointer"
            aria-label="Close Guide"
          >
            ✕
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#232a44] bg-[#0c0f1e] overflow-x-auto">
          {[
            { id: 'basics', label: 'SURVIVAL PROTOCOLS' },
            { id: 'entities', label: 'ENTITY THREATS' },
            { id: 'crafting', label: 'CRAFTING & BELT' },
            { id: 'controls', label: 'CONTROLS & SHORTCUTS' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic(6);
                audio.playClick();
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`px-3 py-2 text-[11px] font-bold tracking-wider whitespace-nowrap transition cursor-pointer border-r border-[#232a44] ${
                activeTab === tab.id
                  ? 'bg-[#19223c] text-amber-400 border-b-2 border-b-amber-400'
                  : 'text-[#8b97bc] hover:bg-[#12172b] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 leading-relaxed text-[#c4cee8]">
          {activeTab === 'basics' && (
            <div className="space-y-3">
              <div className="bg-[#12162a] border border-[#2b3558] p-3 rounded">
                <h4 className="text-emerald-400 font-bold mb-1 uppercase">1. SANITY MANAGEMENT</h4>
                <p className="text-[11px] text-[#a0accf]">
                  Sanity represents your psychological resistance to abyssal hydrostatic pressure. If Sanity falls to 0%, your consciousness shatters and the run terminates immediately unless an emergency Revive is available. Use Stims, Trauma Medkits, and quiet decisions to stabilize Sanity.
                </p>
              </div>

              <div className="bg-[#12162a] border border-[#2b3558] p-3 rounded">
                <h4 className="text-red-400 font-bold mb-1 uppercase">2. CORRUPTION PERMEATION</h4>
                <p className="text-[11px] text-[#a0accf]">
                  Corruption measures eldritch biological and neural contamination from the deep ocean. If Corruption reaches 100%, you succumb to the abyss. At high corruption, chamber descriptions mutate and false signals appear.
                </p>
              </div>

              <div className="bg-[#12162a] border border-[#2b3558] p-3 rounded">
                <h4 className="text-amber-400 font-bold mb-1 uppercase">3. ACOUSTIC NOISE & THREAT</h4>
                <p className="text-[11px] text-[#a0accf]">
                  Choices flagged as <b className="text-red-400">[LOUD]</b> raise your acoustic noise signature. Entities such as <b className="text-red-400">The Listener</b> track hydraulic clatter, gunshots, and alarms. High threat triggers emergency proximity breaches!
                </p>
              </div>

              <div className="bg-[#1a0f1c] border border-red-900/80 p-3 rounded">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-red-400 font-bold uppercase flex items-center gap-1.5">
                    <span>🌀</span> 4. RARE 'VOID EVENTS' (EVERY 25 CHAMBERS)
                  </h4>
                  <span className="text-[10px] text-red-300 bg-red-950/80 px-2 py-0.5 rounded border border-red-700">
                    ANOMALOUS SINGULARITY
                  </span>
                </div>
                <p className="text-[11px] text-[#cca]">
                  Every 25 chambers, hadal hydrostatic pressure breaches local reality, temporarily replacing your entire interface with a distorted, flickering terminal readout. You must locate the emergency escape override key within the glitched memory registers and execute it into the prompt to escape back into the sector.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'entities' && (
            <div className="space-y-2.5">
              <div className="bg-[#181216] border border-red-900/60 p-3 rounded">
                <div className="flex justify-between items-center mb-1">
                  <b className="text-red-400">THE LISTENER (THREAT 5/5)</b>
                  <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded">ACOUSTIC STALKER</span>
                </div>
                <p className="text-[11px] text-[#cca]">
                  Blind predator attuned to underwater vibrations. <b className="text-white">Counter:</b> Choose quiet options, employ Acoustic Dampers (Earplugs), and avoid forcing doors.
                </p>
              </div>

              <div className="bg-[#181216] border border-red-900/60 p-3 rounded">
                <div className="flex justify-between items-center mb-1">
                  <b className="text-red-400">THE WARDEN (THREAT 4/5)</b>
                  <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded">PATTERN ADAPTIVE</span>
                </div>
                <p className="text-[11px] text-[#cca]">
                  Station defense intelligence that learns repeated player choices. <b className="text-white">Counter:</b> Vary decision strategies each chamber.
                </p>
              </div>

              <div className="bg-[#181216] border border-red-900/60 p-3 rounded">
                <div className="flex justify-between items-center mb-1">
                  <b className="text-red-400">THE MIMIC (THREAT 4/5)</b>
                  <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded">DECEPTIVE LURE</span>
                </div>
                <p className="text-[11px] text-[#cca]">
                  Duplicates safe choices and familiar distress calls. <b className="text-white">Counter:</b> Inspect using the UV Cryptographic Scanner and cross-reference logs.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'crafting' && (
            <div className="space-y-3">
              <div className="bg-[#12162a] border border-[#2b3558] p-3 rounded">
                <h4 className="text-amber-400 font-bold mb-1.5 uppercase">KEY SYNTHESIS RECIPES</h4>
                <div className="space-y-1 text-[11px]">
                  <p>• <b className="text-white">Flashlight + Lens</b> = <span className="text-cyan-300">UV Cryptographic Scanner</span> (Detects hidden codes)</p>
                  <p>• <b className="text-white">Crowbar + Wire</b> = <span className="text-cyan-300">Tactical Grapple Rig</span> (Enables vertical shaft bypass)</p>
                  <p>• <b className="text-white">Stim + Medkit</b> = <span className="text-cyan-300">Surgical Trauma Kit</span> (Restores +60 Sanity, -10 Corruption)</p>
                </div>
              </div>

              <div className="bg-[#12162a] border border-[#2b3558] p-3 rounded">
                <h4 className="text-cyan-400 font-bold mb-1 uppercase">QUICK TACTICAL BELT</h4>
                <p className="text-[11px] text-[#a0accf]">
                  Usable consumables (Stims, Medkits, Flares) now appear in the Quick Belt right in the chamber view! You can tap them to restore health instantly without breaking descent momentum.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="space-y-3">
              <div className="bg-[#12162a] border border-[#2b3558] p-3 rounded">
                <h4 className="text-cyan-400 font-bold mb-1 uppercase">ACCESSIBILITY & SHORTCUTS</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] mt-2">
                  <div className="p-2 bg-black/40 rounded border border-[#222944]">
                    <b className="text-amber-400">⛶ FULLSCREEN:</b>
                    <p className="text-[#a0a8cc] mt-0.5">Toggle immersive edge-to-edge mode in the top header or settings.</p>
                  </div>
                  <div className="p-2 bg-black/40 rounded border border-[#222944]">
                    <b className="text-amber-400">📳 HAPTICS:</b>
                    <p className="text-[#a0a8cc] mt-0.5">Enable or disable tactile device vibration on phone and compatible controllers.</p>
                  </div>
                  <div className="p-2 bg-black/40 rounded border border-[#222944]">
                    <b className="text-amber-400">🔊 AUDIO SYNTH:</b>
                    <p className="text-[#a0a8cc] mt-0.5">Toggle live horror drone and thematic arpeggios, adjust volume levels.</p>
                  </div>
                  <div className="p-2 bg-black/40 rounded border border-[#222944]">
                    <b className="text-amber-400">💾 AUTOSAVE:</b>
                    <p className="text-[#a0a8cc] mt-0.5">Progress saves automatically after every chamber decision.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#101424] border-t border-[#2a3352] flex justify-end">
          <button
            onClick={() => {
              triggerHaptic(8);
              audio.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded transition cursor-pointer text-xs uppercase"
          >
            DISMISS FIELD GUIDE
          </button>
        </div>
      </div>
    </div>
  );
};
