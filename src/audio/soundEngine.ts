export interface TrackData {
  name: string;
  bpm: number;
  mood: string;
  desc: string;
  bass: number[];
  lead: number[];
  pad?: number[];
  sub?: number[];
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  public volume: number = 0.6;
  public musicVolume: number = 0.4;
  public musicMuted: boolean = false;
  private droneOsc: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  public currentTrack: string = 'abyssal_void';
  private seqTimer: number | null = null;
  private seqStep: number = 0;

  public tracks: Record<string, TrackData> = {
    abyssal_void: {
      name: 'Abyssal Void (Main Theme)',
      bpm: 72,
      mood: 'DARK HORROR',
      desc: 'Sub-surface dread with descending chromatic minor intervals.',
      bass: [43.65, 41.20, 38.89, 41.20],
      lead: [174.61, 164.81, 130.81, 196.00, 174.61, 155.56, 130.81, 146.83],
      pad: [87.31, 82.41, 77.78, 82.41]
    },
    hadal_trench: {
      name: 'Hadal Trench (Ambient Drift)',
      bpm: 60,
      mood: 'CRYOGENIC VOID',
      desc: 'Sparse abyssal echoes simulating crushing 1,100 bar hydrostatic pressure.',
      bass: [32.70, 32.70, 36.71, 34.65],
      lead: [130.81, 146.83, 164.81, 196.00, 220.00, 196.00, 164.81, 130.81],
      pad: [65.41, 73.42, 82.41, 65.41]
    },
    hadal_cathedral: {
      name: 'Hadal Cathedral (Submerged Organ)',
      bpm: 54,
      mood: 'LITURGICAL DREAD',
      desc: 'Cathedral pipe harmonics resonating in drowned limestone arches.',
      bass: [32.70, 38.89, 43.65, 36.71],
      lead: [261.63, 311.13, 392.00, 369.99, 311.13, 261.63, 220.00, 207.65],
      pad: [130.81, 155.56, 174.61, 146.83]
    },
    leviathan_heart: {
      name: 'Leviathan Heartbeat (32Hz Infrasound)',
      bpm: 48,
      mood: 'VISCERAL TERROR',
      desc: 'Sub-audible tectonic arrhythmia pulse accompanied by abyssal whale moans.',
      bass: [30.87, 29.14, 27.50, 32.70],
      lead: [92.50, 87.31, 98.00, 110.00, 92.50, 82.41, 77.78, 73.42],
      pad: [61.74, 58.27, 55.00, 65.41]
    },
    cryo_stasis: {
      name: 'Cryo-Stasis Chamber (Glass Chimes)',
      bpm: 64,
      mood: 'FROZEN SUSPENSION',
      desc: 'Sub-zero crystalline fifths, shivering glass overtones, and liquid nitrogen vents.',
      bass: [38.89, 43.65, 48.99, 43.65],
      lead: [311.13, 369.99, 466.16, 415.30, 369.99, 311.13, 293.66, 277.18],
      pad: [155.56, 185.00, 233.08, 185.00]
    },
    black_smoker_thermal: {
      name: 'Black Smoker (Thermal Vent Bass)',
      bpm: 104,
      mood: 'VOLCANIC BRINE',
      desc: 'Resonant superheated saw bass mimicking 380°C hydrothermal hydrothermal plumes.',
      bass: [46.25, 43.65, 41.20, 48.99],
      lead: [185.00, 220.00, 246.94, 277.18, 220.00, 185.00, 164.81, 146.83],
      pad: [92.50, 87.31, 82.41, 98.00]
    },
    neuro_drift: {
      name: 'Neuro-Drift (Nitrogen Narcosis)',
      bpm: 66,
      mood: 'PERCEPTUAL WARP',
      desc: 'Hypnotic microtonal intervals and phase detuning simulating depth-induced delirium.',
      bass: [34.65, 36.71, 38.89, 32.70],
      lead: [207.65, 220.00, 246.94, 261.63, 233.08, 207.65, 174.61, 164.81],
      pad: [69.30, 73.42, 77.78, 65.41]
    },
    vacuum_decompression: {
      name: 'Vacuum Decompression (Crisis Siren)',
      bpm: 148,
      mood: 'CATASTROPHIC SPEED',
      desc: 'Galloping bassline and urgent warning pings during critical bulkhead ruptures.',
      bass: [65.41, 61.74, 58.27, 55.00],
      lead: [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 293.66, 261.63],
      pad: [130.81, 123.47, 116.54, 110.00]
    },
    mimic_pulse: {
      name: "Mimic's Pulse (Heartbeat Terror)",
      bpm: 108,
      mood: 'HIGH TENSION',
      desc: 'Restless irregular acoustic spikes mimicking human chest palpitation.',
      bass: [55.00, 58.27, 51.91, 55.00],
      lead: [220.00, 233.08, 220.00, 207.65, 220.00, 277.18, 261.63, 233.08],
      pad: [110.00, 116.54, 103.83, 110.00]
    },
    dread_waltz: {
      name: 'Dread Waltz (Descent in 3/4)',
      bpm: 88,
      mood: 'GOTHIC MACABRE',
      desc: 'Haunting hypnotic ternary rhythm evoking ballroom ruins at the sea floor.',
      bass: [43.65, 38.89, 32.70, 41.20],
      lead: [174.61, 220.00, 261.63, 196.00, 246.94, 293.66, 164.81, 207.65],
      pad: [130.81, 116.54, 98.00, 123.47]
    },
    bioluminescence: {
      name: 'Bioluminescent Drift (Ghost Chimes)',
      bpm: 68,
      mood: 'ETHEREAL DREAD',
      desc: 'Crystalline overtone bell harmonics amidst total oceanic darkness.',
      bass: [36.71, 41.20, 32.70, 38.89],
      lead: [293.66, 329.63, 392.00, 440.00, 392.00, 329.63, 293.66, 246.94],
      pad: [146.83, 164.81, 130.81, 155.56]
    },
    pressure_hull: {
      name: 'Pressure Hull (Industrial Groan)',
      bpm: 96,
      mood: 'CLAUSTROPHOBIA',
      desc: 'Heavy percussive sub-strikes echoing warped titanium bulkheads.',
      bass: [48.99, 46.25, 43.65, 41.20],
      lead: [196.00, 185.00, 174.61, 164.81, 196.00, 220.00, 207.65, 185.00],
      pad: [98.00, 92.50, 87.31, 82.41]
    },
    apex_predator: {
      name: 'Apex Predator (Sonic Harassment)',
      bpm: 142,
      mood: 'EXTREME PANIC',
      desc: 'Frenetic driving bassline tracking proximity of the Hadal Apex Stalker.',
      bass: [65.41, 69.30, 61.74, 58.27],
      lead: [261.63, 277.18, 293.66, 311.13, 329.63, 311.13, 293.66, 277.18],
      pad: [130.81, 138.59, 123.47, 116.54]
    },
    drowned_choir: {
      name: 'Choir of the Sunken (Cathedral Requiem)',
      bpm: 56,
      mood: 'SOLEMN COSMIC',
      desc: 'Slow swelling cathedral harmonics commemorating submerged expedition fleets.',
      bass: [32.70, 38.89, 43.65, 34.65],
      lead: [261.63, 311.13, 349.23, 392.00, 349.23, 311.13, 261.63, 207.65],
      pad: [130.81, 155.56, 174.61, 138.59]
    },
    singularity_chase: {
      name: 'Singularity Chase (Emergency Breach)',
      bpm: 136,
      mood: 'HAZARD RED',
      desc: 'Decompression sirens and galloping chromatic tension.',
      bass: [65.41, 61.74, 58.27, 55.00],
      lead: [261.63, 293.66, 311.13, 349.23, 392.00, 349.23, 311.13, 293.66],
      pad: [130.81, 123.47, 116.54, 110.00]
    },
    cipher: {
      name: 'Cipher of the Drowned (Cryptic Sine)',
      bpm: 84,
      mood: 'INVESTIGATION',
      desc: 'Calculated mathematical arpeggios for lock bypasses and logic deciphering.',
      bass: [48.99, 51.91, 43.65, 48.99],
      lead: [196.00, 207.65, 246.94, 293.66, 261.63, 207.65, 196.00, 164.81],
      pad: [98.00, 103.83, 87.31, 98.00]
    },
    chthonic_echo: {
      name: 'Chthonic Infrasound (Void Resonator)',
      bpm: 52,
      mood: 'SUB-AUDIBLE VOID',
      desc: 'Ultra-low 27Hz fundamental drone vibrating the floor of the abyssal plain.',
      bass: [27.50, 29.14, 25.96, 27.50],
      lead: [110.00, 123.47, 130.81, 146.83, 130.81, 123.47, 110.00, 98.00],
      pad: [55.00, 58.27, 51.91, 55.00]
    },
    eulogy: {
      name: 'Eulogy for the Submerged (Final Siren)',
      bpm: 64,
      mood: 'TRAGIC TRANSCENDENCE',
      desc: 'The peaceful, terrifying acceptance of dissolution into the deep abyss.',
      bass: [65.41, 58.27, 51.91, 43.65],
      lead: [261.63, 329.63, 392.00, 523.25, 493.88, 392.00, 329.63, 261.63],
      pad: [130.81, 116.54, 103.83, 87.31]
    },
    hadal_liturgy: {
      name: 'Hadal Liturgy (Cathedral Bone Organ)',
      bpm: 52,
      mood: 'SACRED TERROR',
      desc: 'Somber liturgical requiem featuring deep polyphonic organ pedals and haunting minor triads.',
      bass: [32.70, 36.71, 38.89, 43.65],
      lead: [261.63, 277.18, 311.13, 349.23, 329.63, 277.18, 261.63, 220.00],
      pad: [130.81, 146.83, 155.56, 174.61],
      sub: [24.50, 27.50, 25.96, 21.83]
    },
    ghost_submersible: {
      name: 'Ghost Submersible U-884 (Phantom Sonar Waltz)',
      bpm: 78,
      mood: 'HAUNTING VOYAGE',
      desc: 'Rhythmic creaking diesel pulse, distant mournful fog horns, and ghostly acoustic ping intervals.',
      bass: [41.20, 43.65, 48.99, 38.89],
      lead: [164.81, 196.00, 220.00, 261.63, 246.94, 220.00, 196.00, 164.81],
      pad: [82.41, 87.31, 98.00, 77.78],
      sub: [30.87, 32.70, 36.71, 29.14]
    },
    depth_paranoia: {
      name: 'Depth Paranoia (Syncopated Arrhythmia)',
      bpm: 112,
      mood: 'VISCERAL DEMENTIA',
      desc: 'Urgent, syncopated irregular bass pulses reflecting acute nitrogen narcosis and rising panic.',
      bass: [51.91, 55.00, 48.99, 58.27],
      lead: [207.65, 220.00, 246.94, 277.18, 311.13, 277.18, 233.08, 207.65],
      pad: [103.83, 110.00, 98.00, 116.54],
      sub: [25.96, 27.50, 24.50, 29.14]
    },
    tectonic_drift: {
      name: 'Tectonic Rift (Continental Trench Resonance)',
      bpm: 44,
      mood: 'COLOSSAL WEIGHT',
      desc: 'Slow, majestic subterranean tectonic plates grinding at 10,000 meters beneath crystalline fifths.',
      bass: [27.50, 30.87, 25.96, 29.14],
      lead: [110.00, 123.47, 146.83, 164.81, 146.83, 123.47, 110.00, 98.00],
      pad: [55.00, 61.74, 51.91, 58.27],
      sub: [18.35, 20.60, 17.32, 19.45]
    },
    phantom_waltz_omega: {
      name: 'Phantom Music Box (Omega Nursery)',
      bpm: 70,
      mood: 'GOTHIC TRAGEDY',
      desc: 'A fragile, haunting music box melody decaying in cold saltwater, accompanied by sub-oceanic infrasound.',
      bass: [43.65, 41.20, 36.71, 32.70],
      lead: [349.23, 392.00, 440.00, 523.25, 440.00, 392.00, 349.23, 329.63],
      pad: [174.61, 164.81, 146.83, 130.81],
      sub: [32.70, 30.87, 27.50, 24.50]
    },
    siren_song_hypnotic: {
      name: 'Siren Matrix (Hypnotic Lure)',
      bpm: 92,
      mood: 'SEDUCTIVE TERROR',
      desc: 'Bioluminescent microtonal arpeggios that lull divers into fatal acoustic complacency.',
      bass: [48.99, 55.00, 43.65, 51.91],
      lead: [246.94, 293.66, 329.63, 369.99, 440.00, 392.00, 329.63, 277.18],
      pad: [123.47, 138.59, 110.00, 130.81],
      sub: [24.50, 27.50, 21.83, 25.96]
    },
    pale_architect_geometry: {
      name: "The Demiurge's Blueprint (Non-Euclidean Chimes)",
      bpm: 60,
      mood: 'ARCHITECTURAL OMEGA',
      desc: 'Ivory glass bells, 16Hz sub-harmonics, and complex non-Euclidean microtonal crystal spirals.',
      bass: [32.70, 34.65, 30.87, 27.50],
      lead: [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 493.88],
      pad: [130.81, 138.59, 123.47, 110.00],
      sub: [16.35, 17.32, 15.43, 13.75]
    },
    bone_weaver_filaments: {
      name: "Bone Weaver's Loom (High-Tension Silk)",
      bpm: 82,
      mood: 'ARACHNID SUSPENSE',
      desc: 'Razor-sharp calcified thread pizzicato, tense creeping arpeggios, and dry chitinous scraping.',
      bass: [38.89, 41.20, 36.71, 34.65],
      lead: [311.13, 329.63, 369.99, 415.30, 369.99, 329.63, 293.66, 277.18],
      pad: [155.56, 164.81, 146.83, 138.59],
      sub: [19.45, 20.60, 18.35, 17.32]
    },
    chrono_reversion: {
      name: 'Chronometric Reversal (Loop of the Drowned)',
      bpm: 50,
      mood: 'TEMPORAL DRIFT',
      desc: 'Ticking brass chronometer escapements, reversed envelope sines, and deep gravitational sub-drop pulses.',
      bass: [30.87, 27.50, 24.50, 29.14],
      lead: [196.00, 220.00, 261.63, 329.63, 293.66, 246.94, 196.00, 164.81],
      pad: [98.00, 87.31, 82.41, 92.50],
      sub: [15.43, 13.75, 12.25, 14.57]
    },
    scavenger_den: {
      name: "The Scavenger's Nest (Clockwork Rust & Claws)",
      bpm: 104,
      mood: 'FURTIVE SALVAGE',
      desc: 'Syncopated metallic clicks, stolen radio pings, and skittering sub-bass predator tension.',
      bass: [46.25, 48.99, 43.65, 51.91],
      lead: [185.00, 207.65, 233.08, 277.18, 246.94, 220.00, 196.00, 174.61],
      pad: [92.50, 98.00, 87.31, 103.83],
      sub: [23.12, 24.50, 21.83, 25.96]
    },
    hadal_trench_zero: {
      name: 'Challenger Zero Deep (Mantle Singularity)',
      bpm: 40,
      mood: 'PRIMORDIAL WEIGHT',
      desc: 'Boiling mineral fissure drones, 1,500 atmospheres of pressure bass, and solemn abyssal bathynaut choir.',
      bass: [24.50, 25.96, 23.12, 21.83],
      lead: [146.83, 164.81, 174.61, 220.00, 196.00, 164.81, 146.83, 130.81],
      pad: [73.42, 77.78, 69.30, 65.41],
      sub: [12.25, 12.98, 11.56, 10.91]
    },
    abyssal_radio_numbers: {
      name: 'Dead Station Broadcast (Numbers Station 94.2)',
      bpm: 72,
      mood: 'CRYPTOGRAPHIC COLD',
      desc: 'Atmospheric cold war sine pulses, morse code acoustic echoes, and haunting spectral pads.',
      bass: [36.71, 43.65, 38.89, 32.70],
      lead: [220.00, 261.63, 293.66, 349.23, 329.63, 293.66, 246.94, 220.00],
      pad: [110.00, 130.81, 116.54, 98.00],
      sub: [18.35, 21.83, 19.45, 16.35]
    }
  };

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicMuted ? 0 : this.musicVolume * this.volume, this.ctx.currentTime);
      this.musicGain.connect(this.ctx.destination);
      this.startDrone();
      this.startMusic();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.droneGain && this.ctx) {
      this.droneGain.gain.setValueAtTime(0.025 * this.volume, this.ctx.currentTime);
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicMuted ? 0 : this.musicVolume * this.volume, this.ctx.currentTime);
    }
  }

  public setMusicVolume(val: number) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicMuted ? 0 : this.musicVolume * this.volume, this.ctx.currentTime);
    }
  }

  public toggleMusic(): boolean {
    this.musicMuted = !this.musicMuted;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicMuted ? 0 : this.musicVolume * this.volume, this.ctx.currentTime);
    }
    return this.musicMuted;
  }

  public playTrack(trackId: string) {
    if (this.tracks[trackId]) {
      this.currentTrack = trackId;
      this.seqStep = 0;
      this.startMusic();
    }
  }

  private startMusic() {
    if (this.seqTimer) {
      window.clearInterval(this.seqTimer);
      this.seqTimer = null;
    }
    const track = this.tracks[this.currentTrack] || this.tracks.abyssal_void;
    const intervalMs = (60000 / track.bpm) / 2;
    this.seqTimer = window.setInterval(() => this.stepMusic(), intervalMs);
  }

  private stepMusic() {
    if (!this.ctx || this.ctx.state !== 'running' || this.musicMuted) return;
    const track = this.tracks[this.currentTrack] || this.tracks.abyssal_void;
    const step = this.seqStep;
    this.seqStep = (this.seqStep + 1) % 16;

    // Infrasound Sub-Bass Resonance on major downbeat (Step 0)
    if (step === 0 && track.sub && track.sub.length > 0) {
      const subIdx = Math.floor(Math.random() * track.sub.length);
      const subFreq = track.sub[subIdx];
      this.playSynthNote(subFreq, 2.8, 'sine', 0.32, 95, false, 0);
    }

    // Pad harmonic chord bed on major bar quarters (with gentle detuned harmonic)
    if ((step === 0 || step === 8) && track.pad && track.pad.length > 0) {
      const padIdx = Math.floor(step / 8) % track.pad.length;
      const padFreq = track.pad[padIdx];
      this.playSynthNote(padFreq, 1.45, 'sine', 0.16, 360, true, -0.2);
    }

    // Heavy bass rhythm on quarter beats
    if (step % 4 === 0) {
      const bassIdx = Math.floor(step / 4) % track.bass.length;
      const bassFreq = track.bass[bassIdx];
      this.playSynthNote(bassFreq, 0.55, 'sawtooth', 0.22, 190, true, 0);
    }

    // Sub-surface hydrophone acoustic click/tick on intermediate syncopations
    if (step % 4 === 2) {
      this.playHydrophoneTick();
    }

    // Melodic atmospheric lead with subtle stereo movement
    if (step % 2 === 0 || step % 3 === 0) {
      const leadFreq = track.lead[step % track.lead.length];
      const panVal = step % 4 === 0 ? 0.35 : -0.35;
      this.playSynthNote(leadFreq, 0.32, 'triangle', 0.14, 720, false, panVal);
    }
  }

  public playClockTick() {
    this.playTone(1800, 0.04, 'sine', 0.14);
  }

  private playHydrophoneTick() {
    if (!this.ctx || !this.musicGain || this.musicMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      const t = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.03);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, t);
      filter.Q.setValueAtTime(3, t);
      gain.gain.setValueAtTime(0.015 * this.musicVolume * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);
      osc.start(t);
      osc.stop(t + 0.04);
    } catch {
      // Audio failover
    }
  }

  private playSynthNote(freq: number, dur: number, type: OscillatorType, gainVal: number, filterFreq?: number, detuneLayer = false, pan = 0) {
    if (!this.ctx || !this.musicGain) return;
    try {
      const t = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const noteGain = this.ctx.createGain();

      osc1.type = type;
      osc1.frequency.setValueAtTime(freq, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterFreq || 450, t);
      filter.Q.setValueAtTime(2.2, t);

      // Dynamic resonant filter breathing
      filter.frequency.exponentialRampToValueAtTime(Math.min(1600, (filterFreq || 450) * 1.4), t + dur * 0.35);
      filter.frequency.exponentialRampToValueAtTime(filterFreq || 450, t + dur);

      // Smooth attack ramp to prevent speaker click transients
      const peakGain = gainVal * this.musicVolume * this.volume;
      noteGain.gain.setValueAtTime(0.0001, t);
      noteGain.gain.linearRampToValueAtTime(peakGain, t + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc1.connect(filter);

      // Layered secondary detuned oscillator for rich cinematic chorus/resonance
      if (detuneLayer) {
        const osc2 = this.ctx.createOscillator();
        osc2.type = type;
        osc2.frequency.setValueAtTime(freq, t);
        osc2.detune.setValueAtTime(7, t);
        osc2.connect(filter);
        osc2.start(t);
        osc2.stop(t + dur);
      }

      filter.connect(noteGain);

      // Stereo spatial panning
      if (this.ctx.createStereoPanner && pan !== 0) {
        const panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(pan, t);
        noteGain.connect(panner);
        panner.connect(this.musicGain);
      } else {
        noteGain.connect(this.musicGain);
      }

      osc1.start(t);
      osc1.stop(t + dur);
    } catch {
      // Audio node cleanup
    }
  }

  private startDrone() {
    if (!this.ctx) return;
    try {
      this.droneOsc = this.ctx.createOscillator();
      this.droneGain = this.ctx.createGain();
      this.droneOsc.type = 'sawtooth';
      this.droneOsc.frequency.setValueAtTime(43.65, this.ctx.currentTime);
      this.droneGain.gain.setValueAtTime(0.02 * this.volume, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, this.ctx.currentTime);

      this.droneOsc.connect(filter);
      filter.connect(this.droneGain);
      this.droneGain.connect(this.ctx.destination);
      this.droneOsc.start();
    } catch {
      // Audio failover
    }
  }

  public playTone(freq: number, dur = 0.1, type: OscillatorType = 'sine', vol = 0.12) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol * this.volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + dur);
    } catch {
      // Tone failover
    }
  }

  public playClick() { this.playTone(840, 0.035, 'square', 0.04); }
  public playChoice() { this.playTone(430, 0.08, 'sine', 0.09); }
  public playSolve() {
    this.playTone(523.25, 0.12, 'triangle', 0.16);
    window.setTimeout(() => this.playTone(659.25, 0.14, 'triangle', 0.16), 100);
    window.setTimeout(() => this.playTone(783.99, 0.22, 'triangle', 0.16), 200);
  }
  public playError() {
    this.playTone(170, 0.18, 'sawtooth', 0.2);
    window.setTimeout(() => this.playTone(120, 0.24, 'sawtooth', 0.2), 90);
  }
  public playDeath() {
    this.playTone(85, 0.6, 'sawtooth', 0.25);
    this.playTone(55, 0.9, 'sawtooth', 0.3);
  }
  public playRadioStatic() {
    this.playTone(110, 0.14, 'square', 0.07);
    this.playTone(260, 0.14, 'sawtooth', 0.06);
  }
  public playSonarPing() {
    this.playTone(1200, 0.4, 'sine', 0.12);
  }
  public playAlarm() {
    this.playTone(880, 0.12, 'sawtooth', 0.15);
    window.setTimeout(() => this.playTone(700, 0.12, 'sawtooth', 0.15), 140);
  }
  public playEntityStinger(freq = 62) {
    this.playTone(freq, 0.7, 'sawtooth', 0.28);
    this.playTone(freq * 1.5, 0.5, 'sawtooth', 0.18);
    window.setTimeout(() => this.playTone(Math.max(35, freq * 0.7), 1.0, 'sawtooth', 0.32), 120);
  }
  public playHeartbeat() {
    this.playTone(55, 0.09, 'sine', 0.25);
    window.setTimeout(() => this.playTone(42, 0.14, 'sine', 0.22), 110);
  }

  // Realistic dynamic biological heartbeat with visceral dual-thump and sub-bass resonance
  public playVisceralHeartbeat(isCritical: boolean = false, intensity: number = 1.0) {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const volMultiplier = Math.max(0.2, Math.min(1.2, intensity)) * this.volume;

      // Systolic primary contraction
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      const filter1 = this.ctx.createBiquadFilter();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(isCritical ? 58 : 50, t);
      osc1.frequency.exponentialRampToValueAtTime(isCritical ? 34 : 32, t + 0.12);

      filter1.type = 'lowpass';
      filter1.frequency.setValueAtTime(120, t);

      gain1.gain.setValueAtTime(0.001, t);
      gain1.gain.linearRampToValueAtTime(0.38 * volMultiplier, t + 0.025);
      gain1.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

      osc1.connect(filter1);
      filter1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.15);

      // Diastolic secondary contraction (120ms later)
      const t2 = t + 0.12;
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      const filter2 = this.ctx.createBiquadFilter();

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(isCritical ? 48 : 42, t2);
      osc2.frequency.exponentialRampToValueAtTime(28, t2 + 0.16);

      filter2.type = 'lowpass';
      filter2.frequency.setValueAtTime(95, t2);

      gain2.gain.setValueAtTime(0.001, t2);
      gain2.gain.linearRampToValueAtTime(0.28 * volMultiplier, t2 + 0.03);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.18);

      osc2.connect(filter2);
      filter2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t2);
      osc2.stop(t2 + 0.2);

      // Infrasound cardiac shudder when critical
      if (isCritical) {
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(29, t);
        subGain.gain.setValueAtTime(0.18 * volMultiplier, t);
        subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        subOsc.connect(subGain);
        subGain.connect(this.ctx.destination);
        subOsc.start(t);
        subOsc.stop(t + 0.32);
      }
    } catch {
      // Failover
    }
  }

  // Chilling auditory hallucination & spectral whispers
  public playWhisper(customPhrase?: string) {
    if (!this.ctx) return;

    // 1. Synthesize whispered breath audio using swept formant bandpass noise
    try {
      const bufferSize = this.ctx.sampleRate * 1.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.25;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filterA = this.ctx.createBiquadFilter();
      filterA.type = 'bandpass';
      filterA.frequency.setValueAtTime(750, this.ctx.currentTime);
      filterA.frequency.exponentialRampToValueAtTime(1450, this.ctx.currentTime + 1.2);
      filterA.Q.setValueAtTime(4, this.ctx.currentTime);

      const filterB = this.ctx.createBiquadFilter();
      filterB.type = 'bandpass';
      filterB.frequency.setValueAtTime(2400, this.ctx.currentTime);
      filterB.frequency.exponentialRampToValueAtTime(1800, this.ctx.currentTime + 1.2);
      filterB.Q.setValueAtTime(5, this.ctx.currentTime);

      const whisperGain = this.ctx.createGain();
      whisperGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      whisperGain.gain.linearRampToValueAtTime(0.18 * this.volume, this.ctx.currentTime + 0.3);
      whisperGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.35);

      whiteNoise.connect(filterA);
      whiteNoise.connect(filterB);
      filterA.connect(whisperGain);
      filterB.connect(whisperGain);
      whisperGain.connect(this.ctx.destination);

      whiteNoise.start();
    } catch {
      // Audio node fallback
    }

    // 2. Chilling spoken demonic/spectral whisper via browser SpeechSynthesis
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (!window.speechSynthesis.speaking) {
          const whispers = [
            "It sees you...",
            "Do not turn around...",
            "The water is already inside...",
            "Your oxygen is poisoned...",
            "They drowned down here...",
            "Something is tapping on the glass...",
            "Open the airlock...",
            "It is breathing on your neck...",
            "We are waiting in the deep...",
            "You cannot reach the surface..."
          ];
          const phrase = customPhrase || whispers[Math.floor(Math.random() * whispers.length)];
          const utterance = new SpeechSynthesisUtterance(phrase);
          utterance.pitch = 0.1; // Deep creepy pitch
          utterance.rate = 0.68;  // Slow eerie whisper rate
          utterance.volume = Math.max(0.05, Math.min(0.28, this.volume * 0.45));
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch {
      // Speech failover
    }
  }

  // Violent Jumpscare Stinger
  public playJumpscareStinger() {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // High-pitch discordant cluster screech
      const oscHigh1 = this.ctx.createOscillator();
      const oscHigh2 = this.ctx.createOscillator();
      const oscHigh3 = this.ctx.createOscillator();
      const highGain = this.ctx.createGain();

      oscHigh1.type = 'sawtooth';
      oscHigh2.type = 'sawtooth';
      oscHigh3.type = 'square';

      oscHigh1.frequency.setValueAtTime(2240, t);
      oscHigh1.frequency.exponentialRampToValueAtTime(620, t + 0.45);

      oscHigh2.frequency.setValueAtTime(2380, t); // Microtonal dissonance
      oscHigh2.frequency.exponentialRampToValueAtTime(580, t + 0.45);

      oscHigh3.frequency.setValueAtTime(1740, t);
      oscHigh3.frequency.exponentialRampToValueAtTime(410, t + 0.45);

      highGain.gain.setValueAtTime(0.35 * this.volume, t);
      highGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);

      oscHigh1.connect(highGain);
      oscHigh2.connect(highGain);
      oscHigh3.connect(highGain);
      highGain.connect(this.ctx.destination);

      oscHigh1.start(t);
      oscHigh2.start(t);
      oscHigh3.start(t);
      oscHigh1.stop(t + 0.6);
      oscHigh2.stop(t + 0.6);
      oscHigh3.stop(t + 0.6);

      // Crushing Sub-Bass Infrasound Thud
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(65, t);
      subOsc.frequency.exponentialRampToValueAtTime(25, t + 0.7);

      subGain.gain.setValueAtTime(0.42 * this.volume, t);
      subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);

      const subFilter = this.ctx.createBiquadFilter();
      subFilter.type = 'lowpass';
      subFilter.frequency.setValueAtTime(140, t);

      subOsc.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(this.ctx.destination);

      subOsc.start(t);
      subOsc.stop(t + 0.9);
    } catch {
      // Jumpscare fallback
    }
  }

  // Crushing Pressure Metallic Hull Creak
  public playHullCreak() {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const oscA = this.ctx.createOscillator();
      const oscB = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      oscA.type = 'sawtooth';
      oscB.type = 'triangle';

      oscA.frequency.setValueAtTime(54, t);
      oscA.frequency.linearRampToValueAtTime(78, t + 0.6);
      oscA.frequency.exponentialRampToValueAtTime(42, t + 1.6);

      oscB.frequency.setValueAtTime(57, t); // Slight detuned interference beat
      oscB.frequency.linearRampToValueAtTime(82, t + 0.6);
      oscB.frequency.exponentialRampToValueAtTime(40, t + 1.6);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, t);
      filter.frequency.linearRampToValueAtTime(320, t + 0.6);
      filter.frequency.exponentialRampToValueAtTime(90, t + 1.6);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.25 * this.volume, t + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);

      oscA.connect(filter);
      oscB.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      oscA.start(t);
      oscB.start(t);
      oscA.stop(t + 1.9);
      oscB.stop(t + 1.9);
    } catch {
      // Creak fallback
    }
  }

  // Eerie metallic talons scratching the hull exterior
  public playHullScratch() {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.8;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2800, t);
      filter.frequency.exponentialRampToValueAtTime(1400, t + 0.7);
      filter.Q.setValueAtTime(8, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.22 * this.volume, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.78);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(t);
    } catch {
      // Scratch fallback
    }
  }

  // Diver Ragged Panic Gasps & Shuddering Breathing
  public playPanickedBreath() {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // Inhalation gasp
      const bufferSize = this.ctx.sampleRate * 0.9;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.2;
      }

      const noiseIn = this.ctx.createBufferSource();
      noiseIn.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, t);
      filter.Q.setValueAtTime(3, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.18 * this.volume, t + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);

      noiseIn.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noiseIn.start(t);
    } catch {
      // Breath fallback
    }
  }
  public playSubsonicDrone() {
    this.playTone(32, 1.4, 'sine', 0.35);
    this.playTone(48, 1.1, 'sawtooth', 0.2);
  }
  public playGlitchDistortion() {
    this.playTone(95, 0.08, 'square', 0.22);
    window.setTimeout(() => this.playTone(280, 0.06, 'sawtooth', 0.18), 40);
    window.setTimeout(() => this.playTone(60, 0.12, 'square', 0.25), 90);
  }
  public playAcousticScreech() {
    this.playTone(1840, 0.25, 'sawtooth', 0.15);
    this.playTone(920, 0.35, 'sawtooth', 0.22);
    window.setTimeout(() => this.playTone(2100, 0.2, 'square', 0.12), 80);
    window.setTimeout(() => this.playTone(74, 0.6, 'sawtooth', 0.3), 160);
  }
  public playVoidBreachSound() {
    this.playTone(38, 1.8, 'sawtooth', 0.35);
    this.playTone(76, 1.2, 'square', 0.25);
    window.setTimeout(() => this.playTone(1940, 0.4, 'sawtooth', 0.18), 150);
    window.setTimeout(() => this.playTone(52, 1.6, 'sawtooth', 0.3), 320);
  }
  public playVoidEscapeSuccess() {
    this.playTone(440, 0.2, 'sine', 0.25);
    window.setTimeout(() => this.playTone(554.37, 0.25, 'triangle', 0.28), 120);
    window.setTimeout(() => this.playTone(659.25, 0.35, 'triangle', 0.3), 260);
    window.setTimeout(() => this.playTone(880, 0.6, 'sine', 0.32), 420);
  }
  public playWaveformTunePing(freq: number) {
    this.playTone(freq, 0.08, 'sine', 0.08);
  }
  public playValveTurn(pitch = 220) {
    this.playTone(pitch, 0.09, 'sawtooth', 0.09);
    this.playTone(pitch * 0.5, 0.12, 'square', 0.04);
  }
  public playQuantumBeep(index: number) {
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
    const freq = scale[index % scale.length];
    this.playTone(freq, 0.15, 'triangle', 0.18);
  }
  public playHarmonicAlign() {
    this.playTone(523.25, 0.25, 'sine', 0.16);
    this.playTone(659.25, 0.25, 'triangle', 0.14);
    this.playTone(783.99, 0.35, 'sine', 0.15);
  }
  public playLaserDeflect(angle = 0) {
    const baseFreq = 880 + (angle % 4) * 220;
    this.playTone(baseFreq, 0.08, 'sine', 0.12);
    this.playTone(baseFreq * 1.5, 0.05, 'triangle', 0.08);
  }
  public playPistonThud(pressure = 100) {
    const freq = Math.max(40, 90 - (pressure * 0.3));
    this.playTone(freq, 0.18, 'sawtooth', 0.22);
    this.playTone(freq * 0.5, 0.25, 'sine', 0.25);
  }
  public playSpectrogramSweep(freq = 440) {
    this.playTone(freq, 0.07, 'sine', 0.09);
  }

  // Realistic sudden tapping on the monitor glass / helmet visor
  public playGlassKnock() {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // Tap 1
      const tap1Osc = this.ctx.createOscillator();
      const tap1Gain = this.ctx.createGain();
      const tap1Filter = this.ctx.createBiquadFilter();
      tap1Osc.type = 'triangle';
      tap1Osc.frequency.setValueAtTime(1420, t);
      tap1Osc.frequency.exponentialRampToValueAtTime(320, t + 0.045);
      tap1Filter.type = 'bandpass';
      tap1Filter.frequency.setValueAtTime(2100, t);
      tap1Filter.Q.setValueAtTime(8, t);
      tap1Gain.gain.setValueAtTime(0.42 * this.volume, t);
      tap1Gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      tap1Osc.connect(tap1Filter);
      tap1Filter.connect(tap1Gain);
      tap1Gain.connect(this.ctx.destination);
      tap1Osc.start(t);
      tap1Osc.stop(t + 0.06);

      // Tap 2 (140ms later, slightly closer)
      const t2 = t + 0.14;
      const tap2Osc = this.ctx.createOscillator();
      const tap2Gain = this.ctx.createGain();
      const tap2Filter = this.ctx.createBiquadFilter();
      tap2Osc.type = 'triangle';
      tap2Osc.frequency.setValueAtTime(1680, t2);
      tap2Osc.frequency.exponentialRampToValueAtTime(360, t2 + 0.045);
      tap2Filter.type = 'bandpass';
      tap2Filter.frequency.setValueAtTime(2350, t2);
      tap2Filter.Q.setValueAtTime(9, t2);
      tap2Gain.gain.setValueAtTime(0.48 * this.volume, t2);
      tap2Gain.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.06);
      tap2Osc.connect(tap2Filter);
      tap2Filter.connect(tap2Gain);
      tap2Gain.connect(this.ctx.destination);
      tap2Osc.start(t2);
      tap2Osc.stop(t2 + 0.07);
    } catch {
      // Knock fallback
    }
  }

  // Piercing hydrostatic glass fracture snap and spiderweb crack
  public playGlassCrack() {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // High-pitched initial shatter snap
      const snapOsc = this.ctx.createOscillator();
      const snapGain = this.ctx.createGain();
      snapOsc.type = 'sawtooth';
      snapOsc.frequency.setValueAtTime(3600, t);
      snapOsc.frequency.exponentialRampToValueAtTime(1100, t + 0.12);
      snapGain.gain.setValueAtTime(0.38 * this.volume, t);
      snapGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
      snapOsc.connect(snapGain);
      snapGain.connect(this.ctx.destination);
      snapOsc.start(t);
      snapOsc.stop(t + 0.16);

      // Sub-surface brittle splintering noise
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2800, t);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25 * this.volume, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(t);
    } catch {
      // Crack fallback
    }
  }

  // The Warden's Corrupted Hydraulic Lockdown Slam
  public playWardenLockdown() {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // Low industrial piston impact
      const slam = this.ctx.createOscillator();
      const slamGain = this.ctx.createGain();
      slam.type = 'sawtooth';
      slam.frequency.setValueAtTime(85, t);
      slam.frequency.exponentialRampToValueAtTime(28, t + 0.35);
      slamGain.gain.setValueAtTime(0.55 * this.volume, t);
      slamGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      slam.connect(slamGain);
      slamGain.connect(this.ctx.destination);
      slam.start(t);
      slam.stop(t + 0.5);

      // High metallic clamp ring
      const ring = this.ctx.createOscillator();
      const ringGain = this.ctx.createGain();
      ring.type = 'square';
      ring.frequency.setValueAtTime(440, t);
      ring.frequency.setValueAtTime(370, t + 0.08);
      ringGain.gain.setValueAtTime(0.22 * this.volume, t);
      ringGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      ring.connect(ringGain);
      ringGain.connect(this.ctx.destination);
      ring.start(t);
      ring.stop(t + 0.35);
    } catch {
      // Lockdown fallback
    }
  }

  // Primordial Sub-Audible Infrasound Abyss Dive (18Hz - 28Hz)
  public playAbyssSubInfrasound() {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(32, t);
      osc1.frequency.exponentialRampToValueAtTime(19, t + 1.8);

      osc2.frequency.setValueAtTime(28, t);
      osc2.frequency.exponentialRampToValueAtTime(17, t + 1.8);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(65, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.65 * this.volume, t + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 2.3);
      osc2.stop(t + 2.3);
    } catch {
      // Abyss infrasound fallback
    }
  }

  // Agonal drowning gasp and waterlogged bubbling
  public playDrowningGasp() {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.7;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(520, t);
      filter.frequency.linearRampToValueAtTime(280, t + 0.5);
      filter.Q.setValueAtTime(6, t);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);
    } catch {
      // Gasp fallback
    }
  }

  // The Warden's high-pressure pneumatic steam hiss when priming locks
  public playPneumaticSteam() {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.45;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3200, t);
      filter.frequency.exponentialRampToValueAtTime(1400, t + 0.4);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.28 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);
    } catch {
      // Steam fallback
    }
  }

  // The Mimic's sudden wet flesh snarl and razor tooth snap
  public playMimicSnarl() {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(190, t);
      osc.frequency.exponentialRampToValueAtTime(65, t + 0.22);
      gain.gain.setValueAtTime(0.45 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);

      // Snap crunch
      window.setTimeout(() => {
        this.playTone(850, 0.04, 'square', 0.35);
        this.playTone(320, 0.06, 'sawtooth', 0.4);
      }, 90);
    } catch {
      // Snarl fallback
    }
  }

  // The Null Stalker's sub-dimensional tendril scrape across the hull
  public playTendrilScrape() {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(24, t);
      osc.frequency.linearRampToValueAtTime(58, t + 0.6);
      osc.frequency.exponentialRampToValueAtTime(18, t + 1.2);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.48 * this.volume, t + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 1.3);
    } catch {
      // Tendril fallback
    }
  }

  // The Siren Matrix's glitched holographic singing
  public playSirenEcho() {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const freqs = [659.25, 783.99, 880, 1046.5];
      freqs.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t + i * 0.08);
        osc.frequency.linearRampToValueAtTime(f * 1.05, t + 0.8);
        gain.gain.setValueAtTime(0.001, t + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.12 * this.volume, t + i * 0.08 + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t + i * 0.08);
        osc.stop(t + 1.25);
      });
    } catch {
      // Siren fallback
    }
  }
}

export const audio = new SoundEngine();
