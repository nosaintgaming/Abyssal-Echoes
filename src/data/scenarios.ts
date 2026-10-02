import { Scenario } from '../types';

export const SCENARIOS: Scenario[] = [
  {
    id: 's1',
    title: 'FLOODED DOCKING HATCH',
    desc: 'Corrosive hadal seawater drips through the bulkhead seam. A sealed emergency cargo locker stands nearby with a pulsing crimson keypad.',
    puzzleType: 'keypad',
    options: [
      { text: 'Force open the rusty hatch with the crowbar [LOUD]', isLoud: true, s: -5, c: +5, sc: 100, itemReq: 'crowbar' },
      { text: 'Solve the security keypad bypass [TACTICAL]', leadsToPuzzle: 'keypad', s: 0, c: 0, sc: 190 },
      { text: 'Wade quietly through the flooded drainage trench', isLoud: false, s: -15, c: +10, sc: 60 }
    ]
  },
  {
    id: 's2',
    title: 'CRYOGENIC SPECIMEN VAULT',
    desc: 'Shattered reinforced glass cylinders coat the floor grating. Inside a frosted freezer, a biometric container preserves an uncorrupted adrenaline stim.',
    puzzleType: 'power_grid',
    options: [
      { text: 'Reroute the cryogenic auxiliary power grid [CIRCUIT]', leadsToPuzzle: 'power_grid', s: 0, c: 0, sc: 210 },
      { text: 'Smash the glass case to snatch the stim [LOUD]', isLoud: true, s: -10, c: +15, sc: 80, itemGain: 'stim' },
      { text: 'Search the autopsy terminal for survivor logs', isLoud: false, s: +10, c: +5, sc: 130 }
    ]
  },
  {
    id: 's3',
    title: 'ACOUSTIC LISTENING POST',
    desc: 'Hundreds of hydrophone needles twitch in synchronization. An apex stalker acoustic signature reverberates through the bulkheads.',
    puzzleType: 'hydroacoustic_waveform',
    radioBroadcast: true,
    options: [
      { text: 'Tune hydroacoustic waveform dials to match the frequency [PUZZLE]', leadsToPuzzle: 'hydroacoustic_waveform', s: +18, c: -6, sc: 260 },
      { text: 'Hold your breath and crawl beneath the acoustic sensor grid', isLoud: false, s: -10, c: +5, sc: 90 },
      { text: 'Broadcast an emergency distress pulse over the hydrophone [LOUD]', isLoud: true, s: -25, c: +30, sc: 260 }
    ]
  },
  {
    id: 's4',
    title: 'VAULT OF SECOND NAMES',
    desc: 'A circular rotunda is carved with rotating obsidian glyphs. Dr. Alistair Vane is locked inside a pressure-isolated containment pod.',
    puzzleType: 'cipher',
    survivorEncounter: {
      id: 'vane',
      name: 'Dr. Alistair Vane',
      role: 'Lead Abyssal Biologist'
    },
    options: [
      { text: 'Align the obsidian cipher rings to decrypt pod release [PUZZLE]', leadsToPuzzle: 'cipher', s: +15, c: 0, sc: 280, survivorFound: 'vane' },
      { text: 'Supply an adrenaline stim to treat his decompression delirium', itemReq: 'stim', itemConsume: true, s: +25, c: -10, sc: 340, survivorFound: 'vane' },
      { text: 'Bypass the containment pod and proceed down the shaft', isLoud: false, s: -12, c: +8, sc: 90 }
    ]
  },
  {
    id: 's5',
    title: 'RAPID DECOMPRESSION AIRLOCK',
    desc: 'WARNING: Outer hull pressure is critical! Floodwater rises 1.5 meters per minute. The hydrostatic purge valves must be calibrated.',
    puzzleType: 'airlock',
    timerSeconds: 15,
    options: [
      { text: 'Engage the hydrostatic purge manifold [BALANCED]', leadsToPuzzle: 'airlock', s: 0, c: 0, sc: 300 },
      { text: 'Deploy the tactical grapple rig to climb vertically [SAFE]', itemReq: 'grapple_rig', s: +15, c: 0, sc: 260 },
      { text: 'Brace behind the heavy blast door and endure the surge', isLoud: true, s: -30, c: +20, sc: 70 }
    ]
  },
  {
    id: 's6',
    title: 'THE HYDRAULIC HEART & TURBINE HALL',
    desc: 'A colossal brass piston pumps black fluid through overhead conduits. Pinned beneath fallen copper conduits, Chief Engineer Sean Kowalski gasps for air in the rising surge.',
    survivorEncounter: {
      id: 'kowalski',
      name: 'Chief Engineer Sean Kowalski',
      role: 'Submersible Propulsion Specialist'
    },
    options: [
      { text: 'Use a crowbar to pry the crushing turbine pipe off Kowalski [RESCUE]', itemReq: 'crowbar', s: +22, c: -5, sc: 350, survivorFound: 'kowalski', itemGain: 'keycard' },
      { text: 'Scavenge insulated copper wire from the breaker box [RISKY]', isLoud: false, s: -5, c: +5, sc: 100, itemGain: 'wire' },
      { text: 'Climb the oily gantry toward the upper observation deck', isLoud: false, s: -12, c: +10, sc: 120 }
    ]
  },
  {
    id: 's7',
    title: 'PALE KING’S EMBANKMENT',
    desc: 'Subterranean docks lie silent where black water laps against dead stone. A humanoid silhouette stands motionless near a rusted crane.',
    options: [
      { text: 'Shine your tactical flashlight directly at the figure [LUMEN]', isLoud: true, s: -15, c: +15, sc: 170, itemReq: 'flashlight' },
      { text: 'Slip into the shadow of the cargo containers [STEALTH]', isLoud: false, s: -5, c: +5, sc: 110 },
      { text: 'Offer a medical stim to the silhouette [COMPASSION]', itemReq: 'stim', itemConsume: true, s: +30, c: -10, sc: 360 }
    ]
  },
  {
    id: 's8',
    title: 'NEURAL CONVERGENCE NEXUS',
    desc: 'Fibers hang from the ceiling like weeping willow branches, sparking with indigo luminescence. The boundary between mind and water feels porous.',
    puzzleType: 'power_grid',
    options: [
      { text: 'Synchronize your neural pulse with the terminal grid [CIRCUIT]', leadsToPuzzle: 'power_grid', s: +18, c: -10, sc: 310 },
      { text: 'Sever the glowing fiber conduits with wire cutters [LOUD]', isLoud: true, s: -10, c: +15, sc: 130 },
      { text: 'Collect an active Ω-Shard from the central pedestal [RELIC]', s: -20, c: +30, sc: 500, itemGain: 'omega_shard' }
    ]
  },
  {
    id: 's9',
    title: 'THE SUNKEN CATHEDRAL NAVE',
    desc: 'Bioluminescent jellyfish illuminate arched limestone vaults submerged 2,000 meters beneath the surface. Whispers repeat your true name.',
    options: [
      { text: 'Use acoustic dampers to mute the echoing voices', itemReq: 'earplugs', s: +20, c: -5, sc: 220 },
      { text: 'Recite navigational coordinates to retain sanity', isLoud: false, s: +10, c: 0, sc: 140 },
      { text: 'Light a magnesium flare to shatter the darkness [LOUD]', isLoud: true, itemReq: 'flare', itemConsume: true, s: +15, c: +10, sc: 260 }
    ]
  },
  {
    id: 's10',
    title: 'TRANSMISSION ROUTING HUB',
    desc: 'A wall of antique vacuum tubes glows orange. A logic breaker matrix controls the pressure locks leading to the central hadal core.',
    puzzleType: 'circuit_breaker',
    radioBroadcast: true,
    options: [
      { text: 'Bypass the logic gate matrix on the circuit breaker [LOGIC]', leadsToPuzzle: 'circuit_breaker', s: +15, c: -5, sc: 270 },
      { text: 'Splice the relay circuits with copper wire', itemReq: 'wire', itemConsume: true, s: +15, c: -5, sc: 250, itemGain: 'keycard' },
      { text: 'Smash the vacuum tube array to silence the clicking [LOUD]', isLoud: true, s: -15, c: +20, sc: 80 }
    ]
  },
  {
    id: 's11',
    title: 'CRUSHED BATHYSPHERE WRECKAGE',
    desc: 'A titanium observation sphere lies crumpled against an abyssal ledge at 3,500 meters. Inside the cockpit, Pilot Maya Lindqvist is tapping an SOS code against the quartz porthole.',
    survivorEncounter: {
      id: 'lindqvist',
      name: 'Pilot Maya Lindqvist',
      role: 'Deep-Dive Aviator'
    },
    puzzleType: 'airlock',
    options: [
      { text: 'Equalize bathysphere pressure locks to extract Pilot Lindqvist [RESCUE]', leadsToPuzzle: 'airlock', s: +24, c: -8, sc: 380, survivorFound: 'lindqvist' },
      { text: 'Cut through the emergency hatch using a thermal wire rig', itemReq: 'wire', itemConsume: true, s: +20, c: -5, sc: 310, survivorFound: 'lindqvist' },
      { text: 'Scavenge spare oxygen cylinders and leave the cockpit sealed', isLoud: false, s: -15, c: +12, sc: 110, itemGain: 'stim' }
    ]
  },
  {
    id: 's12',
    title: 'SUBTERRANEAN THERMAL REACTOR CORE',
    desc: 'Superheated volcanic steam hisses through fractured titanium conduits. The reactor cooling loops are overheating toward a catastrophic hydrothermal meltdown.',
    puzzleType: 'reactor_valves',
    options: [
      { text: 'Rebalance cross-coupled coolant valves into the safe zone [PUZZLE]', leadsToPuzzle: 'reactor_valves', s: +20, c: -10, sc: 340 },
      { text: 'Vent superheated steam manually through the exhaust chimney [LOUD]', isLoud: true, s: -20, c: +15, sc: 160 },
      { text: 'Deploy thermal heat sink dampers using optical lenses', itemReq: 'lens', itemConsume: true, s: +15, c: -5, sc: 290 }
    ]
  },
  {
    id: 's13',
    title: 'HYDROTHERMAL VENT STATION',
    desc: 'Black smokers spew mineral-dense volcanic brine at 380°C. Barricaded inside a reinforced mineralogy shelter, Dr. Elena Rostova transmits frantic thermal warnings.',
    survivorEncounter: {
      id: 'elena',
      name: 'Dr. Elena Rostova',
      role: 'Hadal Geochemist'
    },
    options: [
      { text: 'Use an optical lens scanner to calibrate the shelter airlock [RESCUE]', itemReq: 'lens', itemConsume: true, s: +26, c: -12, sc: 400, survivorFound: 'elena' },
      { text: 'Signal Dr. Rostova with a magnesium flare to breach the seals', itemReq: 'flare', itemConsume: true, isLoud: true, s: +18, c: -5, sc: 320, survivorFound: 'elena' },
      { text: 'Retreat from the boiling thermal vents before your pressure suit melts', isLoud: false, s: -10, c: +10, sc: 90 }
    ]
  },
  {
    id: 's14',
    title: 'SUBMERGED MEDICAL TRIAGE BUBBLE',
    desc: 'Half-submerged medical beds sway in the brackish current. Dr. Hesper Chen is desperately holding emergency pressure lines together with torn tourniquets.',
    survivorEncounter: {
      id: 'chen',
      name: 'Dr. Hesper Chen',
      role: 'Hyperbaric Trauma Physician'
    },
    puzzleType: 'decontamination_valves',
    options: [
      { text: 'Balance hyperbaric decontamination manifold pressure [PUZZLE]', leadsToPuzzle: 'decontamination_valves', s: +25, c: -10, sc: 390, survivorFound: 'chen' },
      { text: 'Reinforce the bio-monitor connections with insulated wire', itemReq: 'wire', itemConsume: true, s: +22, c: -8, sc: 340, survivorFound: 'chen', itemGain: 'medkit' },
      { text: 'Raid the emergency medical locker for adrenaline stims and flee', isLoud: false, s: -12, c: +15, sc: 140, itemGain: 'stim' }
    ]
  },
  {
    id: 's15',
    title: 'BREACHED GANTRY & HYDRAULIC CRUSH GATE',
    desc: 'A mangled blast gate is suspended by groaning hydraulic jacks. Master Welder Knox Bennett is bracing the steel frame with a cracked manual wrench.',
    survivorEncounter: {
      id: 'knox',
      name: 'Master Welder Knox Bennett',
      role: 'Hull Structural Fabricator'
    },
    options: [
      { text: 'Wedge the crowbar into the hydraulic gate lock to free Knox [RESCUE]', itemReq: 'crowbar', s: +25, c: -5, sc: 410, survivorFound: 'knox', itemGain: 'grapple_rig' },
      { text: 'Solve the hydraulic keypad override to unlock the gantry gate', leadsToPuzzle: 'keypad', s: +18, c: -5, sc: 310, survivorFound: 'knox' },
      { text: 'Squeeze beneath the crushing gate alone before the cable snaps', isLoud: true, s: -20, c: +15, sc: 110 }
    ]
  },
  {
    id: 's16',
    title: 'THE ACOUSTIC CRYPTOGRAPHY ROTUNDA',
    desc: 'A circular chamber echoes with sub-oceanic clicking that resonates with hypnotic terror. Cryptographer Elias Vance sits surrounded by obsidian transcriptions, murmuring forgotten frequencies.',
    survivorEncounter: {
      id: 'vance',
      name: 'Cryptographer Elias Vance',
      role: 'Abyssal Signal Analyst'
    },
    puzzleType: 'sonar_frequency',
    options: [
      { text: 'Match the abyssal resonance to awaken Vance from his trance [PUZZLE]', leadsToPuzzle: 'sonar_frequency', s: +28, c: -12, sc: 450, survivorFound: 'vance' },
      { text: 'Align the obsidian cryptogram wheel to translate the transmission', leadsToPuzzle: 'cipher', s: +20, c: -8, sc: 350, survivorFound: 'vance' },
      { text: 'Confiscate the ancient echo key from the pedestal and step back', isLoud: false, s: -15, c: +20, sc: 200, itemGain: 'echo_key' }
    ]
  },
  {
    id: 's17',
    title: 'DEEP RELAY CIRCUIT GANTRY',
    desc: 'Exposed electrical buses arc through leaking saline steam. The route to the primary sector bulkhead requires restoring the magnetic relay logic.',
    puzzleType: 'circuit_breaker',
    options: [
      { text: 'Reconfigure the logic gate array on the relay panel [PUZZLE]', leadsToPuzzle: 'circuit_breaker', s: +18, c: -6, sc: 320 },
      { text: 'Use an insulated crowbar to force the master knife switch [LOUD]', itemReq: 'crowbar', isLoud: true, s: -8, c: +10, sc: 210 },
      { text: 'Risk climbing through the live conduit crawlspace [ELECTRICAL]', isLoud: false, s: -18, c: +15, sc: 130 }
    ]
  },
  {
    id: 's18',
    title: 'THE ABYSSAL ARCHIVE MONOLITH',
    desc: 'A black monolith composed of an unknown hadal alloy hums at 16 Hertz. Holographic glyphs drift through the water, awaiting cryptographic decipherment.',
    puzzleType: 'cipher',
    options: [
      { text: 'Decipher the ancient monolith cipher offset [PUZZLE]', leadsToPuzzle: 'cipher', s: +22, c: -8, sc: 420 },
      { text: 'Harmonize your radio transceiver with the monolith frequency', itemReq: 'echo_key', s: +30, c: -15, sc: 500 },
      { text: 'Turn away from the monolith before the geometric runes warp your vision', isLoud: false, s: +5, c: 0, sc: 140 }
    ]
  },
  {
    id: 's19',
    title: 'DECONTAMINATION FLOOD CHAMBER',
    desc: 'Chemical foam bubbles from ceiling nozzles as amber sirens spin overhead. Hydraulic pressure is spiking across four interconnected drainage conduits.',
    puzzleType: 'decontamination_valves',
    options: [
      { text: 'Calibrate the quad-manifold drainage valves [BALANCED]', leadsToPuzzle: 'decontamination_valves', s: +20, c: -8, sc: 350 },
      { text: 'Smash the emergency manual override with the crowbar [LOUD]', itemReq: 'crowbar', isLoud: true, s: -10, c: +10, sc: 180 },
      { text: 'Submerge beneath the chemical brine to slip past the sensors', isLoud: false, s: -18, c: +15, sc: 120 }
    ]
  },
  {
    id: 's20',
    title: 'HADAL HYDROPHONE INTERCEPT STATION',
    desc: 'A colossal parabolic dish is oriented toward the abyss floor. It captures a repeating biosonar transmission with severe phase distortion.',
    puzzleType: 'hydroacoustic_waveform',
    radioBroadcast: true,
    options: [
      { text: 'Align the oscilloscope frequency, amplitude, and phase [DECODE]', leadsToPuzzle: 'hydroacoustic_waveform', s: +25, c: -10, sc: 400 },
      { text: 'Filter the audio distortion through acoustic dampers', itemReq: 'earplugs', s: +15, c: -5, sc: 220 },
      { text: 'Sever the hydrophone cabling to stop the dreadful screeching', isLoud: true, s: -12, c: +10, sc: 130 }
    ]
  },
  {
    id: 's21',
    title: "THE SCAVENGER'S AERATION NEST",
    desc: "Dismembered utility harnesses, empty adrenaline stim casings, and flashing beacons hang like grim trophies from rusted ventilation ducts. A hunched silhouette with eight barbed magnetic limbs clicks its mandibles in the gloom, rummaging through a pile of stolen gear.",
    puzzleType: 'spectrogram_frequency',
    options: [
      { text: 'Deploy a Photic Lure Mine to stun the creature and reclaim all loot [TRAP]', itemReq: 'scavenger_lure', itemConsume: true, s: +30, c: -10, sc: 550, itemGain: 'scavenger_hook' },
      { text: 'Fire a Pneumatic Harpoon Rig to pin the thief and force it to drop items [COMBAT]', itemReq: 'pneumatic_harpoon', isLoud: true, s: +20, c: -5, sc: 480, itemGain: 'stim' },
      { text: 'Calibrate your acoustic scanner to decipher its nest frequencies [PUZZLE]', leadsToPuzzle: 'spectrogram_frequency', s: +25, c: -8, sc: 420 },
      { text: 'Slip past the nest quietly before the thief snatches your remaining gear', isLoud: false, s: -10, c: +8, sc: 100 }
    ]
  },
  {
    id: 's22',
    title: 'CHAMBER 0 // THE PALE BLUEPRINT',
    desc: 'The rusted steel bulkheads dissolve into seamless alabaster pillars and floating non-Euclidean polyhedra. Entity 00: THE PALE ARCHITECT materializes within a halo of cyan blueprint vectors, its blinding cobalt eye slit scanning the arithmetic structure of your consciousness.',
    puzzleType: 'containment_laser_grid',
    options: [
      { text: 'Align the refractive containment prisms to stabilize the blueprint [PUZZLE]', leadsToPuzzle: 'containment_laser_grid', s: +40, c: -20, sc: 650, itemGain: 'architects_compass' },
      { text: 'Harmonize your mind with the Architect\'s primordial geometry [RESONANCE]', itemReq: 'architects_compass', s: +50, c: -30, sc: 700 },
      { text: 'Acknowledge the cosmic drafting error and back away into the airlock', isLoud: false, s: -15, c: +10, sc: 200 }
    ]
  },
  {
    id: 's23',
    title: 'HYDROSTATIC CAVITATION PISTON ARTERY',
    desc: 'Seismic hydraulic pistons thunder behind reinforced quartz observation ports. Deep-sea pressure cavitation is building to critical rupture across three primary ballast cylinders.',
    puzzleType: 'pressure_depth_regulator',
    options: [
      { text: 'Engage the 3-stage hydrostatic piston balancing sequence [ENGINEERING]', leadsToPuzzle: 'pressure_depth_regulator', s: +28, c: -10, sc: 420, itemGain: 'wire' },
      { text: 'Vent high-pressure steam conduits manually with a titanium crowbar [LOUD]', itemReq: 'crowbar', isLoud: true, s: -12, c: +15, sc: 240 },
      { text: 'Dodge the leaking superheated hydraulic spray and sprint down the catwalk', isLoud: false, s: -20, c: +12, sc: 140 }
    ]
  },
  {
    id: 's24',
    title: 'ULTRAVIOLET CONTAINMENT MATRIX',
    desc: 'A fractured quantum anomaly is leaking volatile black plasma into the flooded reactor gallery. To prevent an irreversible sector meltdown, the ultraviolet containment beam must be directed through the deflection prisms to the sensor receptor.',
    puzzleType: 'containment_laser_grid',
    options: [
      { text: 'Rotate the deflection mirrors to lock the containment beam [OPTIC PUZZLE]', leadsToPuzzle: 'containment_laser_grid', s: +35, c: -15, sc: 500 },
      { text: 'Use an Optical Quartz Lens to manually focus the scattered beam [TACTICAL]', itemReq: 'lens', s: +25, c: -5, sc: 360 },
      { text: 'Trigger the emergency blast bulkhead and seal the gallery forever', isLoud: true, s: -22, c: +20, sc: 160 }
    ]
  },
  {
    id: 's25',
    title: 'THE SUB-SALINE EXORCISM CRYPT',
    desc: 'A submerged vaulted chapel glows with eerie violet Cherenkov light. Dr. Aurelius Renard is trapped within an unhallowed salt circle as psychic hallucinations bleed through the bulkheads.',
    survivorEncounter: {
      id: 'dr_renard',
      name: 'Dr. Aurelius Renard',
      role: 'Hadal Parapsychologist & Anomaly Exorcist'
    },
    puzzleType: 'optic_prism_align',
    options: [
      { text: 'Align the 3 quartz refraction prisms to break the hex barrier [PUZZLE]', leadsToPuzzle: 'optic_prism_align', s: +32, c: -18, sc: 520, survivorFound: 'dr_renard', itemGain: 'obsidian_focus_crystal' },
      { text: 'Deploy the UV Cryptographic Scanner to dispel the demonic glyphs', itemReq: 'uv_scanner', s: +30, c: -15, sc: 460, survivorFound: 'dr_renard' },
      { text: 'Recite defensive theological psalms and retreat from the altar', isLoud: false, s: -10, c: +8, sc: 140 }
    ]
  },
  {
    id: 's26',
    title: 'THE GHOST TRENCH ACOUSTIC DOCKS',
    desc: 'An eerie underwater slipway where the U-884 Phantom Submersible lurks in the black brine. Trapped inside a flooded decompression airlock, Chief Aviator Cadence Thorne taps out sonar navigation codes.',
    survivorEncounter: {
      id: 'cadence',
      name: 'Chief Aviator Cadence Thorne',
      role: 'Trench Deep-Submersible Pilot'
    },
    puzzleType: 'sonar_echo_triangulate',
    options: [
      { text: 'Triangulate the approaching phantom submarine bearing and delay [PUZZLE]', leadsToPuzzle: 'sonar_echo_triangulate', s: +35, c: -12, sc: 540, survivorFound: 'cadence', itemGain: 'phantom_signal_emitter' },
      { text: 'Fire a Sonar Decoy Beacon to divert the ghost torpedoes away', itemReq: 'sonar_beacon', s: +28, c: -6, sc: 400, survivorFound: 'cadence' },
      { text: 'Slam the emergency flood gates shut before the torpedo impacts [LOUD]', isLoud: true, s: -18, c: +15, sc: 160 }
    ]
  },
  {
    id: 's27',
    title: 'THE CHEMICAL DECONTAMINATION CANAL',
    desc: 'Corrosive hadal brine threatens to burn through diving suit visors. Barricaded inside a chemical laboratory, Dr. Valeria Sterling is desperately mixing biochemical stabilizing agents to treat nitrogen narcosis.',
    survivorEncounter: {
      id: 'valeria',
      name: 'Dr. Valeria Sterling',
      role: 'Hadal Bio-Chemist & Neurotoxin Synthesizer'
    },
    puzzleType: 'biochemical_antidote_titration',
    options: [
      { text: 'Titrate the physiological antidote to 7.35 pH equilibrium [PUZZLE]', leadsToPuzzle: 'biochemical_antidote_titration', s: +36, c: -20, sc: 560, survivorFound: 'valeria', itemGain: 'neuro_sedative_mist' },
      { text: 'Administer an Adrenaline Stim to counter acute shock narcosis', itemReq: 'stim', itemConsume: true, s: +28, c: -10, sc: 380, survivorFound: 'valeria' },
      { text: 'Bypass the boiling chemical canal through the ventilation ducts', isLoud: false, s: -15, c: +12, sc: 130 }
    ]
  },
  {
    id: 's28',
    title: 'HEAVY HYDRAULIC GANTRY ZERO',
    desc: 'Massive hydraulic cranes creak under 1,100 atmospheres of crushing weight. Master Fabricator Boris Orlov is welding broken emergency power conductors while sparks shower into the black floodwater.',
    survivorEncounter: {
      id: 'orlov',
      name: 'Master Fabricator Boris Orlov',
      role: 'Heavy Nanite Rigging Specialist'
    },
    puzzleType: 'subsea_cable_patch',
    options: [
      { text: 'Patch the 4 multi-conductor telemetry bus cables into place [PUZZLE]', leadsToPuzzle: 'subsea_cable_patch', s: +34, c: -10, sc: 510, survivorFound: 'orlov', itemGain: 'hadal_titanium_drill' },
      { text: 'Use an Insulated Copper Wire to splice the main hydraulic knife switch', itemReq: 'wire', itemConsume: true, s: +24, c: -5, sc: 360, survivorFound: 'orlov' },
      { text: 'Climb the trembling titanium gantry before the high-voltage lines snap', isLoud: true, s: -16, c: +12, sc: 140 }
    ]
  },
  {
    id: 's29',
    title: 'THE DROWNED BASILICA OF PERPETUAL DEPTH',
    desc: 'Bone organ pipes hum at 34Hz, vibrating through your skull. Sister Nicole Marlowe kneels before an altar of dark coral, singing an infrasonic requiem that holds the Hadal Liturgist at bay.',
    survivorEncounter: {
      id: 'marlowe',
      name: 'Sister Nicole Marlowe',
      role: 'Hadal Theologian & Psalm Chanter'
    },
    puzzleType: 'sonar_frequency',
    options: [
      { text: 'Harmonize your suit acoustic communicator with her holy requiem [PUZZLE]', leadsToPuzzle: 'sonar_frequency', s: +42, c: -25, sc: 620, survivorFound: 'marlowe', itemGain: 'void_chronometer' },
      { text: 'Present the Echo Key to sanctify the liturgical resonance', itemReq: 'echo_key', s: +45, c: -30, sc: 680, survivorFound: 'marlowe' },
      { text: 'Mute your radio headsets and hurry past the singing bone pipes', isLoud: false, s: -8, c: +10, sc: 150 }
    ]
  },
  {
    id: 's30',
    title: 'AUTONOMOUS SWARM DRONE HANGAR',
    desc: 'Flooded docking bays house hundreds of aquatic reconnaissance drones. Operator Jin Park and Void Diver Kaelen Ross are trapped behind a jammed hydraulic gate as predatory siphonophores swarm the portholes.',
    survivorEncounter: {
      id: 'jin',
      name: 'Operator Jin Park',
      role: 'Autonomous Hydro-Drone Specialist'
    },
    puzzleType: 'subsea_cable_patch',
    options: [
      { text: 'Route emergency telemetry power to reboot the drone defense grid [PUZZLE]', leadsToPuzzle: 'subsea_cable_patch', s: +38, c: -15, sc: 600, survivorFound: 'jin', itemGain: 'abyssal_respirator_mk2' },
      { text: 'Use a Hadal Titanium Hydro-Drill to cut open the jammed blast hatch', itemReq: 'hadal_titanium_drill', s: +40, c: -10, sc: 640, survivorFound: 'kael' },
      { text: 'Deploy a Magnesium Flare to scatter the siphonophore swarm [LOUD]', itemReq: 'flare', itemConsume: true, isLoud: true, s: +20, c: 0, sc: 320, survivorFound: 'jin' }
    ]
  }
];

