import { InventoryItem, CraftingRecipe } from '../types';

export const INVENTORY_ITEMS: Record<string, InventoryItem> = {
  stim: {
    id: 'stim',
    name: 'Adrenaline Stim',
    desc: 'Stabilizes neural pathways under pressure. Restores +20 Sanity.',
    rarity: 'common',
    usable: true,
    sanityHeal: 20
  },
  medkit: {
    id: 'medkit',
    name: 'Trauma Medkit',
    desc: 'Deep-dive emergency dressing and anti-shock narcotics. Restores +35 Sanity.',
    rarity: 'common',
    usable: true,
    sanityHeal: 35
  },
  trauma_kit: {
    id: 'trauma_kit',
    name: 'Surgical Trauma Kit',
    desc: 'Synthesized sterile surgical suite in a canister. Restores +60 Sanity and purges -10 Corruption.',
    rarity: 'crafted',
    usable: true,
    sanityHeal: 60,
    corruptionReduce: 10
  },
  flare: {
    id: 'flare',
    name: 'Magnesium Flare',
    desc: 'Blinds predators and illuminates hidden corridors. Raises temporary acoustic detection by +10.',
    rarity: 'rare',
    usable: true
  },
  flashlight: {
    id: 'flashlight',
    name: 'Tactical Flashlight',
    desc: 'High-lumen pressure-resistant LED beam. Illuminates dark flooded passages.',
    rarity: 'common'
  },
  crowbar: {
    id: 'crowbar',
    name: 'Titanium Crowbar',
    desc: 'Forces jammed hydraulic bulkheads and lockers. Loud impacts trigger acoustic sensors.',
    rarity: 'common'
  },
  wire: {
    id: 'wire',
    name: 'Insulated Copper Wire',
    desc: 'Essential for splicing control circuits and synthesizing electronic bypasses.',
    rarity: 'common'
  },
  lens: {
    id: 'lens',
    name: 'Optical Quartz Lens',
    desc: 'Optical component for focal alignment and UV cryptographic scanning.',
    rarity: 'common'
  },
  earplugs: {
    id: 'earplugs',
    name: 'Acoustic Dampers',
    desc: 'Muffles bone-conduction shrieks. Halves Sanity damage from The Listener.',
    rarity: 'rare'
  },
  keycard: {
    id: 'keycard',
    name: 'Section 12 Keycard',
    desc: 'Authorizes emergency bypass through high-pressure containment bulkheads.',
    rarity: 'rare'
  },
  uv_scanner: {
    id: 'uv_scanner',
    name: 'UV Cryptographic Scanner',
    desc: 'Reveals hidden phosphorescent glyphs, bypass PINs, and organic mimic trails.',
    rarity: 'crafted'
  },
  grapple_rig: {
    id: 'grapple_rig',
    name: 'Tactical Grapple Rig',
    desc: 'Pneumatic anchor for ascending flooded elevator shafts and bypassing collapsed grates.',
    rarity: 'crafted'
  },
  omega_shard: {
    id: 'omega_shard',
    name: 'Ω-Shard Component',
    desc: 'Fractured quantum core. Emits impossible low-frequency harmonics.',
    rarity: 'secret'
  },
  echo_key: {
    id: 'echo_key',
    name: 'Echo Key',
    desc: 'Unlocks doors that remember your previous runs.',
    rarity: 'secret'
  },
  null_coin: {
    id: 'null_coin',
    name: 'Null Coin',
    desc: 'Spins perpetually between two mutually exclusive outcomes.',
    rarity: 'secret'
  },
  last_signal: {
    id: 'last_signal',
    name: 'Last Signal Transponder',
    desc: 'Broadcasting the final voice recorded before the station fell silent.',
    rarity: 'secret'
  },
  trader_gamble_syringe: {
    id: 'trader_gamble_syringe',
    name: "The Gambler's Void Serum",
    desc: 'Volatile black bile brewed by The Trader. Usable. Success: +50 Sanity & -20 Corruption. Backfire: Causes agonizing neural seizure (-30 Sanity, +20 Corruption, Threat Spikes).',
    rarity: 'secret',
    usable: true,
    isTraderItem: true,
    sanityHeal: 50,
    corruptionReduce: 20,
    backfireDamage: { sanity: 30, corruption: 20, threat: 30 }
  },
  trader_chronometer: {
    id: 'trader_chronometer',
    name: 'Ticking Causality Dial',
    desc: 'Brass gears spinning backwards. Usable. Success: Purges -35 Corruption and resets Stalker proximity. Backfire: Causality shatters violently (-25 Sanity, +35 Threat).',
    rarity: 'secret',
    usable: true,
    isTraderItem: true,
    sanityHeal: 10,
    corruptionReduce: 35,
    backfireDamage: { sanity: 25, corruption: 10, threat: 35 }
  },
  trader_singularity_core: {
    id: 'trader_singularity_core',
    name: 'Fractured Singularity Prism',
    desc: 'Prism reflecting the user through the glass. Usable. Success: Restores +60 Sanity, -15 Corruption, +500 Score. Backfire: Void feedback ruptures your visor (-35 Sanity, +25 Corruption).',
    rarity: 'secret',
    usable: true,
    isTraderItem: true,
    sanityHeal: 60,
    corruptionReduce: 15,
    backfireDamage: { sanity: 35, corruption: 25, threat: 25 }
  },
  trader_phantom_rebreather: {
    id: 'trader_phantom_rebreather',
    name: 'Phantom Hydro-Rebreather',
    desc: 'Extracts oxygen from phantom code loops. Usable. Success: Restores +55 Sanity and suppresses threat. Backfire: Inhales corrosive void seawater (-25 Sanity, +20 Corruption).',
    rarity: 'secret',
    usable: true,
    isTraderItem: true,
    sanityHeal: 55,
    corruptionReduce: 10,
    backfireDamage: { sanity: 25, corruption: 20, threat: 30 }
  },
  trader_null_dice: {
    id: 'trader_null_dice',
    name: 'Bone Dice of Pure Causality',
    desc: 'Carved from human teeth. Usable. Success: Instantly sets Sanity to 100% and awards +600 Score. Backfire: Spawns an immediate stalker breach and plunges Sanity to 15%.',
    rarity: 'secret',
    usable: true,
    isTraderItem: true,
    sanityHeal: 100,
    corruptionReduce: 30,
    backfireDamage: { sanity: 60, corruption: 30, threat: 50 }
  },
  scavenger_lure: {
    id: 'scavenger_lure',
    name: 'Photic Lure Mine',
    desc: 'High-intensity pulsing phosphor decoy. Usable. Stuns The Scavenger and suppresses acoustic threat by -30.',
    rarity: 'rare',
    usable: true,
    sanityHeal: 10,
    corruptionReduce: 5
  },
  scavenger_hook: {
    id: 'scavenger_hook',
    name: "Scavenger's Barbed Hook",
    desc: "Barbed titanium salvage grapple filched from The Scavenger's cache. Usable. Reclaims stolen gear and hooks supply crates (+30 Sanity).",
    rarity: 'rare',
    usable: true,
    sanityHeal: 30,
    corruptionReduce: 10
  },
  architects_compass: {
    id: 'architects_compass',
    name: "Architect's Non-Euclidean Compass",
    desc: 'Intricate gyroscopic brass and dark coral needle pointing in four spatial dimensions. Usable. Restores +45 Sanity and purges -20 Corruption.',
    rarity: 'secret',
    usable: true,
    sanityHeal: 45,
    corruptionReduce: 20
  },
  abyssal_black_pearl: {
    id: 'abyssal_black_pearl',
    name: 'Hadal Singularity Pearl',
    desc: 'Calcified dark matter harvested from the sea floor trenches. Usable. Restores +80 Sanity, purges -35 Corruption, and drops Threat to 0.',
    rarity: 'secret',
    usable: true,
    sanityHeal: 80,
    corruptionReduce: 35
  },
  bioluminescent_ink: {
    id: 'bioluminescent_ink',
    name: 'Bioluminescent Ink Flask',
    desc: 'Pressurized phial of hadal cephalopod ink. Usable. Blinds surrounding entities, lowering acoustic threat by -40 and granting +20 Sanity.',
    rarity: 'rare',
    usable: true,
    sanityHeal: 20,
    corruptionReduce: 10
  },
  overclocked_defibrillator: {
    id: 'overclocked_defibrillator',
    name: 'Overclocked Defibrillator',
    desc: 'High-voltage neural restart pack. Usable. Restores +75 Sanity and purges -15 Corruption.',
    rarity: 'crafted',
    usable: true,
    sanityHeal: 75,
    corruptionReduce: 15
  },
  pneumatic_harpoon: {
    id: 'pneumatic_harpoon',
    name: 'Pneumatic Harpoon Rig',
    desc: 'Pressurized tungsten spike projector. Usable. Drives off stalking apex predators and forces The Scavenger to drop stolen loot.',
    rarity: 'crafted',
    usable: true,
    sanityHeal: 15,
    corruptionReduce: 5
  },
  neural_siphon: {
    id: 'neural_siphon',
    name: 'Bio-Neural Siphon',
    desc: 'Bio-electronic neural filter designed by Technician Sato. Usable. Purges -25 Corruption at the cost of -8 Sanity.',
    rarity: 'crafted',
    usable: true,
    sanityHeal: -8,
    corruptionReduce: 25
  },
  sonar_beacon: {
    id: 'sonar_beacon',
    name: 'Acoustic Decoy Beacon',
    desc: 'Emits deceptive false diver acoustic pings. Usable. Distracts predators, resets Stalker proximity by +15m, and lowers threat by -25.',
    rarity: 'crafted',
    usable: true,
    sanityHeal: 10
  },
  magnesium_lance: {
    id: 'magnesium_lance',
    name: 'Hydro-Thermal Plasma Torch',
    desc: 'Superheated underwater thermal cutter. Slices jammed titanium doors and burns away bone webs silently without triggering acoustic sensors.',
    rarity: 'crafted'
  },
  stasis_capsule: {
    id: 'stasis_capsule',
    name: 'Cryo-Stasis Ampoule',
    desc: 'Suspends neural degradation in sub-zero liquid nitrogen. Usable. Restores +45 Sanity and drops acoustic noise signature by -30.',
    rarity: 'rare',
    usable: true,
    sanityHeal: 45
  },
  chitin_sheath: {
    id: 'chitin_sheath',
    name: 'Calcified Carapace Plating',
    desc: 'Heavy protective plating forged from deep abyss chitin. Halves incoming damage from apex predator ambushes.',
    rarity: 'rare'
  },
  void_resonator: {
    id: 'void_resonator',
    name: 'Void Harmonic Tuning Fork',
    desc: 'Vibrates at a counter-harmonic 16Hz frequency. Usable. Dispels active hallucinations, purges -15 Corruption, and restores +30 Sanity.',
    rarity: 'secret',
    usable: true,
    sanityHeal: 30,
    corruptionReduce: 15
  },
  deep_diver_rebreather: {
    id: 'deep_diver_rebreather',
    name: 'O2-Recycler Rebreather',
    desc: 'Closed-circuit breathing system. Usable. Restores +40 Sanity, clears suffocation panic, and reduces nitrogen narcosis.',
    rarity: 'crafted',
    usable: true,
    sanityHeal: 40
  },
  void_chronometer: {
    id: 'void_chronometer',
    name: 'Void Chronometer',
    desc: 'Suspends hadal causality. Usable. Freezes countdown timers, restores +35 Sanity, and pushes stalker back +20m.',
    rarity: 'secret',
    usable: true,
    sanityHeal: 35,
    corruptionReduce: 20
  },
  hadal_titanium_drill: {
    id: 'hadal_titanium_drill',
    name: 'Hadal Titanium Hydro-Drill',
    desc: 'High-speed diamond-tipped pneumatic drill. Usable. Slices jammed titanium bulkheads and unlocks secret lockers (+25 Sanity).',
    rarity: 'crafted',
    usable: true,
    sanityHeal: 25
  },
  neuro_sedative_mist: {
    id: 'neuro_sedative_mist',
    name: 'Neuro-Sedative Mist Canister',
    desc: 'Aerosolized calmant brine synthesized by Dr. Valeria. Usable. Instantly restores +55 Sanity and purges -25 Corruption.',
    rarity: 'crafted',
    usable: true,
    sanityHeal: 55,
    corruptionReduce: 25
  },
  phantom_signal_emitter: {
    id: 'phantom_signal_emitter',
    name: 'Phantom Transponder Beacon',
    desc: 'Spoofs active distress beacons. Usable. Lowers acoustic threat by -35 and pushes stalkers back +15m.',
    rarity: 'crafted',
    usable: true,
    sanityHeal: 15
  },
  chitin_scalpel: {
    id: 'chitin_scalpel',
    name: 'Hadal Chitin Scalpel',
    desc: 'Monofilament blade forged from apex abyss carapaces. Usable. Extracts organic relics from fallen specimens (+30 Sanity).',
    rarity: 'rare',
    usable: true,
    sanityHeal: 30,
    corruptionReduce: 10
  },
  abyssal_respirator_mk2: {
    id: 'abyssal_respirator_mk2',
    name: 'Abyssal Respirator MK-II',
    desc: 'Military-grade closed loop rebreather. Usable. Restores +50 Sanity and purges all suffocation panic.',
    rarity: 'crafted',
    usable: true,
    sanityHeal: 50,
    corruptionReduce: 15
  },
  pressure_equalizer_valve: {
    id: 'pressure_equalizer_valve',
    name: 'Hydrostatic Equalizer Valve',
    desc: 'Balances hydraulic manifolds automatically. Usable. Stabilizes pressure-sensitive chambers and grants +35 Sanity.',
    rarity: 'crafted',
    usable: true,
    sanityHeal: 35,
    corruptionReduce: 20
  },
  obsidian_focus_crystal: {
    id: 'obsidian_focus_crystal',
    name: 'Obsidian Focus Crystal',
    desc: 'Polished hadal volcanic prism. Usable. Restores +65 Sanity, purges -25 Corruption, and grants +350 Score.',
    rarity: 'secret',
    usable: true,
    sanityHeal: 65,
    corruptionReduce: 25
  },
  cryo_stasis_grenade: {
    id: 'cryo_stasis_grenade',
    name: 'Cryo-Brine Stasis Canister',
    desc: 'Supercooled chemical charge. Usable. Flash-freezes hydraulic airlocks, pushes stalker back +25m, and restores +40 Sanity.',
    rarity: 'crafted',
    usable: true,
    sanityHeal: 40,
    corruptionReduce: 15
  },
  bone_needle_salvage: {
    id: 'bone_needle_salvage',
    name: 'Calcified Bone Needle',
    desc: 'Harvested from bone webs. Usable. Slices through sticky organic filaments and silences acoustic valves (+20 Sanity).',
    rarity: 'rare',
    usable: true,
    sanityHeal: 20
  },
  siren_prism_decoy: {
    id: 'siren_prism_decoy',
    name: 'Siphonophore Prism Decoy',
    desc: 'Projects an ethereal holographic diver decoy. Usable. Draws predator focus away, reducing threat by -40 and granting +35 Sanity.',
    rarity: 'crafted',
    usable: true,
    sanityHeal: 35,
    corruptionReduce: 10
  },
  chronometric_reversal_dial: {
    id: 'chronometric_reversal_dial',
    name: 'Chrono-Reversal Cog',
    desc: 'Gears spinning in 4 dimensions. Usable. Undoes local entropy, restoring +50 Sanity and purging -30 Corruption.',
    rarity: 'secret',
    usable: true,
    sanityHeal: 50,
    corruptionReduce: 30
  },
  pale_architect_ruler: {
    id: 'pale_architect_ruler',
    name: 'Non-Euclidean Ivory Caliper',
    desc: "Drafting instrument of Entity 00. Usable. Reveals true corridors in shifting mazes, restoring +60 Sanity and purging -25 Corruption.",
    rarity: 'secret',
    usable: true,
    sanityHeal: 60,
    corruptionReduce: 25
  },
  hydro_thermite_charge: {
    id: 'hydro_thermite_charge',
    name: 'Hydro-Thermite Breaching Charge',
    desc: 'Silent underwater chemical thermite. Melts heavy titanium bulkheads with 0 acoustic noise (+25 Sanity).',
    rarity: 'crafted',
    usable: true,
    sanityHeal: 25
  },
  neural_respirator_filter: {
    id: 'neural_respirator_filter',
    name: 'Bio-Neural Filter Cartridge',
    desc: 'Filters out psychotropic abyssal spores. Usable. Restores +45 Sanity, purges -20 Corruption, and dispels dementia hallucinations.',
    rarity: 'crafted',
    usable: true,
    sanityHeal: 45,
    corruptionReduce: 20
  },
  deep_trench_hydrophone: {
    id: 'deep_trench_hydrophone',
    name: 'Ultra-High Fidelity Hydrophone',
    desc: 'Detects micro-vibrations across tectonic trenches. Usable. Warns of upcoming entity ambushes and grants +30 Sanity.',
    rarity: 'crafted',
    usable: true,
    sanityHeal: 30
  },
  abyssal_mirror_shard: {
    id: 'abyssal_mirror_shard',
    name: 'Quantum Mirror Shard',
    desc: 'Reflects the gaze of the Void. Usable. Restores +70 Sanity, purges -40 Corruption, and grants +400 Score.',
    rarity: 'secret',
    usable: true,
    sanityHeal: 70,
    corruptionReduce: 40
  },
  leviathan_heart_amber: {
    id: 'leviathan_heart_amber',
    name: 'Fossilized Leviathan Amber',
    desc: 'Pulsing core of a primordial abyssal titan. Usable. Fully restores Sanity to 100% and purges 50% Corruption.',
    rarity: 'secret',
    usable: true,
    sanityHeal: 100,
    corruptionReduce: 50
  }
};

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    itemA: 'flashlight',
    itemB: 'lens',
    resultId: 'uv_scanner',
    name: 'UV Cryptographic Scanner',
    desc: 'Reveals concealed codes and hidden passageways'
  },
  {
    itemA: 'crowbar',
    itemB: 'wire',
    resultId: 'grapple_rig',
    name: 'Tactical Grapple Rig',
    desc: 'Allows vertical traversal bypass through flooded shafts'
  },
  {
    itemA: 'stim',
    itemB: 'medkit',
    resultId: 'trauma_kit',
    name: 'Surgical Trauma Kit',
    desc: 'Restores +60 Sanity and purges 10% Corruption'
  },
  {
    itemA: 'stim',
    itemB: 'wire',
    resultId: 'overclocked_defibrillator',
    name: 'Overclocked Defibrillator',
    desc: 'Restores +75 Sanity and purges -15 Corruption'
  },
  {
    itemA: 'crowbar',
    itemB: 'lens',
    resultId: 'pneumatic_harpoon',
    name: 'Pneumatic Harpoon Rig',
    desc: 'Repels predators and forces scavengers to drop filched loot'
  },
  {
    itemA: 'wire',
    itemB: 'flare',
    resultId: 'scavenger_lure',
    name: 'Photic Lure Mine',
    desc: 'Stuns scavengers and suppresses acoustic threat by -30'
  },
  {
    itemA: 'wire',
    itemB: 'lens',
    resultId: 'neural_siphon',
    name: 'Bio-Neural Siphon',
    desc: 'Purges -25 Corruption at the cost of 8 Sanity'
  },
  {
    itemA: 'flare',
    itemB: 'wire',
    resultId: 'sonar_beacon',
    name: 'Acoustic Decoy Beacon',
    desc: 'Pushes stalker back +15m and suppresses threat'
  },
  {
    itemA: 'crowbar',
    itemB: 'flare',
    resultId: 'magnesium_lance',
    name: 'Hydro-Thermal Plasma Torch',
    desc: 'Cuts heavy hatches and webs without loud acoustic pings'
  },
  {
    itemA: 'medkit',
    itemB: 'wire',
    resultId: 'deep_diver_rebreather',
    name: 'O2-Recycler Rebreather',
    desc: 'Restores +40 Sanity and purges breathing distress'
  },
  {
    itemA: 'flashlight',
    itemB: 'wire',
    resultId: 'phantom_signal_emitter',
    name: 'Phantom Transponder Beacon',
    desc: 'Spoofs active distress beacons, lowering threat by -35 and pushing stalkers +15m'
  },
  {
    itemA: 'crowbar',
    itemB: 'chitin_sheath',
    resultId: 'chitin_scalpel',
    name: 'Hadal Chitin Scalpel',
    desc: 'Surgical salvage tool that extracts organic relics (+30 Sanity)'
  },
  {
    itemA: 'medkit',
    itemB: 'bioluminescent_ink',
    resultId: 'neuro_sedative_mist',
    name: 'Neuro-Sedative Mist Canister',
    desc: 'Instantly restores +55 Sanity and purges -25 Corruption'
  },
  {
    itemA: 'crowbar',
    itemB: 'magnesium_lance',
    resultId: 'hadal_titanium_drill',
    name: 'Hadal Titanium Hydro-Drill',
    desc: 'Diamond-tipped hydro-drill that slices jammed bulkheads and unlocks secret lockers'
  },
  {
    itemA: 'deep_diver_rebreather',
    itemB: 'chitin_sheath',
    resultId: 'abyssal_respirator_mk2',
    name: 'Abyssal Respirator MK-II',
    desc: 'Military-grade closed loop rebreather; restores +50 Sanity and purges suffocation panic'
  },
  {
    itemA: 'wire',
    itemB: 'keycard',
    resultId: 'pressure_equalizer_valve',
    name: 'Hydrostatic Equalizer Valve',
    desc: 'Stabilizes hydraulic manifolds and pressure chambers automatically (+35 Sanity)'
  },
  {
    itemA: 'stasis_capsule',
    itemB: 'flare',
    resultId: 'cryo_stasis_grenade',
    name: 'Cryo-Brine Stasis Canister',
    desc: 'Flash-freezes hydraulic airlocks, pushes stalker back +25m, and restores +40 Sanity'
  },
  {
    itemA: 'lens',
    itemB: 'bioluminescent_ink',
    resultId: 'siren_prism_decoy',
    name: 'Siphonophore Prism Decoy',
    desc: 'Emits holographic decoy, suppresses threat by -40, and grants +35 Sanity'
  },
  {
    itemA: 'magnesium_lance',
    itemB: 'wire',
    resultId: 'hydro_thermite_charge',
    name: 'Hydro-Thermite Breaching Charge',
    desc: 'Silent chemical cutter that melts bulkheads with 0 acoustic noise (+25 Sanity)'
  },
  {
    itemA: 'deep_diver_rebreather',
    itemB: 'neural_siphon',
    resultId: 'neural_respirator_filter',
    name: 'Bio-Neural Filter Cartridge',
    desc: 'Dispels dementia text hallucinations, grants +45 Sanity, and purges -20 Corruption'
  },
  {
    itemA: 'earplugs',
    itemB: 'wire',
    resultId: 'deep_trench_hydrophone',
    name: 'Ultra-High Fidelity Hydrophone',
    desc: 'Detects micro-vibrations across trenches, warns of traps, and grants +30 Sanity'
  },
  {
    itemA: 'architects_compass',
    itemB: 'obsidian_focus_crystal',
    resultId: 'pale_architect_ruler',
    name: 'Non-Euclidean Ivory Caliper',
    desc: 'Drafting instrument of Entity 00; neutralizes Cartographer mazes and restores +60 Sanity'
  }
];
