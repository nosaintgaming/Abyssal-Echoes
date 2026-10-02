import { VoidEventData } from '../types';

const ANOMALY_TITLES = [
  'SUB-OCEANIC ZERO HORIZON',
  'RECURSIVE COGNITIVE ECLIPSE',
  'HADAL MEMORY DESYNCHRONIZATION',
  'MATERIAL CONTINUUM SEVERANCE',
  'SINGULARITY TRANSDUCTION FAULT'
];

const CODE_PREFIXES = ['VOID', 'ABYSS', 'OVERRIDE', 'RECURSION', 'SINGULARITY', 'ENTROPY', 'ECLIPSE'];

export function generateVoidEvent(chamber: number, mapId: number): VoidEventData {
  const depth = ((chamber * 65.4) + (mapId * 120)).toFixed(1);
  const prefix = CODE_PREFIXES[Math.floor(Math.random() * CODE_PREFIXES.length)];
  const numCode = Math.floor(1000 + Math.random() * 9000);
  const escapeCode = `${prefix}-${numCode}`;
  const title = ANOMALY_TITLES[Math.floor(Math.random() * ANOMALY_TITLES.length)];

  const diagnosticDump = [
    `0x0000VOID: PHY_MEM_FAULT AT DEPTH ${depth}m // CHAMBER ${chamber}`,
    `0x7FFF00A1: HYDROSTATIC HULL SENSORS DISCONNECTED (READING: 0.000 BAR)`,
    `0xDEADBEEF: UNHANDLED EXISTENTIAL INTERRUPT IN SUB-SURFACE THREAD`,
    `ANOMALY LOG: "THE RIG HAS EXITED THE OCEAN. THE TERMINAL IS LOOKING BACK."`,
    `CHECKSUM DETECTED IN CORRUPTED FRAME BUFFER: [${escapeCode}]`,
    `0x00A892FF: SYSTEM CORE WAITING FOR DIVER RECOVERY INJECTION`
  ];

  return {
    active: true,
    chamber,
    depth,
    escapeCode,
    anomalyTitle: title,
    diagnosticDump,
    attempts: 0,
    clueHint: `Input the exact checksum sequence: ${escapeCode}`
  };
}
