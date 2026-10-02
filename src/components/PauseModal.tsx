import React from 'react';
import { GameState } from '../types';
import { audio } from '../audio/soundEngine';

interface PauseModalProps {
  state: GameState;
  onResume: () => void;
  onAbort: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  state,
  onResume,
  onAbort
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-mono">
      <div className="bg-[#0c0f1e] border-2 border-red-700/80 p-6 rounded-lg max-w-md w-full shadow-2xl text-center space-y-4">
        <div className="text-3xl animate-pulse">⏸</div>
        <h2 className="text-xl text-red-500 font-bold uppercase tracking-widest">
          DESCENT SUSPENDED
        </h2>

        <p className="text-xs text-[#a3aed2] leading-relaxed">
          The terminal state is safely preserved. Atmospheric pumps and life support remain active.
        </p>

        <div className="bg-[#12162a] border border-[#273254] p-3 rounded text-xs text-left space-y-1">
          <div className="flex justify-between">
            <span className="text-[#8895bd]">CURRENT SECTOR:</span>
            <span className="text-amber-400 font-bold">{state.mapName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8895bd]">CHAMBER PROGRESS:</span>
            <span className="text-cyan-400 font-bold">{state.chamber} / {state.maxChambers}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8895bd]">SANITY / CORRUPTION:</span>
            <span>
              <b className="text-emerald-400">{state.sanity}%</b> / <b className="text-red-400">{state.corruption}%</b>
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8895bd]">DIFFICULTY RATING:</span>
            <span className="text-purple-400 font-bold uppercase">{state.difficulty}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={() => {
              audio.playSolve();
              onResume();
            }}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-sm rounded uppercase tracking-wider transition cursor-pointer shadow-lg"
          >
            ▶ RESUME DESCENT
          </button>

          <button
            onClick={() => {
              audio.playClick();
              onAbort();
            }}
            className="w-full py-2 bg-[#1b1e30] hover:bg-red-950 text-[#c2cce8] hover:text-red-300 border border-[#2f395c] hover:border-red-600 rounded text-xs font-bold uppercase transition cursor-pointer"
          >
            ABORT MISSION & RETURN TO DOCK
          </button>
        </div>
      </div>
    </div>
  );
};
