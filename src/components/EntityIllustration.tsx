import React, { useState, useEffect, useRef } from 'react';
import { EntityInfo } from '../types';
import { audio } from '../audio/soundEngine';

export type DiagnosticScanMode = 'optical' | 'sonar' | 'xray' | 'thermal' | 'ultrasound';

interface EntityIllustrationProps {
  entity: EntityInfo;
  scanMode?: DiagnosticScanMode;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  interactive?: boolean;
}

export const EntityIllustration: React.FC<EntityIllustrationProps> = ({
  entity,
  scanMode = 'optical',
  size = 'md',
  animated = true,
  interactive = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAgitated, setIsAgitated] = useState(false);
  const [pulsePhase, setPulsePhase] = useState(0);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isPupilDilated, setIsPupilDilated] = useState(false);

  // Periodic agitation micro-pulse for eerie life-like presence
  useEffect(() => {
    if (!animated) return;
    const interval = setInterval(() => {
      setPulsePhase(p => (p + 1) % 100);
    }, 150);
    return () => clearInterval(interval);
  }, [animated]);

  // Dynamic Cursor Tracking: Entities observe and follow the player's mouse/touch position
  useEffect(() => {
    let idleTimer: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const angle = Math.atan2(dy, dx);
      const maxShift = 7.5;
      const dist = Math.min(1, Math.hypot(dx, dy) / 400);

      setEyeOffset({
        x: Math.cos(angle) * maxShift * dist,
        y: Math.sin(angle) * maxShift * dist
      });
      setIsPupilDilated(false);

      clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        setIsPupilDilated(true); // After 2.5s of cursor stillness, predatory dilation
      }, 2500);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(idleTimer);
    };
  }, []);

  const handleEntityClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!interactive) return;
    setIsAgitated(true);
    audio.playAcousticScreech();
    setTimeout(() => setIsAgitated(false), 900);
  };

  const containerSize =
    size === 'sm'
      ? 'w-28 h-28'
      : size === 'lg'
      ? 'w-full h-80 sm:h-96'
      : 'w-full h-64 sm:h-72';

  // Mode filter adjustments
  const getFilterClass = () => {
    switch (scanMode) {
      case 'sonar':
        return 'filter hue-rotate-[145deg] contrast-[220%] brightness-110 saturate-[220%]';
      case 'xray':
        return 'filter invert hue-rotate-[200deg] contrast-[200%] brightness-105';
      case 'thermal':
        return 'filter hue-rotate-[300deg] contrast-[250%] brightness-125 saturate-[300%]';
      case 'ultrasound':
        return 'filter hue-rotate-[180deg] saturate-[280%] contrast-[240%] drop-shadow-[0_0_12px_#06b6d4]';
      case 'optical':
      default:
        return 'filter contrast-[140%] saturate-[160%] brightness-[95%]';
    }
  };

  // Render high-fidelity, terrifying SVG graphic for each entity
  const renderDetailedArtwork = () => {
    switch (entity.id) {
      case 'the_trader':
        return (
          <g className={animated ? "animate-predatory-breathe" : ""}>
            {/* Ominous Alchemical Hexagram & Ticking Probability Halo */}
            <circle cx="100" cy="95" r="88" fill="none" stroke="#78350f" strokeWidth="1" strokeDasharray="6 4" opacity="0.4" className={animated ? "animate-spin" : ""} style={{ animationDuration: '35s' }} />
            <circle cx="100" cy="95" r="76" fill="none" stroke="#b45309" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.55" />
            <polygon points="100,15 170,135 30,135" fill="none" stroke="#d97706" strokeWidth="1" opacity="0.3" />
            <polygon points="100,175 30,55 170,55" fill="none" stroke="#d97706" strokeWidth="1" opacity="0.3" />

            {/* Shredded Waterlogged Shroud & Flayed Leathery Cowl */}
            <path
              d="M44 55 C38 12, 162 12, 156 55 C168 105, 178 168, 172 192 L28 192 C22 168, 32 105, 44 55 Z"
              fill="#060208"
              stroke="#7f1d1d"
              strokeWidth="3.5"
            />
            {/* Barbed Suture Lines Across Shroud */}
            <path d="M52 70 Q100 110 148 70" stroke="#b91c1c" strokeWidth="2.5" fill="none" />
            {[65, 82, 100, 118, 135].map(x => (
              <line key={x} x1={x - 2} y1={80} x2={x + 2} y2={92} stroke="#450a0a" strokeWidth="2.5" />
            ))}

            {/* Hanging Rusted Iron Chains with Skeletal Fingers & Tooth Dice */}
            <line x1="72" y1="75" x2="60" y2="135" stroke="#78350f" strokeWidth="2" strokeDasharray="3 2" />
            <line x1="128" y1="75" x2="140" y2="135" stroke="#78350f" strokeWidth="2" strokeDasharray="3 2" />

            {/* Suspended Human Tooth Dice (Floating in Murky Brine) */}
            <g className={animated ? "animate-ocular-twitch-violent" : ""}>
              {/* Tooth Die 1 */}
              <rect x="44" y="122" width="18" height="18" rx="3" fill="#fef3c7" stroke="#7f1d1d" strokeWidth="2" transform="rotate(-18 53 131)" />
              <circle cx="48" cy="126" r="2" fill="#991b1b" />
              <circle cx="58" cy="136" r="2" fill="#991b1b" />
              <circle cx="53" cy="131" r="2.2" fill="#991b1b" />

              {/* Tooth Die 2 */}
              <rect x="138" y="122" width="18" height="18" rx="3" fill="#fef3c7" stroke="#7f1d1d" strokeWidth="2" transform="rotate(22 147 131)" />
              <circle cx="142" cy="126" r="2" fill="#991b1b" />
              <circle cx="152" cy="136" r="2" fill="#991b1b" />
            </g>

            {/* Clamped Open Titanium Ribcage with Rusted Surgical Retractors */}
            <ellipse cx="100" cy="128" rx="38" ry="46" fill="#020004" stroke="#991b1b" strokeWidth="3" />
            {/* Exposed Severed Spinal Cord Column */}
            <path d="M100 86 L100 170" stroke="#fef08a" strokeWidth="3.5" strokeDasharray="4 3" />

            {/* Biomechanical Blackened Heart Valve Pumping Dark Bile */}
            <ellipse cx="100" cy="122" rx="16" ry="20" fill="#450a0a" stroke="#ef4444" strokeWidth="2" className="animate-pulse" />
            <circle cx="100" cy="122" r="8" fill="#1c0505" />

            {/* Grinding Brass Gears Chewing on Bone Shards */}
            <g className={animated ? "animate-spin" : ""} style={{ transformOrigin: '88px 120px', animationDuration: '4.5s' }}>
              <circle cx="88" cy="120" r="15" fill="#78350f" stroke="#fbbf24" strokeWidth="2" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                <rect key={deg} x="86" y="103" width="4" height="6" fill="#fbbf24" transform={`rotate(${deg} 88 120)`} />
              ))}
            </g>
            <g className={animated ? "animate-spin" : ""} style={{ transformOrigin: '112px 135px', animationDuration: '3.5s', animationDirection: 'reverse' }}>
              <circle cx="112" cy="135" r="13" fill="#451a03" stroke="#f59e0b" strokeWidth="1.8" />
              {[0, 60, 120, 180, 240, 300].map(deg => (
                <rect key={deg} x="110" y="120" width="4" height="5" fill="#f59e0b" transform={`rotate(${deg} 112 135)`} />
              ))}
            </g>

            {/* Horrifying Shattered Porcelain Mask Held with Iron Staples */}
            <path
              d="M74 38 C72 18, 128 18, 126 38 C128 66, 116 82, 100 82 C84 82, 72 66, 74 38 Z"
              fill="#e2e8f0"
              stroke="#334155"
              strokeWidth="2.5"
            />
            {/* Deep Jagged Fractures Weeping Black Salt */}
            <path d="M100 24 L94 45 L106 58 L96 76" stroke="#450a0a" strokeWidth="2" fill="none" />
            <path d="M84 48 L74 62" stroke="#450a0a" strokeWidth="1.8" fill="none" />
            <path d="M116 48 L126 62" stroke="#450a0a" strokeWidth="1.8" fill="none" />

            {/* Triangular Triad of Predatory Staring Eyes (Tracks Cursor) */}
            <g transform={`translate(${eyeOffset.x * 0.9}, ${eyeOffset.y * 0.9})`}>
              {/* Left Eye */}
              <ellipse cx="86" cy="46" rx="7" ry="4" fill="#000" stroke="#7f1d1d" strokeWidth="1.5" />
              <circle cx="86" cy="46" r={isPupilDilated ? 3.5 : 2} fill="#ef4444" className="animate-pulse" />
              <circle cx="86" cy="46" r="0.8" fill="#ffffff" />

              {/* Right Eye */}
              <ellipse cx="114" cy="46" rx="7" ry="4" fill="#000" stroke="#7f1d1d" strokeWidth="1.5" />
              <circle cx="114" cy="46" r={isPupilDilated ? 3.5 : 2} fill="#ef4444" className="animate-pulse" />
              <circle cx="114" cy="46" r="0.8" fill="#ffffff" />

              {/* Third Forehead Occult Eye */}
              <ellipse cx="100" cy="34" rx="6" ry="4" fill="#000" stroke="#f59e0b" strokeWidth="1.5" />
              <circle cx="100" cy="34" r="2.2" fill="#fbbf24" className="animate-ping" style={{ animationDuration: '2.2s' }} />
              <circle cx="100" cy="34" r="0.8" fill="#ffffff" />
            </g>

            {/* Horrific Wide Barbed Rictus Smile Stitched Shut */}
            <path d="M84 66 Q100 78 116 66" stroke="#000000" strokeWidth="3" fill="none" strokeLinecap="round" />
            {[-12, -6, 0, 6, 12].map(dx => (
              <line key={dx} x1={100 + dx} y1={66} x2={100 + dx} y2={74} stroke="#991b1b" strokeWidth="1.8" />
            ))}

            {/* Dripping Black Viscous Brine */}
            <path d="M68 145 Q62 175 58 195" stroke="#0f0505" strokeWidth="4" strokeLinecap="round" />
            <path d="M132 145 Q138 175 142 195" stroke="#0f0505" strokeWidth="4" strokeLinecap="round" />
          </g>
        );

      case 'listener':
        return (
          <g className={animated ? "animate-predatory-breathe" : ""}>
            {/* Radiating Infrasound Acoustic Horror Waves */}
            <circle cx="100" cy="92" r="92" fill="none" stroke="#dc2626" strokeWidth="1" strokeDasharray="6 4" opacity="0.3" className="animate-sonar-radiate" />
            <circle cx="100" cy="92" r="74" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
            <circle cx="100" cy="92" r="54" fill="none" stroke="#ff8888" strokeWidth="2" opacity="0.7" />

            {/* Massive Hadal Cetacean Chitin Skull with Bone Fissures */}
            <path
              d="M28 62 C22 18, 178 18, 172 62 C180 118, 152 178, 100 192 C48 178, 20 118, 28 62 Z"
              fill="url(#listenerBoneGrad)"
              stroke="#991b1b"
              strokeWidth="4"
            />
            {/* Deep Fracture Rifts Leaking Neural Lightning */}
            <path d="M100 24 L92 56 L108 76 L96 95" stroke="#ef4444" strokeWidth="2.5" fill="none" />
            <path d="M108 76 L134 84 L146 102" stroke="#dc2626" strokeWidth="2" fill="none" />
            <path d="M92 56 L68 64 L56 82" stroke="#dc2626" strokeWidth="2" fill="none" />

            {/* Cavernous Hollow Auditory Parabolic Crater */}
            <ellipse cx="100" cy="78" rx="50" ry="40" fill="#030005" stroke="#b91c1c" strokeWidth="3" />
            <ellipse cx="100" cy="78" rx="38" ry="30" fill="#000000" stroke="#7f1d1d" strokeWidth="2" />

            {/* Undulating Needle-Thin Hydrostatic Cilia (Oscillate with acoustic resonance) */}
            <g className={animated ? "animate-tendril-wriggle" : ""}>
              {Array.from({ length: 56 }).map((_, i) => {
                const angle = (i / 56) * Math.PI * 2;
                const innerR = 36;
                const outerR = 52 + (i % 5) * 7 + ((pulsePhase + i) % 6);
                const x1 = 100 + Math.cos(angle) * innerR;
                const y1 = 78 + Math.sin(angle) * (innerR * 0.78);
                const x2 = 100 + Math.cos(angle) * outerR;
                const y2 = 78 + Math.sin(angle) * (outerR * 0.78);
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={i % 3 === 0 ? "#ef4444" : i % 3 === 1 ? "#fca5a5" : "#fee2e2"}
                    strokeWidth={i % 2 === 0 ? "2" : "1.4"}
                    strokeLinecap="round"
                    opacity="0.95"
                  />
                );
              })}
            </g>

            {/* Exposed Throbbing Neural Brainstem & Cochlear Core */}
            <circle cx="100" cy="78" r="18" fill="#7f1d1d" opacity="0.9" className="animate-arterial-pulse" />
            <circle cx="100" cy="78" r="9" fill="#ffffff" />
            <circle cx="100" cy="78" r="4" fill="#991b1b" />

            {/* Four Stolen Severed Human Diver Eyes Embedded in Bone Faults */}
            <g className={animated ? "animate-ocular-twitch-violent" : ""} transform={`translate(${eyeOffset.x * 0.75}, ${eyeOffset.y * 0.75})`}>
              {[
                { cx: 58, cy: 62, r: 6 },
                { cx: 142, cy: 62, r: 6 },
                { cx: 68, cy: 104, r: 5 },
                { cx: 132, cy: 104, r: 5 }
              ].map((eye, i) => (
                <g key={i}>
                  <ellipse cx={eye.cx} cy={eye.cy} rx={eye.r} ry={eye.r * 0.8} fill="#fef2f2" stroke="#991b1b" strokeWidth="1.5" />
                  {/* Bloodshot Sclera Veins */}
                  <line x1={eye.cx - 4} y1={eye.cy} x2={eye.cx - 1} y2={eye.cy} stroke="#dc2626" strokeWidth="0.8" />
                  <line x1={eye.cx + 1} y1={eye.cy} x2={eye.cx + 4} y2={eye.cy} stroke="#dc2626" strokeWidth="0.8" />
                  <circle cx={eye.cx} cy={eye.cy} r={isPupilDilated ? eye.r * 0.6 : eye.r * 0.45} fill="#450a0a" />
                  <circle cx={eye.cx} cy={eye.cy} r={eye.r * 0.2} fill="#ef4444" />
                </g>
              ))}
            </g>

            {/* Gaping Lower Mandibles & Triple Concentric Serrated Needle Fangs */}
            <path
              d="M48 116 Q100 166 152 116 Q146 178 100 188 Q54 178 48 116 Z"
              fill="#060107"
              stroke="#7f1d1d"
              strokeWidth="3"
            />
            {/* Top Outer Serrated Viper Fangs */}
            {[-40, -32, -24, -16, -8, 0, 8, 16, 24, 32, 40].map((offset, i) => (
              <polygon
                key={'ot' + i}
                points={`${100 + offset},116 ${100 + offset + 3},138 ${100 + offset + 6},116`}
                fill="#fef2f2"
                stroke="#450a0a"
                strokeWidth="0.8"
              />
            ))}
            {/* Inner Recurved Flesh-Tearing Teeth */}
            {[-34, -26, -18, -10, -2, 6, 14, 22, 30].map((offset, i) => (
              <polygon
                key={'it' + i}
                points={`${100 + offset},124 ${100 + offset + 3},144 ${100 + offset + 6},124`}
                fill="#fed7aa"
                stroke="#7c2d12"
                strokeWidth="0.6"
              />
            ))}
            {/* Bottom Upward-Impaling Needles */}
            {[-36, -28, -20, -12, -4, 4, 12, 20, 28, 36].map((offset, i) => (
              <polygon
                key={'b' + i}
                points={`${100 + offset},172 ${100 + offset + 3},150 ${100 + offset + 6},172`}
                fill="#f1efe7"
                stroke="#450a0a"
                strokeWidth="0.8"
              />
            ))}

            {/* Weeping Black Viscous Saline & Blood Droplets */}
            <path d="M70 148 Q64 178 58 198" stroke="#1c0505" strokeWidth="5" strokeLinecap="round" />
            <path d="M130 148 Q136 178 142 198" stroke="#1c0505" strokeWidth="5" strokeLinecap="round" />
            <path d="M100 172 Q100 188 98 200" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
          </g>
        );

      case 'warden':
        return (
          <g className={animated ? "animate-predatory-breathe" : ""}>
            {/* Massive Corroded Hydraulic Blast Hatch Frame with Heavy Rivets */}
            <rect x="22" y="20" width="156" height="160" rx="12" fill="url(#wardenSteelGrad)" stroke="#7f1d1d" strokeWidth="4" />
            <rect x="34" y="30" width="132" height="140" rx="8" fill="#050307" stroke="#450a0a" strokeWidth="2.5" />

            {/* Heavy Bolted Studs Stained in Rust & Blood */}
            {[
              [28, 26], [172, 26], [28, 174], [172, 174], [100, 24], [100, 176],
              [28, 100], [172, 100]
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="3.5" fill="#450a0a" stroke="#ef4444" strokeWidth="1" />
            ))}

            {/* Heavy Hydraulic Piston Cylinders Gushing Pressurized Steam & Black Blood */}
            <line x1="28" y1="34" x2="62" y2="78" stroke="#c2410c" strokeWidth="6" strokeLinecap="round" />
            <line x1="172" y1="34" x2="138" y2="78" stroke="#c2410c" strokeWidth="6" strokeLinecap="round" />
            <line x1="28" y1="166" x2="68" y2="128" stroke="#7c2d12" strokeWidth="6" strokeLinecap="round" />
            <line x1="172" y1="166" x2="132" y2="128" stroke="#7c2d12" strokeWidth="6" strokeLinecap="round" />

            {/* Three Crushed Human Diver Helmets / Skeletons Fused into Hydraulic Ram */}
            {/* Center Crushed Skull */}
            <path
              d="M72 82 C72 48, 128 48, 128 82 C128 112, 118 126, 100 126 C82 126, 72 112, 72 82 Z"
              fill="#d6d3d1"
              stroke="#450a0a"
              strokeWidth="3"
            />
            {/* Shattered Helmet Visor Ring with Crushed Spiderweb Glass */}
            <ellipse cx="100" cy="80" rx="38" ry="34" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="14 4" opacity="0.75" />
            <path d="M100 48 L108 70 L126 74 L114 88 L122 106" stroke="#22d3ee" strokeWidth="1.8" fill="none" />
            <path d="M108 70 L86 76 L74 70" stroke="#22d3ee" strokeWidth="1.5" fill="none" />

            {/* Left and Right Crushed Diver Visor Remnants in Pistons */}
            <ellipse cx="50" cy="100" rx="14" ry="18" fill="#1c1917" stroke="#7f1d1d" strokeWidth="2" />
            <ellipse cx="50" cy="100" rx="8" ry="10" fill="#000" />
            <ellipse cx="150" cy="100" rx="14" ry="18" fill="#1c1917" stroke="#7f1d1d" strokeWidth="2" />
            <ellipse cx="150" cy="100" rx="8" ry="10" fill="#000" />

            {/* Tri-Laser Security Targeting Sensors with Weeping Camera Lens */}
            <g className={animated ? "animate-ocular-twitch-violent" : ""}>
              {/* Left Eye */}
              <circle cx="86" cy="78" r="10" fill="#100000" stroke="#ef4444" strokeWidth="2.5" />
              <g transform={`translate(${eyeOffset.x.toFixed(1)}, ${eyeOffset.y.toFixed(1)})`}>
                <circle cx="86" cy="78" r={isPupilDilated ? 7 : 5.2} fill="#dc2626" className="animate-ping" style={{ animationDuration: '1.6s' }} />
                <circle cx="86" cy="78" r={isPupilDilated ? 4 : 2.8} fill="#ffffff" />
                <circle cx="86" cy="78" r="1" fill="#000000" />
              </g>

              {/* Right Eye */}
              <circle cx="114" cy="78" r="10" fill="#100000" stroke="#ef4444" strokeWidth="2.5" />
              <g transform={`translate(${eyeOffset.x.toFixed(1)}, ${eyeOffset.y.toFixed(1)})`}>
                <circle cx="114" cy="78" r={isPupilDilated ? 7 : 5.2} fill="#dc2626" />
                <circle cx="114" cy="78" r={isPupilDilated ? 4 : 2.8} fill="#ffffff" />
                <circle cx="114" cy="78" r="1" fill="#000000" />
              </g>

              {/* Central Overhead Surveillance Reticle */}
              <circle cx="100" cy="60" r="5" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
              <line x1="78" y1="78" x2="122" y2="78" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
            </g>

            {/* Heavy Hydraulic Lines Spliced into Human Spinal Cords */}
            <path d="M100 126 Q94 158 86 188" stroke="#dc2626" strokeWidth="5" fill="none" />
            <path d="M94 126 Q102 155 110 188" stroke="#991b1b" strokeWidth="4" fill="none" />
            <path d="M106 126 Q120 155 126 188" stroke="#ef4444" strokeWidth="3" fill="none" />
            <path d="M78 118 Q72 148 64 178" stroke="#ea580c" strokeWidth="2.5" fill="none" strokeDasharray="4 2" />
            <path d="M122 118 Q128 148 136 178" stroke="#ea580c" strokeWidth="2.5" fill="none" strokeDasharray="4 2" />

            {/* Heavy Steel Guillotine Teeth Clamped Across Bottom Airlock Sill */}
            <rect x="84" y="106" width="32" height="15" rx="3" fill="#1c1917" stroke="#991b1b" strokeWidth="1.5" />
            {[-12, -7, -2, 3, 8, 13].map((offset, i) => (
              <line key={i} x1={100 + offset} y1="106" x2={100 + offset} y2="120" stroke="#f5f5f4" strokeWidth="2.2" />
            ))}
          </g>
        );

      case 'mimic':
        return (
          <g className={animated ? "animate-predatory-breathe" : ""}>
            {/* Peeling Ripped Hull Airlock Frame */}
            <rect x="32" y="18" width="136" height="164" rx="6" fill="url(#mimicHullGrad)" stroke="#581c87" strokeWidth="3.5" />

            {/* Ripped-Open Flayed Steel Wall Revealing Bloody Living Flesh Cavity */}
            <path
              d="M92 18 C112 50, 160 55, 168 72 L168 182 L92 182 Z"
              fill="#2e0510"
              stroke="#dc2626"
              strokeWidth="3"
            />
            {/* Striated Raw Connective Muscle Fibers */}
            {Array.from({ length: 15 }).map((_, i) => (
              <line
                key={i}
                x1={92}
                y1={28 + i * 10}
                x2={110 + (i % 3) * 14}
                y2={34 + i * 10}
                stroke="#ef4444"
                strokeWidth="2.2"
                strokeDasharray="4 2"
              />
            ))}

            {/* Cavernous Eldritch Digestive Maw */}
            <ellipse cx="98" cy="100" rx="52" ry="72" fill="#050002" stroke="#991b1b" strokeWidth="3.5" />

            {/* Concentric Interlocking Rings of Human Incisors & Lamprey Fangs */}
            {[0, 1, 2, 3].map(ring => {
              const rx = 46 - ring * 11;
              const ry = 62 - ring * 15;
              return (
                <ellipse
                  key={ring}
                  cx="98"
                  cy="100"
                  rx={rx}
                  ry={ry}
                  fill="none"
                  stroke={ring === 0 ? "#fdfbf7" : ring === 1 ? "#fed7aa" : ring === 2 ? "#fb923c" : "#991b1b"}
                  strokeWidth="3.5"
                  strokeDasharray={ring % 2 === 0 ? "6 4" : "4 6"}
                />
              );
            })}

            {/* Half-Digested Diver Arm Reaching Out From Gullet Acid */}
            <g className={animated ? "animate-ocular-twitch-violent" : ""}>
              <path
                d="M98 100 Q120 78 146 70"
                stroke="#d6d3d1"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
              />
              {/* Diver Wedding Ring Still on Rotting Finger */}
              <circle cx="138" cy="72" r="3.5" fill="none" stroke="#f59e0b" strokeWidth="2" />
              {/* Desiccated Reaching Claws / Finger Tendons */}
              <line x1="146" y1="70" x2="160" y2="62" stroke="#e7e5e4" strokeWidth="3" strokeLinecap="round" />
              <line x1="146" y1="70" x2="162" y2="72" stroke="#e7e5e4" strokeWidth="3" strokeLinecap="round" />
              <line x1="146" y1="70" x2="158" y2="82" stroke="#e7e5e4" strokeWidth="3" strokeLinecap="round" />
            </g>

            {/* Dying Emergency Diver Beacon Glowing Sickly Yellow in Throat */}
            <circle cx="98" cy="100" r="10" fill="#facc15" opacity="0.9" className="animate-pulse" />
            <circle cx="98" cy="100" r="4" fill="#ffffff" />

            {/* Dripping Strands of Viscous Black Bile & Digestive Acid */}
            <path d="M74 122 Q68 158 64 192" stroke="#0f0204" strokeWidth="6" strokeLinecap="round" />
            <path d="M116 128 Q122 162 128 192" stroke="#1a0408" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M98 142 Q96 172 94 196" stroke="#b91c1c" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        );

      case 'curator':
        return (
          <g className={animated ? "animate-predatory-breathe" : ""}>
            {/* Corroded Ceiling Bulkhead Pipes Weeping Acidic Salt */}
            <line x1="8" y1="16" x2="192" y2="16" stroke="#292524" strokeWidth="10" />
            <line x1="8" y1="26" x2="192" y2="26" stroke="#1c1917" strokeWidth="5" />
            <path d="M40 26 Q42 50 38 65" stroke="#15803d" strokeWidth="2" strokeDasharray="3 2" />
            <path d="M160 26 Q158 50 162 65" stroke="#15803d" strokeWidth="2" strokeDasharray="3 2" />

            {/* Eight Terrifying Elongated Spindly Barbed Arachnid Joints */}
            {[-82, -56, -28, 28, 56, 82].map((xOffset, i) => {
              const hipX = 100 + xOffset * 0.32;
              const kneeX = 100 + xOffset * 0.88;
              const footX = 100 + xOffset * 1.38;
              return (
                <g key={i} className={animated ? "animate-tendril-wriggle" : ""}>
                  <line x1="100" y1="68" x2={hipX} y2="52" stroke="#78716c" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1={hipX} y1="52" x2={kneeX} y2="118" stroke="#a8a29e" strokeWidth="3" strokeLinecap="round" />
                  <line x1={kneeX} y1="118" x2={footX} y2="186" stroke="#d6d3d1" strokeWidth="2.4" strokeLinecap="round" />
                  {/* Articulated Spurred Knee Joint with Spikes */}
                  <circle cx={kneeX} cy="118" r="4.5" fill="#450a0a" stroke="#ef4444" strokeWidth="1.5" />
                  <line x1={kneeX} y1="118" x2={kneeX + (xOffset > 0 ? 6 : -6)} y2="110" stroke="#fecaca" strokeWidth="2" />
                  {/* Barbed Talon Hook on Foot Dripping Venom */}
                  <line x1={footX} y1="186" x2={footX + (xOffset > 0 ? 9 : -9)} y2="178" stroke="#facc15" strokeWidth="2.5" />
                </g>
              );
            })}

            {/* Central Calcified Carapace Formed of 14 Welded Crushed Diver Helmets */}
            <ellipse cx="100" cy="74" rx="36" ry="42" fill="#0c0a09" stroke="#78716c" strokeWidth="3.5" />

            {/* Hoarded Crushed Diving Helmet Trophy #1 */}
            <circle cx="86" cy="62" r="17" fill="#451a03" stroke="#1c0a00" strokeWidth="2.5" />
            <path d="M74 62 Q86 50 98 62" stroke="#06b6d4" strokeWidth="4" fill="none" opacity="0.9" />
            {/* Blood smear across visor */}
            <path d="M78 62 L94 65" stroke="#ef4444" strokeWidth="2.5" />

            {/* Hoarded Crushed Diving Helmet Trophy #2 */}
            <circle cx="118" cy="76" r="15" fill="#14532d" stroke="#052e16" strokeWidth="2.5" />
            <path d="M108 76 Q118 66 128 76" stroke="#f43f5e" strokeWidth="3.5" fill="none" opacity="0.9" />
            <path d="M112 76 L124 78" stroke="#991b1b" strokeWidth="2" />

            {/* 14 Terrifying Predatory Spider Ocelli Eyes (Tracks Cursor) */}
            <g className={animated ? "animate-ocular-twitch-violent" : ""} transform={`translate(${eyeOffset.x * 0.75}, ${eyeOffset.y * 0.75})`}>
              {[
                { cx: 92, cy: 92, r: 4 }, { cx: 108, cy: 92, r: 4 },
                { cx: 84, cy: 100, r: 3.2 }, { cx: 100, cy: 101, r: 4.5 }, { cx: 116, cy: 100, r: 3.2 },
                { cx: 92, cy: 108, r: 2.8 }, { cx: 108, cy: 108, r: 2.8 },
                { cx: 100, cy: 112, r: 2.5 }
              ].map((eye, i) => (
                <g key={i}>
                  <ellipse cx={eye.cx} cy={eye.cy} rx={isPupilDilated ? eye.r * 1.25 : eye.r} ry={eye.r} fill="#facc15" stroke="#7f1d1d" strokeWidth="1" className="animate-pulse" />
                  <circle cx={eye.cx} cy={eye.cy} r={eye.r * 0.45} fill="#450a0a" />
                  <circle cx={eye.cx} cy={eye.cy} r={eye.r * 0.15} fill="#ffffff" />
                </g>
              ))}
            </g>

            {/* Serrated Surgical Bone-Saw Pedipalps Dripping Acidic Neurotoxin */}
            <path d="M90 110 L84 140 L74 156" stroke="#e2e8f0" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M110 110 L116 140 L126 156" stroke="#e2e8f0" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            {/* Dripping Neurotoxin Beads */}
            <circle cx="74" cy="158" r="2.5" fill="#22c55e" className="animate-ping" style={{ animationDuration: '1.8s' }} />
            <circle cx="126" cy="158" r="2.5" fill="#22c55e" className="animate-ping" style={{ animationDuration: '1.8s' }} />
          </g>
        );

      case 'null_stalker':
        return (
          <g className={animated ? "animate-glitch-flicker" : ""}>
            {/* Reality Tear Gravitational Distortion Shockwaves */}
            <path
              d="M100 8 L120 48 L84 86 L126 128 L82 168 L100 194"
              stroke="#581c87"
              strokeWidth="32"
              strokeLinecap="round"
              opacity="0.45"
              filter="blur(8px)"
            />
            <path
              d="M100 8 L120 48 L84 86 L126 128 L82 168 L100 194"
              stroke="#a855f7"
              strokeWidth="10"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* Faceless Void Silhouette Devouring Photons & Matter */}
            <path
              d="M68 48 C68 15, 132 15, 132 48 C140 95, 156 148, 162 188 L38 188 C44 148, 60 95, 68 48 Z"
              fill="#000000"
              stroke="#6b21a8"
              strokeWidth="4"
            />

            {/* Hollow Torso Gravitational Singularity / Event Horizon Accretion Disk */}
            <ellipse cx="100" cy="120" rx="30" ry="42" fill="#000000" stroke="#c084fc" strokeWidth="3" />
            <circle cx="100" cy="120" r="20" fill="#2e1065" className="animate-ping" style={{ animationDuration: '3s' }} />
            <circle cx="100" cy="120" r="10" fill="#ffffff" />
            <circle cx="100" cy="120" r="4" fill="#000000" />

            {/* Piercing Demonic Ultraviolet Event Horizon Eye Slits (Tracks Cursor) */}
            <g className={animated ? "animate-ocular-twitch-violent" : ""} transform={`translate(${eyeOffset.x * 0.9}, ${eyeOffset.y * 0.9})`}>
              <polygon points="74,44 94,52 74,60" fill="#f3e8ff" stroke="#a855f7" strokeWidth="1.5" />
              <polygon points="126,44 106,52 126,60" fill="#f3e8ff" stroke="#a855f7" strokeWidth="1.5" />
              {/* Central Piercing Demonic Slit Beam */}
              <line x1="64" y1="52" x2="136" y2="52" stroke="#e9d5ff" strokeWidth={isPupilDilated ? 3.5 : 2.2} />
              <circle cx="100" cy="52" r="3" fill="#ffffff" className="animate-ping" style={{ animationDuration: '1.5s' }} />
            </g>

            {/* Dimensional Shadow Fractures & Weeping Violet Tendrils */}
            <path d="M82 56 Q76 105 70 172" stroke="#d8b4fe" strokeWidth="2" strokeDasharray="5 3" fill="none" />
            <path d="M118 56 Q124 105 130 172" stroke="#d8b4fe" strokeWidth="2" strokeDasharray="5 3" fill="none" />
            <path d="M100 162 L100 196" stroke="#9333ea" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        );

      case 'cartographer':
        return (
          <g className={animated ? "animate-flesh-undulate" : ""}>
            {/* Non-Euclidean Octahedron / Hypercube Vault */}
            <polygon
              points="100,20 162,90 100,170 38,90"
              fill="url(#cartoGrad)"
              stroke="#06b6d4"
              strokeWidth="3"
            />
            {/* Intersecting Internal Dimensional Matrices */}
            <line x1="100" y1="20" x2="100" y2="170" stroke="#22d3ee" strokeWidth="2" strokeDasharray="6 3" />
            <line x1="38" y1="90" x2="162" y2="90" stroke="#22d3ee" strokeWidth="2" strokeDasharray="6 3" />
            <polygon points="100,45 138,90 100,140 62,90" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />

            {/* Shifting Labyrinth Floorplans Sliced by Red Lasers */}
            <rect x="74" y="66" width="52" height="52" fill="#020617" stroke="#ef4444" strokeWidth="2" />
            <path d="M74 80 L112 80 L112 105 L126 105" stroke="#ef4444" strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
            <path d="M88 66 L88 95 L100 95" stroke="#ef4444" strokeWidth="1.5" fill="none" strokeDasharray="3 2" />

            {/* Central Weeping Golden Sextant Eye */}
            <g className="animate-eye-twitch">
              <circle cx="100" cy="90" r="16" fill="#000000" stroke="#eab308" strokeWidth="2.5" />
              <circle cx="100" cy="90" r="7" fill="#ef4444" className="animate-pulse" />
              <circle cx="100" cy="90" r="3" fill="#ffffff" />
              <line x1="100" y1="74" x2="100" y2="106" stroke="#fde047" strokeWidth="1.5" />
            </g>

            {/* Liquid Ferro-Fluid Mercury Tentacles */}
            <path d="M55 145 Q42 175 36 195" stroke="#0891b2" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M82 165 Q76 182 72 198" stroke="#67e8f9" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M118 165 Q124 182 128 198" stroke="#67e8f9" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M145 145 Q158 175 164 195" stroke="#0891b2" strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'grief_signal':
        return (
          <g className={animated ? "animate-glitch-flicker" : ""}>
            {/* Cathode Ray Oscilloscope CRT Display Chamber */}
            <circle cx="100" cy="96" r="82" fill="#040810" stroke="#0369a1" strokeWidth="3.5" />
            <circle cx="100" cy="96" r="74" fill="#020408" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 4" />

            {/* Static Radar Oscilloscope Grid Crosshairs */}
            <line x1="26" y1="96" x2="174" y2="96" stroke="#075985" strokeWidth="1.2" strokeDasharray="3 3" />
            <line x1="100" y1="22" x2="100" y2="170" stroke="#075985" strokeWidth="1.2" strokeDasharray="3 3" />

            {/* Screaming Radio Carrier Audio Waveform Face */}
            <path
              d="M32 96 Q50 60 68 96 Q78 135 90 90 Q96 35 104 35 Q110 90 122 135 Q132 96 150 60 Q162 96 168 96"
              stroke="#38bdf8"
              strokeWidth="3.5"
              fill="none"
              className="animate-pulse"
            />

            {/* Drowned Diver Eye Sockets Weeping Radio Noise */}
            <circle cx="76" cy="74" r="16" fill="#010204" stroke="#0ea5e9" strokeWidth="2.5" />
            <ellipse cx="76" cy="74" rx="5" ry="9" fill="#f0f9ff" className="animate-pulse" />
            <circle cx="124" cy="74" r="16" fill="#010204" stroke="#0ea5e9" strokeWidth="2.5" />
            <ellipse cx="124" cy="74" rx="5" ry="9" fill="#f0f9ff" className="animate-pulse" />

            {/* Gaping Screaming Mouth Cavity Shaped Like a Transceiver Vacuum Tube */}
            <ellipse cx="100" cy="128" rx="22" ry="32" fill="#000000" stroke="#0284c7" strokeWidth="2.5" />
            <line x1="86" y1="126" x2="114" y2="126" stroke="#f43f5e" strokeWidth="2.5" />
            <line x1="88" y1="134" x2="112" y2="134" stroke="#f43f5e" strokeWidth="2" />
            <line x1="92" y1="142" x2="108" y2="142" stroke="#f43f5e" strokeWidth="1.8" />
          </g>
        );

      case 'city_mind':
        return (
          <g className={animated ? "animate-flesh-undulate" : ""}>
            {/* Cyclopean Sunken Gothic Basalt Spires Intertwined with Arteries */}
            <path
              d="M24 185 L24 105 L48 85 L48 50 L72 30 L94 52 L94 85 L106 85 L106 52 L128 30 L152 50 L152 85 L176 105 L176 185 Z"
              fill="url(#cityBasaltGrad)"
              stroke="#7f1d1d"
              strokeWidth="3.5"
            />
            {/* Pulsing Arteries & Vascular Highways on Spire Walls */}
            <path d="M48 90 Q65 110 72 185" stroke="#dc2626" strokeWidth="3" fill="none" />
            <path d="M152 90 Q135 110 128 185" stroke="#dc2626" strokeWidth="3" fill="none" />
            <path d="M100 45 L100 125" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="6 3" />

            {/* Windows Formed as Living Bloodshot Human Eyeballs */}
            {[
              { cx: 58, cy: 115 }, { cx: 80, cy: 115 }, { cx: 120, cy: 115 }, { cx: 142, cy: 115 },
              { cx: 70, cy: 75 }, { cx: 130, cy: 75 },
              { cx: 82, cy: 45 }, { cx: 118, cy: 45 }
            ].map((w, i) => (
              <g key={i} className="animate-eye-twitch">
                <ellipse cx={w.cx} cy={w.cy} rx="6.5" ry="4.5" fill="#450a0a" stroke="#ef4444" strokeWidth="1.5" />
                <circle cx={w.cx} cy={w.cy} r="2.2" fill="#ffffff" />
                <circle cx={w.cx} cy={w.cy} r="1" fill="#000000" />
              </g>
            ))}

            {/* Massive Sunken Leviathan Baleen Gate Maw */}
            <path
              d="M70 185 L70 135 C70 115, 130 115, 130 135 L130 185 Z"
              fill="#000000"
              stroke="#b91c1c"
              strokeWidth="3"
            />
            {/* Giant Serrated Gateway Baleen Teeth */}
            {[-22, -14, -6, 2, 10, 18].map((offset, i) => (
              <polygon
                key={i}
                points={`${100 + offset},130 ${100 + offset + 4},145 ${100 + offset + 8},130`}
                fill="#fecaca"
                stroke="#7f1d1d"
                strokeWidth="0.8"
              />
            ))}
          </g>
        );

      case 'the_scavenger':
        return (
          <g className={animated ? "animate-flesh-undulate" : ""}>
            {/* Dark Ventilation Ductwork & Rust Grate Background */}
            <rect x="25" y="25" width="150" height="150" fill="#040608" stroke="#334155" strokeWidth="2" strokeDasharray="6 4" rx="6" />
            <line x1="25" y1="75" x2="175" y2="75" stroke="#1e293b" strokeWidth="1.5" />
            <line x1="25" y1="125" x2="175" y2="125" stroke="#1e293b" strokeWidth="1.5" />

            {/* Hunched Chitinous Scavenger Carapace */}
            <path
              d="M50 145 C45 90, 80 50, 110 50 C140 50, 155 85, 145 130 C140 155, 120 170, 85 170 C60 170, 52 160, 50 145 Z"
              fill="#0f172a"
              stroke="#eab308"
              strokeWidth="2.5"
            />

            {/* Draped Severed Diver Harnesses & Stolen Utility Belts */}
            <path d="M56 85 Q95 110 142 90" stroke="#78350f" strokeWidth="4" fill="none" />
            <path d="M62 110 Q98 135 138 115" stroke="#451a03" strokeWidth="3.5" fill="none" />
            
            {/* Belt Pouches & D-Rings */}
            <rect x="74" y="98" width="12" height="16" rx="2" fill="#854d0e" stroke="#fef08a" strokeWidth="1" />
            <rect x="110" y="104" width="14" height="18" rx="2" fill="#713f12" stroke="#fef08a" strokeWidth="1" />
            <circle cx="94" cy="116" r="4" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />

            {/* Barbed Multi-Segmented Kleptomancer Arms Reaching Out */}
            {/* Left Arm clutching stolen Adrenaline Stim */}
            <path d="M70 70 L35 55 L22 80" stroke="#ca8a04" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Stolen Stim */}
            <g transform="translate(14, 75) rotate(25)">
              <rect x="0" y="0" width="6" height="18" rx="1.5" fill="#ef4444" stroke="#fff" strokeWidth="0.8" />
              <line x1="3" y1="18" x2="3" y2="24" stroke="#e2e8f0" strokeWidth="1" />
            </g>

            {/* Right Arm clutching Stolen Tactical Flashlight */}
            <path d="M125 70 L160 52 L178 72" stroke="#ca8a04" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Stolen Flashlight emitting beam */}
            <g transform="translate(162, 62) rotate(-35)">
              <rect x="0" y="0" width="8" height="18" rx="2" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
              <polygon points="4,0 -15,-40 25,-40" fill="#fef08a" opacity="0.35" />
            </g>

            {/* Lower Barbed Legs with Needle Hooks */}
            <path d="M60 160 L40 185 L28 178" stroke="#a16207" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M85 170 L80 195 L68 192" stroke="#a16207" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M115 168 L122 195 L135 190" stroke="#a16207" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M138 150 L165 178 L175 170" stroke="#a16207" strokeWidth="2.5" fill="none" strokeLinecap="round" />

            {/* Bioluminescent Internal Theft Furnace in Torso */}
            <ellipse cx="98" cy="138" rx="14" ry="10" fill="#064e3b" stroke="#10b981" strokeWidth="2" className="animate-pulse" />
            <ellipse cx="98" cy="138" rx="7" ry="5" fill="#6ee7b7" />

            {/* Three Twitching Yellow Lens Clusters */}
            <g className="animate-eye-twitch">
              <circle cx="92" cy="62" r="7" fill="#020617" stroke="#eab308" strokeWidth="2" />
              <circle cx="92" cy="62" r="4" fill="#facc15" className="animate-ping" style={{ animationDuration: '2s' }} />
              <circle cx="92" cy="62" r="2" fill="#ffffff" />

              <circle cx="108" cy="58" r="6" fill="#020617" stroke="#eab308" strokeWidth="2" />
              <circle cx="108" cy="58" r="3.5" fill="#facc15" />
              <circle cx="108" cy="58" r="1.5" fill="#ffffff" />

              <circle cx="118" cy="68" r="5" fill="#020617" stroke="#eab308" strokeWidth="1.8" />
              <circle cx="118" cy="68" r="2.5" fill="#facc15" />
            </g>

            {/* Serrated Chitinous Scissor Mandibles */}
            <path d="M96 74 L88 88 L98 84" stroke="#eab308" strokeWidth="1.8" fill="#1e293b" />
            <path d="M110 74 L118 88 L108 84" stroke="#eab308" strokeWidth="1.8" fill="#1e293b" />
          </g>
        );

      case 'the_pale_architect':
        return (
          <g className={animated ? "animate-flesh-undulate" : ""}>
            {/* Non-Euclidean Blueprint Coordinate Grid */}
            <circle cx="100" cy="100" r="90" fill="#020817" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.6" />
            <line x1="10" y1="100" x2="190" y2="100" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
            <line x1="100" y1="10" x2="100" y2="190" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />

            {/* Rotating Sacred Polyhedral Geometry Crown */}
            <g className={animated ? "animate-spin" : ""} style={{ transformOrigin: '100px 52px', animationDuration: '14s' }}>
              <polygon points="100,20 128,42 118,74 82,74 72,42" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
              <polygon points="100,28 120,44 112,66 88,66 80,44" fill="none" stroke="#f8fafc" strokeWidth="1.2" strokeDasharray="2 2" />
              <line x1="100" y1="20" x2="100" y2="74" stroke="#38bdf8" strokeWidth="1" />
              <line x1="72" y1="42" x2="128" y2="42" stroke="#38bdf8" strokeWidth="1" />
            </g>

            {/* Colossal Alabaster Architectural Torso & Mask */}
            <path
              d="M65 95 C60 70, 75 55, 100 55 C125 55, 140 70, 135 95 C132 120, 120 145, 100 152 C80 145, 68 120, 65 95 Z"
              fill="#f8fafc"
              stroke="#0284c7"
              strokeWidth="2.5"
            />
            {/* Alabaster Porcelain Shading Lines */}
            <path d="M78 85 Q100 100 122 85" stroke="#cbd5e1" strokeWidth="1.5" fill="none" />
            <path d="M84 110 Q100 125 116 110" stroke="#cbd5e1" strokeWidth="1.5" fill="none" />

            {/* Central Blinding Vertical Cobalt Eye Slit */}
            <g>
              <ellipse cx="100" cy="94" rx="8" ry="24" fill="#0369a1" stroke="#38bdf8" strokeWidth="2" />
              <ellipse cx="100" cy="94" rx="4" ry="18" fill="#e0f2fe" className="animate-pulse" />
              <line x1="100" y1="65" x2="100" y2="125" stroke="#ffffff" strokeWidth="2" />
              {/* Downward Projecting Holographic Architectural Cone */}
              <polygon points="100,105 50,195 150,195" fill="url(#cartoGrad)" opacity="0.45" />
            </g>

            {/* Broad Alabaster Shoulders Merging into Sunken Megastructure Foundations */}
            <path
              d="M30 185 L35 150 L65 140 L100 155 L135 140 L165 150 L170 185 Z"
              fill="#e2e8f0"
              stroke="#0369a1"
              strokeWidth="2"
            />

            {/* Floating Architectural Calipers & Drafting Instruments */}
            <g transform="translate(32, 95) rotate(-20)">
              <line x1="10" y1="0" x2="0" y2="35" stroke="#38bdf8" strokeWidth="2" />
              <line x1="10" y1="0" x2="20" y2="35" stroke="#38bdf8" strokeWidth="2" />
              <circle cx="10" cy="0" r="3.5" fill="#f8fafc" stroke="#0284c7" strokeWidth="1.5" />
              <path d="M3 24 Q10 28 17 24" stroke="#f59e0b" strokeWidth="1.2" fill="none" />
            </g>

            <g transform="translate(145, 95) rotate(20)">
              <circle cx="12" cy="18" r="14" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 2" />
              <line x1="12" y1="4" x2="12" y2="32" stroke="#f59e0b" strokeWidth="1.5" />
              <line x1="-2" y1="18" x2="26" y2="18" stroke="#f59e0b" strokeWidth="1.5" />
              <circle cx="12" cy="18" r="3" fill="#f8fafc" />
            </g>

            {/* Pure Mathematical Glyph Equations Inscribed on Base */}
            <text x="100" y="180" textAnchor="middle" fill="#0284c7" fontSize="8" fontFamily="monospace" letterSpacing="3">
              ∇ × E = -∂B/∂t // Ψ₀ = 0
            </text>
          </g>
        );

      case 'the_bone_weaver':
        return (
          <g className={animated ? "animate-flesh-undulate" : ""}>
            {/* Taut Monomolecular Bone-Silk Webbing */}
            <line x1="20" y1="20" x2="180" y2="180" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="5 3" opacity="0.7" />
            <line x1="180" y1="20" x2="20" y2="180" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="5 3" opacity="0.7" />
            <line x1="100" y1="10" x2="100" y2="190" stroke="#e2e8f0" strokeWidth="1.2" opacity="0.6" />
            <line x1="10" y1="100" x2="190" y2="100" stroke="#e2e8f0" strokeWidth="1.2" opacity="0.6" />
            <polygon points="100,45 155,100 100,155 45,100" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 2" />

            {/* Suspended Cracked Diving Helmet in Web */}
            <g transform="translate(138, 55)">
              <circle cx="12" cy="12" r="10" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
              <path d="M7 10 L15 15 L17 9" stroke="#ef4444" strokeWidth="1" fill="none" />
              <ellipse cx="12" cy="12" rx="6" ry="4" fill="#0f172a" />
            </g>

            {/* Central Calcified Spider Carapace */}
            <ellipse cx="100" cy="85" rx="22" ry="26" fill="#0f172a" stroke="#f8fafc" strokeWidth="2.5" />
            <ellipse cx="100" cy="122" rx="30" ry="38" fill="#020617" stroke="#cbd5e1" strokeWidth="2.8" />
            
            {/* Bone Spine Inscriptions on Abdomen */}
            <path d="M100 95 L100 150" stroke="#f1f5f9" strokeWidth="2" />
            {[105, 115, 125, 135, 145].map(y => (
              <line key={y} x1="88" y1={y} x2="112" y2={y} stroke="#f1f5f9" strokeWidth="1.8" />
            ))}

            {/* Eight Multi-Segmented Needle Legs */}
            <path d="M85 80 L35 45 L15 80 L8 120" stroke="#e2e8f0" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M115 80 L165 45 L185 80 L192 120" stroke="#e2e8f0" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M80 90 L30 85 L12 130 L5 165" stroke="#cbd5e1" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M120 90 L170 85 L188 130 L195 165" stroke="#cbd5e1" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M82 105 L38 120 L20 160 L15 190" stroke="#94a3b8" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M118 105 L162 120 L180 160 L185 190" stroke="#94a3b8" strokeWidth="2.2" fill="none" strokeLinecap="round" />

            {/* Cluster of Glowing Ultraviolet Optical Needles */}
            <circle cx="94" cy="74" r="2.5" fill="#a855f7" className="animate-ping" style={{ animationDuration: '2s' }} />
            <circle cx="106" cy="74" r="2.5" fill="#a855f7" className="animate-ping" style={{ animationDuration: '2s' }} />
            <circle cx="90" cy="82" r="2" fill="#c084fc" />
            <circle cx="110" cy="82" r="2" fill="#c084fc" />
            <circle cx="97" cy="88" r="2" fill="#e9d5ff" />
            <circle cx="103" cy="88" r="2" fill="#e9d5ff" />
          </g>
        );

      case 'the_siren_matrix':
        return (
          <g className={animated ? "animate-flesh-undulate" : ""}>
            {/* Bioluminescent Neural Ring & Siphonophore Corona */}
            <circle cx="100" cy="100" r="88" fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="6 4" opacity="0.5" className={animated ? "animate-spin" : ""} style={{ animationDuration: '25s' }} />
            <circle cx="100" cy="100" r="74" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 5" opacity="0.6" />

            {/* Trailing Translucent Siphonophore Tentacles */}
            {[45, 60, 75, 90, 105, 120, 135, 150].map((x, idx) => (
              <path
                key={idx}
                d={`M${x} 120 Q${x + (idx % 2 === 0 ? 15 : -15)} 155 ${x} 195`}
                stroke="#38bdf8"
                strokeWidth="1.5"
                fill="none"
                opacity="0.6"
                strokeDasharray="4 2"
              />
            ))}

            {/* Volumetric Hologram Diver Silhouette with Chromatic Tear */}
            <g className="filter drop-shadow-[0_0_12px_#38bdf8]">
              {/* Diver Helmet */}
              <circle cx="100" cy="65" r="18" fill="#082f49" stroke="#38bdf8" strokeWidth="2.5" />
              <ellipse cx="100" cy="65" rx="12" ry="8" fill="#e0f2fe" opacity="0.85" className="animate-pulse" />

              {/* Diver Torso with Chest Scuba Rig */}
              <path d="M78 85 L74 135 L126 135 L122 85 Z" fill="#0c4a6e" stroke="#0ea5e9" strokeWidth="2" />
              <rect x="88" y="94" width="24" height="28" rx="3" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" />

              {/* Raised Arm Waving Emergency Flare */}
              <path d="M122 92 L145 70 L158 52" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" fill="none" />
              {/* Magnesium Flare Bloom */}
              <circle cx="158" cy="52" r="8" fill="#fbbf24" className="animate-ping" style={{ animationDuration: '1.2s' }} />
              <circle cx="158" cy="52" r="4" fill="#ffffff" />
            </g>

            {/* Hidden Predatory Siphonophore Maw Revealed Behind Hologram */}
            <g opacity="0.75" className="animate-pulse" style={{ animationDuration: '1.8s' }}>
              <circle cx="100" cy="100" r="28" fill="#020617" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 3" />
              <circle cx="100" cy="100" r="14" fill="#450a0a" stroke="#dc2626" strokeWidth="1.5" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                <line key={deg} x1="100" y1="88" x2="100" y2="76" stroke="#f87171" strokeWidth="1.5" transform={`rotate(${deg} 100 100)`} />
              ))}
            </g>
          </g>
        );

      case 'chrono_leviathan':
        return (
          <g className={animated ? "animate-flesh-undulate" : ""}>
            {/* Concentric Temporal Shockwave Rings */}
            <ellipse cx="100" cy="100" rx="90" ry="75" fill="none" stroke="#0284c7" strokeWidth="1.2" strokeDasharray="6 4" opacity="0.4" className={animated ? "animate-spin" : ""} style={{ animationDuration: '35s' }} />
            <ellipse cx="100" cy="100" rx="72" ry="58" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />

            {/* Massive Leviathan Whale Body */}
            <path
              d="M15 100 C20 40, 120 45, 175 80 C190 92, 195 108, 175 120 C120 155, 20 160, 15 100 Z"
              fill="#031122"
              stroke="#0ea5e9"
              strokeWidth="2.8"
            />

            {/* Ventral Grooves & Chrono-Crystalline Plating */}
            <path d="M45 105 Q110 135 160 115" stroke="#38bdf8" strokeWidth="2" fill="none" />
            <path d="M55 115 Q115 145 155 125" stroke="#0284c7" strokeWidth="1.5" fill="none" />

            {/* Clockwork Vertebral Arch Ribs */}
            {[50, 75, 100, 125, 150].map((x, idx) => (
              <g key={idx}>
                <line x1={x} y1="65" x2={x} y2="135" stroke="#7dd3fc" strokeWidth="1.8" opacity="0.75" />
                <circle cx={x} cy="100" r="3.5" fill="#f8fafc" stroke="#0284c7" strokeWidth="1" />
              </g>
            ))}

            {/* Colossal Caudal Tail Fin Flukes */}
            <path d="M22 100 L5 65 Q18 95 10 100 Q18 105 5 135 Z" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />

            {/* Pectoral Side Fin */}
            <path d="M90 120 L70 165 L105 145 Z" fill="#0369a1" stroke="#38bdf8" strokeWidth="2" />

            {/* Sub-Audible Infrasonic Sonic Bloom from Mouth */}
            <g transform="translate(170, 95)">
              <ellipse cx="10" cy="5" rx="14" ry="8" fill="#000000" stroke="#f59e0b" strokeWidth="2" />
              <path d="M15 -5 Q28 5 15 15" stroke="#f59e0b" strokeWidth="2" fill="none" className="animate-ping" style={{ animationDuration: '2.5s' }} />
            </g>

            {/* Temporal Reversed Counter Digits in Belly */}
            <text x="100" y="104" textAnchor="middle" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold">
              -12Hz // RECURSION
            </text>
          </g>
        );

      case 'the_liturgist':
        return (
          <g className={animated ? "animate-flesh-undulate" : ""}>
            {/* Cathedral gothic arch backdrop */}
            <path d="M40 185 L40 90 Q100 20 160 90 L160 185 Z" fill="#080309" stroke="#581c87" strokeWidth="2" opacity="0.6" />
            <path d="M60 185 L60 110 Q100 50 140 110 L140 185 Z" fill="#120417" stroke="#7e22ce" strokeWidth="1.5" opacity="0.8" />
            {/* Organ bone pipes behind spinal column */}
            {[-35, -25, -15, -5, 5, 15, 25, 35].map((off, idx) => (
              <rect
                key={idx}
                x={98 + off}
                y={30 + Math.abs(off) * 1.5}
                width="4"
                height={120 - Math.abs(off) * 1.5}
                fill="#f3e8ff"
                stroke="#6b21a8"
                strokeWidth="1"
                opacity="0.85"
              />
            ))}
            {/* Skeletal Liturgical Robe & Mitre */}
            <path d="M75 70 L100 25 L125 70 L135 185 L65 185 Z" fill="#1f0729" stroke="#a855f7" strokeWidth="2" />
            {/* Golden Infrasonic Halos */}
            <circle cx="100" cy="50" r="32" fill="none" stroke="#eab308" strokeWidth="1.5" strokeDasharray="4 3" className="animate-spin" style={{ animationDuration: '14s' }} />
            <circle cx="100" cy="50" r="24" fill="none" stroke="#fbbf24" strokeWidth="1" />
            {/* Glowing Weeping Eye Sockets */}
            <ellipse cx="92" cy="52" rx="3.5" ry="5" fill="#facc15" className="animate-pulse" />
            <ellipse cx="108" cy="52" rx="3.5" ry="5" fill="#facc15" className="animate-pulse" />
            {/* Golden Tears streaming down robe */}
            <line x1="92" y1="58" x2="88" y2="120" stroke="#eab308" strokeWidth="1.5" strokeDasharray="3 2" />
            <line x1="108" y1="58" x2="112" y2="120" stroke="#eab308" strokeWidth="1.5" strokeDasharray="3 2" />
            {/* Skeletal Hands raised in benediction */}
            <path d="M65 110 L50 85 L42 95 M135 110 L150 85 L158 95" stroke="#f3e8ff" strokeWidth="2" fill="none" />
          </g>
        );

      case 'ghost_sub':
        return (
          <g className={animated ? "animate-pulse" : ""}>
            {/* Sunken Rusted Submarine Hull silhouette */}
            <ellipse cx="100" cy="115" rx="75" ry="24" fill="#0d1117" stroke="#1f2937" strokeWidth="2.5" />
            <path d="M25 115 L10 110 L10 120 Z" fill="#374151" stroke="#4b5563" strokeWidth="1.5" />
            {/* Conning tower */}
            <rect x="80" y="70" width="36" height="28" rx="4" fill="#111827" stroke="#374151" strokeWidth="2" />
            {/* Snorkel and periscope mast */}
            <line x1="94" y1="70" x2="94" y2="40" stroke="#4b5563" strokeWidth="2.5" />
            <line x1="102" y1="70" x2="102" y2="48" stroke="#4b5563" strokeWidth="2" />
            {/* Glowing Spectral Periscope Optic Eye */}
            <circle cx="94" cy="40" r="4.5" fill="#06b6d4" className="animate-ping" style={{ animationDuration: '2s' }} />
            <circle cx="94" cy="40" r="2.5" fill="#ffffff" />
            {/* Ghostly Skeletal Crew Silhouettes behind viewport slits */}
            <line x1="86" y1="82" x2="110" y2="82" stroke="#22d3ee" strokeWidth="1.5" opacity="0.8" />
            {/* Rotating ghost brass propeller */}
            <g className={animated ? "animate-spin" : ""} style={{ transformOrigin: '10px 115px', animationDuration: '1.2s' }}>
              <line x1="10" y1="105" x2="10" y2="125" stroke="#0ea5e9" strokeWidth="2.5" />
              <line x1="2" y1="115" x2="18" y2="115" stroke="#0ea5e9" strokeWidth="2.5" />
            </g>
            {/* Active Sonar Ping Wave Echoes */}
            <circle cx="100" cy="115" r="50" fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 4" opacity="0.4" className="animate-ping" style={{ animationDuration: '3s' }} />
            <circle cx="100" cy="115" r="75" fill="none" stroke="#0284c7" strokeWidth="1" opacity="0.25" />
          </g>
        );

      case 'calcified_husk':
        return (
          <g className={animated ? "animate-horror-jitter" : ""}>
            {/* Massive Hydrothermal Basalt Stone Body */}
            <path
              d="M50 180 L40 120 L60 70 L95 50 L125 50 L155 75 L165 125 L155 180 Z"
              fill="#181313"
              stroke="#7f1d1d"
              strokeWidth="3"
            />
            {/* Fused saturation diver helmets into chest */}
            <circle cx="85" cy="95" r="14" fill="#0c0a09" stroke="#b45309" strokeWidth="2" />
            <ellipse cx="85" cy="95" rx="9" ry="6" fill="#1c1917" stroke="#fbbf24" strokeWidth="1" />
            <line x1="80" y1="95" x2="90" y2="95" stroke="#ef4444" strokeWidth="1.5" />
            <circle cx="120" cy="110" r="12" fill="#0c0a09" stroke="#78716c" strokeWidth="2" />
            <ellipse cx="120" cy="110" rx="8" ry="5" fill="#1c1917" stroke="#94a3b8" strokeWidth="1" />
            {/* Glowing Volcanic Magma Seams */}
            <path d="M60 75 Q85 110 95 150 Q110 160 140 170" stroke="#f97316" strokeWidth="2" fill="none" className="animate-pulse" />
            <path d="M145 80 Q120 100 115 135" stroke="#ef4444" strokeWidth="1.5" fill="none" />
            {/* Steam vent fissures */}
            <line x1="70" y1="55" x2="60" y2="30" stroke="#fed7aa" strokeWidth="2" strokeDasharray="3 2" opacity="0.7" />
            <line x1="130" y1="55" x2="140" y2="30" stroke="#fed7aa" strokeWidth="2" strokeDasharray="3 2" opacity="0.7" />
            {/* Heavy crush fists */}
            <rect x="25" y="140" width="22" height="35" rx="4" fill="#292524" stroke="#dc2626" strokeWidth="2" />
            <rect x="155" y="140" width="22" height="35" rx="4" fill="#292524" stroke="#dc2626" strokeWidth="2" />
          </g>
        );

      case 'memory_leech':
        return (
          <g className={animated ? "animate-flesh-undulate" : ""}>
            {/* Translucent glowing serpentine nematode */}
            <path
              d="M30 140 Q60 50 100 100 T170 80"
              fill="none"
              stroke="#a855f7"
              strokeWidth="18"
              strokeLinecap="round"
              opacity="0.35"
            />
            <path
              d="M30 140 Q60 50 100 100 T170 80"
              fill="none"
              stroke="#c084fc"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Neural nodes pulsing with stolen memories */}
            {[
              { cx: 50, cy: 95 },
              { cx: 80, cy: 75 },
              { cx: 105, cy: 102 },
              { cx: 135, cy: 92 },
              { cx: 165, cy: 80 }
            ].map((node, i) => (
              <circle
                key={i}
                cx={node.cx}
                cy={node.cy}
                r="4.5"
                fill="#ffffff"
                className="animate-ping"
                style={{ animationDuration: `${1.2 + i * 0.3}s` }}
              />
            ))}
            {/* Radial Suction Maw with rows of chitin fangs */}
            <circle cx="28" cy="142" r="14" fill="#3b0764" stroke="#d8b4fe" strokeWidth="2" />
            <circle cx="28" cy="142" r="8" fill="#000000" />
            {[0, 60, 120, 180, 240, 300].map(deg => (
              <line
                key={deg}
                x1="28"
                y1="134"
                x2="28"
                y2="138"
                stroke="#f3e8ff"
                strokeWidth="1.5"
                transform={`rotate(${deg} 28 142)`}
              />
            ))}
          </g>
        );

      case 'nyx_swarm':
        return (
          <g className={animated ? "animate-pulse" : ""}>
            {/* Bioluminescent Micro-Siphonophore Cloud Vortex */}
            <circle cx="100" cy="100" r="75" fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 5" className="animate-spin" style={{ animationDuration: '8s' }} />
            <circle cx="100" cy="100" r="55" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 6" className="animate-spin" style={{ animationDuration: '5s', animationDirection: 'reverse' }} />
            {/* Swarm particles */}
            {[
              { cx: 70, cy: 60, r: 3 }, { cx: 130, cy: 70, r: 3.5 },
              { cx: 60, cy: 120, r: 2.5 }, { cx: 140, cy: 125, r: 3 },
              { cx: 90, cy: 45, r: 4 }, { cx: 110, cy: 155, r: 3.5 },
              { cx: 100, cy: 90, r: 5 }, { cx: 80, cy: 135, r: 3 },
              { cx: 120, cy: 65, r: 4 }, { cx: 155, cy: 95, r: 2.5 },
              { cx: 45, cy: 90, r: 3 }
            ].map((p, i) => (
              <g key={i}>
                <circle cx={p.cx} cy={p.cy} r={p.r * 1.8} fill="#22d3ee" opacity="0.3" className="animate-ping" style={{ animationDuration: `${1.5 + (i % 3) * 0.5}s` }} />
                <circle cx={p.cx} cy={p.cy} r={p.r} fill="#ffffff" />
              </g>
            ))}
            {/* Skeletal hand engulfed in bioluminescent embers */}
            <path d="M85 140 L95 90 L105 85 L115 90 L120 140 Z" fill="#030712" stroke="#06b6d4" strokeWidth="1.5" opacity="0.8" />
          </g>
        );

      case 'void_sundial':
        return (
          <g className={animated ? "animate-flesh-undulate" : ""}>
            {/* Hadal Seafloor Monolith Base */}
            <ellipse cx="100" cy="165" rx="70" ry="20" fill="#030712" stroke="#1f2937" strokeWidth="2.5" />
            {/* Non-Euclidean Inverted Light Shadow */}
            <polygon points="100,165 40,150 70,175" fill="#38bdf8" opacity="0.35" className="animate-pulse" />
            {/* Massive Black Obsidian Gnomon Obelisk */}
            <polygon points="92,165 108,165 103,30 97,30" fill="#000000" stroke="#38bdf8" strokeWidth="2" />
            <line x1="100" y1="35" x2="100" y2="160" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="4 3" />
            {/* Orbiting Chronometric Brass Dial Rings */}
            <g className={animated ? "animate-spin" : ""} style={{ transformOrigin: '100px 95px', animationDuration: '18s' }}>
              <ellipse cx="100" cy="95" rx="55" ry="22" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 4" />
              <circle cx="155" cy="95" r="4" fill="#fbbf24" />
            </g>
            <g className={animated ? "animate-spin" : ""} style={{ transformOrigin: '100px 95px', animationDuration: '10s', animationDirection: 'reverse' }}>
              <ellipse cx="100" cy="95" rx="38" ry="14" fill="none" stroke="#d97706" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="62" cy="95" r="3" fill="#fde047" />
            </g>
            {/* Roman Hour Runes glowing in sea floor */}
            {[0, 45, 90, 135, 180].map((deg, i) => (
              <circle key={i} cx={50 + i * 25} cy={165 + (i % 2 === 0 ? 3 : -3)} r="2" fill="#38bdf8" />
            ))}
          </g>
        );

      case 'the_abyss':
      default:
        return (
          <g className={animated ? "animate-flesh-undulate" : ""}>
            {/* Primordial Singularity Event Horizon Accretion Disk */}
            <circle cx="100" cy="100" r="86" fill="#010003" stroke="#4c0519" strokeWidth="4" />
            <circle cx="100" cy="100" r="70" fill="#08000f" stroke="#881337" strokeWidth="2.5" strokeDasharray="8 6" className={animated ? "animate-spin" : ""} style={{ animationDuration: '20s' }} />
            <circle cx="100" cy="100" r="48" fill="#000000" stroke="#be123c" strokeWidth="3" />

            {/* Outer Ring of Colossal Ancient Titan Eyes Staring in Darkness */}
            <g className="animate-eye-twitch" transform={`translate(${eyeOffset.x * 0.6}, ${eyeOffset.y * 0.6})`}>
              {[
                { cx: 45, cy: 55, r: 6 }, { cx: 155, cy: 55, r: 6 },
                { cx: 38, cy: 125, r: 5 }, { cx: 162, cy: 125, r: 5 },
                { cx: 72, cy: 32, r: 7 }, { cx: 128, cy: 32, r: 7 },
                { cx: 75, cy: 168, r: 6 }, { cx: 125, cy: 168, r: 6 },
                { cx: 100, cy: 22, r: 8 }, { cx: 100, cy: 178, r: 7 }
              ].map((eye, i) => (
                <g key={i}>
                  <circle cx={eye.cx} cy={eye.cy} r={isPupilDilated ? eye.r * 1.3 : eye.r} fill="#ff0044" className="animate-pulse" />
                  <circle cx={eye.cx} cy={eye.cy} r={eye.r * 0.45} fill="#ffffff" />
                  <circle cx={eye.cx} cy={eye.cy} r={eye.r * 0.2} fill="#000000" />
                </g>
              ))}
            </g>

            {/* Swirling Abyssal Void Maw Singularity */}
            <circle cx="100" cy="100" r="28" fill="#000000" />
            <circle cx="100" cy="100" r="10" fill="#ffffff" opacity="0.95" className="animate-ping" style={{ animationDuration: '2.5s' }} />
            <circle cx="100" cy="100" r="4" fill="#000000" />
          </g>
        );
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleEntityClick}
      className={`relative ${containerSize} bg-[#040206] rounded-lg border-2 ${
        isAgitated ? 'border-red-500 shadow-[0_0_40px_rgba(255,0,0,0.8)]' : 'border-red-900/70 shadow-2xl'
      } overflow-hidden flex items-center justify-center select-none group transition-all duration-300 ${
        interactive ? 'cursor-crosshair' : ''
      }`}
    >
      {/* Deep Sea Vignette & Caustic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-transparent to-black/95 pointer-events-none z-10" />

      {/* Bioluminescent Deep-Sea Silt & Particle Haze */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-30 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Dynamic Cursor-Tracking Targeting Reticle */}
      <div
        className="absolute pointer-events-none z-20 transition-transform duration-75 text-cyan-400/40"
        style={{
          transform: `translate(${eyeOffset.x * 2.5}px, ${eyeOffset.y * 2.5}px)`
        }}
      >
        <div className="w-16 h-16 border border-dashed border-red-500/50 rounded-full flex items-center justify-center animate-spin" style={{ animationDuration: '14s' }}>
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
        </div>
      </div>

      {/* SVG Gradient & Texture Definitions */}
      <svg className="absolute w-0 h-0">
        <defs>
          <linearGradient id="listenerBoneGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a0a14" />
            <stop offset="50%" stopColor="#0d040a" />
            <stop offset="100%" stopColor="#250812" />
          </linearGradient>

          <linearGradient id="wardenSteelGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1f1a20" />
            <stop offset="50%" stopColor="#0e0b10" />
            <stop offset="100%" stopColor="#2a1215" />
          </linearGradient>

          <linearGradient id="mimicHullGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#242131" />
            <stop offset="70%" stopColor="#120e18" />
            <stop offset="100%" stopColor="#3b0a13" />
          </linearGradient>

          <linearGradient id="cartoGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#081426" />
            <stop offset="50%" stopColor="#020813" />
            <stop offset="100%" stopColor="#0a2a38" />
          </linearGradient>

          <linearGradient id="cityBasaltGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#15101a" />
            <stop offset="60%" stopColor="#0a050d" />
            <stop offset="100%" stopColor="#2b0811" />
          </linearGradient>
        </defs>
      </svg>

      {/* Sweeping High-Tech Holographic LIDAR Laser Line */}
      {animated && (
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-75 pointer-events-none z-20 animate-lidar-sweep shadow-[0_0_15px_#22d3ee]" />
      )}

      {/* Main Horror Vector Canvas */}
      <svg
        viewBox="0 0 200 200"
        className={`w-full h-full ${getFilterClass()} transition-all duration-500 z-10 ${
          isAgitated ? 'animate-horror-jitter' : ''
        }`}
      >
        {renderDetailedArtwork()}
      </svg>

      {/* High-Tech Biometric Telemetry HUD Overlays */}
      <div className="absolute top-2 left-2 z-20 flex flex-col gap-0.5 pointer-events-none">
        <span className="text-[9px] font-mono font-black text-red-500 tracking-wider flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          BIO-SIGNATURE: {entity.name}
        </span>
        <span className="text-[8px] font-mono text-[#7885aa]">
          RESONANCE: {entity.frequencyHz}Hz // DEPTH: {entity.depthOrigin.split(' ')[0]}
        </span>
      </div>

      <div className="absolute top-2 right-2 z-20 flex items-center gap-1 pointer-events-none">
        <span className="bg-black/80 border border-red-900/90 text-red-400 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider shadow">
          {scanMode.toUpperCase()} SENSOR
        </span>
      </div>

      {/* Corner Tactical Reticle Brackets */}
      <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-red-500/70 pointer-events-none z-20" />
      <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-red-500/70 pointer-events-none z-20" />
      <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-red-500/70 pointer-events-none z-20" />
      <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-red-500/70 pointer-events-none z-20" />

      {/* Bottom Live Waveform EKG & Agitation Meter */}
      <div className="absolute bottom-2 inset-x-2 z-20 flex flex-col gap-1 pointer-events-none text-[9px] font-mono border-t border-red-950/80 pt-1 px-1 bg-black/75 backdrop-blur-sm rounded">
        {/* Animated Oscilloscope Sine Wave */}
        <div className="w-full h-3 overflow-hidden flex items-center">
          <svg className="w-full h-full" viewBox="0 0 100 12" preserveAspectRatio="none">
            <path
              d={`M0 6 Q15 ${isAgitated ? 0 : 3}, 25 6 T50 6 T75 6 T100 6`}
              fill="none"
              stroke={isAgitated ? "#ef4444" : "#10b981"}
              strokeWidth="1.2"
              className={animated ? "animate-pulse" : ""}
            />
          </svg>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400">♥</span>
            <span className={`font-bold ${isAgitated ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
              {isAgitated ? '248 BPM [AGITATED]' : `${68 + (pulsePhase % 15)} BPM [STALKING]`}
            </span>
          </div>
          <span className="text-red-400/80 font-bold uppercase tracking-wider">
            {isAgitated ? '⚠️ HARMONIC SPIKE' : `${entity.frequencyHz}Hz RESONATING`}
          </span>
        </div>
      </div>

      {/* Scanline CRT Grain Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_3px] pointer-events-none z-20 opacity-45" />
    </div>
  );
};
