import React, { useState } from 'react';
import { ATLAS_MAPS } from '../data/maps';
import { ENTITIES } from '../data/entities';
import { audio } from '../audio/soundEngine';

export interface CustomDescentConfig {
  title: string;
  synopsis: string;
  stages: number;
  startingSanity: number;
  startingRevives: number;
  stalkerEntity: string;
  hazards: string[];
  mapId?: number;
}

interface CustomDescentModalProps {
  onLaunch: (config: CustomDescentConfig) => void;
  onClose: () => void;
  hapticsEnabled: boolean;
}

const AVAILABLE_HAZARDS = [
  'Extreme Hydrostatic Pressure (1,100+ Bar)',
  'Acoustic Distortion Waves',
  'Bioluminescent Spore Blooms',
  'Subsea Radiation Leaks',
  'Void Gravity Shearing',
  'Thermal Vent Eruptions',
  'Cryogenic Brine Pools',
  'Hull Micro-Fractures'
];

export const CustomDescentModal: React.FC<CustomDescentModalProps> = ({
  onLaunch,
  onClose,
  hapticsEnabled
}) => {
  const triggerHaptic = (len = 10) => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(len); } catch { /* ignore */ }
    }
  };

  const [mode, setMode] = useState<'existing_map' | 'custom_story'>('existing_map');
  const [selectedMapId, setSelectedMapId] = useState<number>(ATLAS_MAPS[0].id);
  const [customTitle, setCustomTitle] = useState<string>('EXPEDITION BOREAS-IX: TECTONIC CREVASSE');
  const [customSynopsis, setCustomSynopsis] = useState<string>(
    'A decommissioned titanium deep-trench research crawler lies severed along the Challenger Fault. Descend through the shattered decompression bays and recover the black box.'
  );
  const [stages, setStages] = useState<number>(30);
  const [startingSanity, setStartingSanity] = useState<number>(100);
  const [startingRevives, setStartingRevives] = useState<number>(1);
  const [stalkerEntity, setStalkerEntity] = useState<string>(ENTITIES[0].name);
  const [selectedHazards, setSelectedHazards] = useState<string[]>([
    AVAILABLE_HAZARDS[0],
    AVAILABLE_HAZARDS[1]
  ]);

  const toggleHazard = (hazard: string) => {
    triggerHaptic(8);
    audio.playClick();
    setSelectedHazards(prev =>
      prev.includes(hazard) ? prev.filter(h => h !== hazard) : [...prev, hazard]
    );
  };

  const selectedMap = ATLAS_MAPS.find(m => m.id === selectedMapId) || ATLAS_MAPS[0];

  const handleLaunchDescent = () => {
    triggerHaptic(30);
    audio.playSolve();

    const config: CustomDescentConfig = {
      title: mode === 'existing_map' ? selectedMap.name : (customTitle.trim() || 'UNNAMED DESCENT'),
      synopsis: mode === 'existing_map' ? selectedMap.desc : (customSynopsis.trim() || 'A lone diver plunges into the silent deep.'),
      stages: Math.max(5, Math.min(250, stages)),
      startingSanity,
      startingRevives,
      stalkerEntity,
      hazards: mode === 'existing_map' ? selectedMap.hazards : selectedHazards,
      mapId: mode === 'existing_map' ? selectedMap.id : 999
    };

    onLaunch(config);
  };

  const estimatedDepthMeters = Math.round(stages * 65.4 + (mode === 'existing_map' ? selectedMap.id * 120 : 500));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-4 font-mono text-xs overflow-y-auto">
      <div className="bg-[#0b0e1b] border-2 border-[#374268] max-w-2xl w-full max-h-[92vh] rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#101424] border-b border-[#232a42]">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 text-base">🛠️</span>
            <div>
              <h3 className="text-cyan-400 font-bold uppercase tracking-wider text-sm">
                CUSTOM DESCENT WORKSHOP
              </h3>
              <p className="text-[10px] text-[#7d8bb2]">
                Custom Story Authoring &amp; Chamber Calibration (5 to 250 Stages)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic(8);
              audio.playClick();
              onClose();
            }}
            className="w-7 h-7 flex items-center justify-center bg-[#181d32] hover:bg-red-950 text-white border border-[#374268] rounded font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#121628] rounded border border-[#2b3558]">
            <button
              onClick={() => {
                triggerHaptic(10);
                audio.playClick();
                setMode('existing_map');
              }}
              className={`py-2 px-3 rounded font-bold transition flex items-center justify-center gap-1.5 ${
                mode === 'existing_map'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500'
                  : 'text-[#8290b5] hover:text-white'
              }`}
            >
              <span>🗺️</span>
              <span>PLAY KNOWN SECTOR</span>
            </button>
            <button
              onClick={() => {
                triggerHaptic(10);
                audio.playClick();
                setMode('custom_story');
              }}
              className={`py-2 px-3 rounded font-bold transition flex items-center justify-center gap-1.5 ${
                mode === 'custom_story'
                  ? 'bg-amber-950 text-amber-300 border border-amber-500'
                  : 'text-[#8290b5] hover:text-white'
              }`}
            >
              <span>✍️</span>
              <span>AUTHOR CUSTOM STORY</span>
            </button>
          </div>

          {/* Mode A: Existing Sector Map */}
          {mode === 'existing_map' && (
            <div className="bg-[#121628] border border-[#2b3558] p-3 rounded space-y-2">
              <label className="text-[11px] text-[#93a0c5] font-bold block uppercase">
                CHOOSE TARGET EXPEDITION SECTOR:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ATLAS_MAPS.map(map => (
                  <div
                    key={map.id}
                    onClick={() => {
                      triggerHaptic(8);
                      audio.playClick();
                      setSelectedMapId(map.id);
                    }}
                    className={`p-2.5 rounded border text-[10px] cursor-pointer transition ${
                      selectedMapId === map.id
                        ? 'bg-[#1b2542] border-cyan-400 text-cyan-200'
                        : 'bg-[#131728] border-[#252f4c] text-[#8e9abf] hover:text-white hover:border-[#384670]'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <b className="font-bold text-[11px]">{map.name}</b>
                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-black/50 text-cyan-300 font-black border border-cyan-900/60">
                        {map.tier}
                      </span>
                    </div>
                    <p className="text-[9px] text-[#7b89ad] line-clamp-2 leading-tight">
                      {map.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mode B: Author Custom Story */}
          {mode === 'custom_story' && (
            <div className="bg-[#121628] border border-[#2b3558] p-3 rounded space-y-3">
              <div>
                <label className="text-[11px] text-amber-400 font-bold block uppercase mb-1">
                  CUSTOM EXPEDITION DESIGNATION:
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  placeholder="e.g. OPERATION LEVIATHAN BONE..."
                  className="w-full bg-[#0a0d18] border border-[#2d385e] rounded px-3 py-1.5 text-amber-300 text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-amber-400 font-bold block uppercase mb-1">
                  MISSION NARRATIVE &amp; LORE SYNOPSIS:
                </label>
                <textarea
                  value={customSynopsis}
                  onChange={e => setCustomSynopsis(e.target.value)}
                  rows={3}
                  placeholder="Describe the doomed underwater research facility, wreck, or crevasse..."
                  className="w-full bg-[#0a0d18] border border-[#2d385e] rounded p-2 text-[#b7c3e4] text-xs focus:outline-none focus:border-amber-400 font-mono leading-relaxed"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#93a0c5] font-bold block uppercase mb-1.5">
                  SELECT ENVIRONMENTAL HAZARDS:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_HAZARDS.map(hazard => {
                    const isSelected = selectedHazards.includes(hazard);
                    return (
                      <button
                        key={hazard}
                        type="button"
                        onClick={() => toggleHazard(hazard)}
                        className={`px-2 py-1 text-[9px] font-bold rounded border transition cursor-pointer ${
                          isSelected
                            ? 'bg-amber-950 text-amber-300 border-amber-500'
                            : 'bg-[#15192c] text-[#7f8dae] border-[#2a3454] hover:text-white'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {hazard}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Stage Count Configurator (5 to 250 Stages) */}
          <div className="bg-[#121628] border border-[#2b3558] p-3 rounded space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-[11px] text-cyan-300 font-bold uppercase">
                EXPEDITION DEPTH STAGES (5 - 250 CHAMBERS):
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#7f8dae]">EXACT COUNT:</span>
                <input
                  type="number"
                  min={5}
                  max={250}
                  value={stages}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      setStages(Math.max(5, Math.min(250, val)));
                    }
                  }}
                  className="w-16 bg-[#0a0d18] border border-cyan-500 rounded px-2 py-0.5 text-center text-cyan-300 font-black text-xs"
                />
                <span className="text-cyan-400 font-black text-xs">STAGES</span>
              </div>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="5"
              max="250"
              step="1"
              value={stages}
              onChange={e => setStages(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: '5 (SPRINT)', count: 5 },
                { label: '15 (RECON)', count: 15 },
                { label: '30 (STANDARD)', count: 30 },
                { label: '50 (DEEP TRENCH)', count: 50 },
                { label: '100 (CENTURY)', count: 100 },
                { label: '150 (HADAL VOID)', count: 150 },
                { label: '250 (MARATHON)', count: 250 }
              ].map(preset => (
                <button
                  key={preset.count}
                  type="button"
                  onClick={() => {
                    triggerHaptic(8);
                    audio.playClick();
                    setStages(preset.count);
                  }}
                  className={`px-2 py-1 rounded text-[9px] font-bold border transition cursor-pointer ${
                    stages === preset.count
                      ? 'bg-cyan-900 text-white border-cyan-400'
                      : 'bg-[#15192c] text-[#8694b8] border-[#293352] hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="text-[10px] text-[#7180a5] flex justify-between pt-1 border-t border-[#1e2642]">
              <span>PROJECTED TERMINAL DEPTH: <b className="text-amber-300">{estimatedDepthMeters.toLocaleString()}m</b></span>
              <span>ESTIMATED DURATION: ~{Math.round(stages * 1.5)} MIN</span>
            </div>
          </div>

          {/* Expedition Survival Calibrations */}
          <div className="bg-[#121628] border border-[#2b3558] p-3 rounded space-y-3">
            <b className="text-[11px] text-[#93a0c5] font-bold uppercase block">
              SURVIVAL CALIBRATION &amp; APEX ENTITY:
            </b>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Primary Stalking Entity */}
              <div>
                <label className="text-[10px] text-red-400 font-bold block mb-1">
                  PRIMARY STALKER HORROR:
                </label>
                <select
                  value={stalkerEntity}
                  onChange={e => setStalkerEntity(e.target.value)}
                  className="w-full bg-[#0a0d18] border border-red-900/80 rounded px-2 py-1 text-red-300 text-[10px] font-bold"
                >
                  {ENTITIES.map(ent => (
                    <option key={ent.name} value={ent.name}>
                      {ent.name} ({ent.threatLevel})
                    </option>
                  ))}
                </select>
              </div>

              {/* Starting Sanity */}
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-emerald-400 font-bold">STARTING SANITY:</span>
                  <span className="text-emerald-300 font-bold">{startingSanity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={startingSanity}
                  onChange={e => setStartingSanity(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              {/* Starting Revives */}
              <div>
                <label className="text-[10px] text-purple-400 font-bold block mb-1">
                  EMERGENCY REVIVES:
                </label>
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3].map(count => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => {
                        triggerHaptic(8);
                        audio.playClick();
                        setStartingRevives(count);
                      }}
                      className={`flex-1 py-1 rounded text-[10px] font-black border cursor-pointer ${
                        startingRevives === count
                          ? 'bg-purple-900 text-white border-purple-400'
                          : 'bg-[#15192c] text-[#8694b8] border-[#293352]'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#101424] border-t border-[#232a42]">
          <div className="text-[10px] text-[#7180a5]">
            CONFIG: <b className="text-cyan-300">{stages} Stages</b> • <b className="text-red-400">{stalkerEntity}</b>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                triggerHaptic(8);
                audio.playClick();
                onClose();
              }}
              className="px-3 py-1.5 bg-[#171c32] hover:bg-[#202744] text-[#8ea0c7] hover:text-white rounded border border-[#2d385e] font-bold text-xs cursor-pointer"
            >
              CANCEL
            </button>
            <button
              onClick={handleLaunchDescent}
              className="px-5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black rounded border border-cyan-400 shadow-lg shadow-cyan-950 text-xs uppercase tracking-wider cursor-pointer"
            >
              🚀 INITIATE CUSTOM DESCENT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
