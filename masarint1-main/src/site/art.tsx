import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Language, ServiceKind } from './data';

const GOLD = '#d2a337';
const GOLD_SOFT = '#e7c76a';
const SILVER = '#c7d0d6';

const vars = (values: Record<string, string>) => values as unknown as CSSProperties;

/* ---------- shared gradients / filters (rendered once, referenced everywhere) ---------- */
export function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#050f21" /><stop offset="1" stopColor="#16305a" /></linearGradient>
        <linearGradient id="g-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a4170" /><stop offset="1" stopColor="#081730" /></linearGradient>
        <linearGradient id="g-beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffe9a8" stopOpacity=".5" /><stop offset="1" stopColor="#ffe9a8" stopOpacity="0" /></linearGradient>
        <linearGradient id="g-trail" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffffff" stopOpacity="0" /><stop offset="1" stopColor="#ffffff" stopOpacity=".6" /></linearGradient>
        <linearGradient id="g-scan" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={GOLD} stopOpacity="0" /><stop offset=".5" stopColor={GOLD_SOFT} stopOpacity=".85" /><stop offset="1" stopColor={GOLD} stopOpacity="0" /></linearGradient>
        <filter id="f-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3.5" /></filter>
        <filter id="f-glow-lg" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" /></filter>
        <pattern id="p-dots" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill={SILVER} fillOpacity=".28" /></pattern>
      </defs>
    </svg>
  );
}

/* ---------- sprites ---------- */
const BOX_COLORS = [GOLD, SILVER, GOLD_SOFT, '#7f93ad', '#f2f4f6', '#a77d1c'];

function Box({ x, y, color, className }: { x: number; y: number; color: string; className?: string }) {
  return (
    <g className={className} transform={`translate(${x} ${y})`}>
      <rect width="56" height="26" fill={color} stroke="#0a1a33" strokeOpacity=".35" />
      <path d="M7 2V24M14 2V24M21 2V24M28 2V24M35 2V24M42 2V24M49 2V24" stroke="#0a1a33" strokeOpacity=".16" strokeWidth="1.4" />
    </g>
  );
}

export function Plane() {
  return (
    <g>
      <rect x="-140" y="17" width="140" height="2" fill="url(#g-trail)" />
      <path d="M46 15 L30 2 L41 2 L63 15 Z" fill="#8d99a4" />
      <path d="M6 13 L0 0 L12 0 L22 13 Z" fill={GOLD} />
      <path d="M6 19 L0 25 L10 25 L19 19 Z" fill="#aeb8bf" />
      <path d="M2 18 Q2 12 14 12 L70 12 Q88 13 92 18 Q88 23 70 24 L14 24 Q2 24 2 18 Z" fill="#f2f4f6" />
      <rect x="14" y="19.5" width="60" height="2" fill={GOLD} />
      <path d="M20 17.5h.1M26 17.5h.1M32 17.5h.1M38 17.5h.1M44 17.5h.1M50 17.5h.1M56 17.5h.1M62 17.5h.1" stroke="#7f93ad" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M44 20 L24 40 L38 40 L67 21 Z" fill={SILVER} />
      <rect x="40" y="29" width="15" height="6" rx="3" fill="#8d99a4" />
    </g>
  );
}

export function Ship({ targetClass }: { targetClass?: string }) {
  const cols = [66, 122, 178, 234];
  return (
    <g>
      <path d="M0 60 H262 L300 60 L276 94 H36 Q10 90 0 60 Z" fill="#1f3a68" />
      <path d="M7 78 H283 L276 94 H36 Q13 90 7 78 Z" fill="#0f2240" />
      <rect x="3" y="68" width="290" height="3" fill={GOLD} />
      {cols.map((x, i) => <Box key={`b${x}`} x={x} y={34} color={BOX_COLORS[(i * 2) % BOX_COLORS.length]} />)}
      {cols.map((x, i) => <Box key={`t${x}`} x={x} y={8} color={BOX_COLORS[(i * 2 + 3) % BOX_COLORS.length]} className={i === 3 ? targetClass : undefined} />)}
      <rect x="8" y="14" width="46" height="46" fill="#e9edf0" />
      <rect x="14" y="20" width="34" height="5" fill="#16305a" />
      <rect x="14" y="32" width="34" height="4" fill="#16305a" fillOpacity=".7" />
      <rect x="14" y="42" width="34" height="4" fill="#16305a" fillOpacity=".5" />
      <rect x="22" y="0" width="15" height="14" fill={GOLD} />
      <rect x="22" y="0" width="15" height="4" fill="#0f2240" />
    </g>
  );
}

function Wheel({ cx }: { cx: number }) {
  return (
    <g transform={`translate(${cx} 44)`}>
      <circle r="7" fill="#0a1a33" stroke={SILVER} strokeWidth="1.4" />
      <g className="wheel-spin"><path d="M-4.5 0H4.5M0 -4.5V4.5" stroke={SILVER} strokeWidth="1.3" /></g>
    </g>
  );
}

export function Truck({ boxClass, beam = true }: { boxClass?: string; beam?: boolean }) {
  return (
    <g>
      {beam ? <path d="M135 30 L215 20 L215 48 L135 37 Z" fill="url(#g-beam)" /> : null}
      <rect x="0" y="36" width="97" height="6" fill="#2b3f5e" />
      <Box x={18} y={10} color={GOLD} className={boxClass} />
      <path d="M98 42 V16 Q98 12 102 12 H120 Q124 12 127 18 L134 30 V42 Z" fill={SILVER} />
      <path d="M104 16 H119 L125 27 H104 Z" fill="#16305a" />
      <rect x="98" y="35" width="36" height="3" fill={GOLD} />
      <rect x="130" y="40" width="6" height="4" fill="#0f2240" />
      <circle cx="133" cy="32" r="2.2" fill="#ffe9a8" />
      <Wheel cx={14} /><Wheel cx={32} /><Wheel cx={108} /><Wheel cx={124} />
    </g>
  );
}

/* ---------- intro scene (≈4 seconds) ---------- */
const STARS: [number, number, number][] = [[60, 40, 0], [150, 90, .6], [260, 36, 1.1], [340, 120, .3], [430, 60, 1.6], [520, 30, .9], [610, 100, 1.9], [700, 48, .4], [790, 84, 1.3], [880, 30, .7], [915, 130, 1.7], [95, 150, 1.0], [560, 150, .2], [815, 150, 1.5]];

function WaveLayer({ y, className, opacity }: { y: number; className: string; opacity: number }) {
  const seg = 'q20 -7 40 0 t40 0 '.repeat(14);
  return (
    <g className={className}>
      <path d={`M-80 ${y} ${seg}`} fill="none" stroke="#7fa6d6" strokeOpacity={opacity} strokeWidth="2" />
    </g>
  );
}

export function IntroScene({ lang }: { lang: Language }) {
  const registered = lang === 'en' ? 'REGISTERED' : 'تم التسجيل';
  return (
    <svg className="intro-scene" viewBox="0 0 960 540" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <clipPath id="i-clip"><rect x="0" y="178" width="960" height="362" /></clipPath>
      </defs>
      <rect width="960" height="540" fill="url(#g-sky)" />
      {STARS.map(([x, y, d]) => <circle key={`${x}-${y}`} className="i-star" cx={x} cy={y} r="1.5" fill="#f6f4ed" style={{ animationDelay: `${d}s` }} />)}
      <circle cx="150" cy="116" r="34" fill="#f6f4ed" fillOpacity=".92" />
      <circle cx="150" cy="116" r="60" fill="#f6f4ed" fillOpacity=".08" />
      <g transform="translate(0 92) scale(.7)"><g className="i-plane"><Plane /></g></g>

      {/* port skyline */}
      <g fill="#10284a">
        <rect x="652" y="262" width="92" height="60" /><rect x="760" y="282" width="76" height="40" /><rect x="852" y="252" width="108" height="70" />
      </g>
      <g fill={GOLD} fillOpacity=".7">
        <rect x="662" y="274" width="6" height="5" /><rect x="678" y="274" width="6" height="5" /><rect x="694" y="290" width="6" height="5" /><rect x="868" y="268" width="6" height="5" /><rect x="890" y="268" width="6" height="5" /><rect x="912" y="284" width="6" height="5" /><rect x="934" y="268" width="6" height="5" />
      </g>

      {/* sea */}
      <rect x="0" y="346" width="960" height="194" fill="url(#g-sea)" />
      <WaveLayer y={362} className="i-wave-a" opacity={0.45} />
      <WaveLayer y={392} className="i-wave-b" opacity={0.3} />
      <WaveLayer y={428} className="i-wave-a" opacity={0.2} />

      {/* ship */}
      <g transform="translate(276 262)">
        <g className="i-ship">
          <g className="i-bob">
            <Ship targetClass="i-target" />
            <path d="M0 84 H300" stroke="#ffffff" strokeOpacity=".55" strokeWidth="2" strokeDasharray="10 8" className="i-foam" />
          </g>
        </g>
      </g>
      <rect x="0" y="346" width="600" height="46" fill="url(#g-sea)" fillOpacity=".78" />

      {/* quay */}
      <rect x="600" y="322" width="360" height="218" fill="#152c52" />
      <rect x="600" y="322" width="360" height="9" fill="#2a4a7a" />
      <rect x="600" y="322" width="360" height="2" fill={SILVER} fillOpacity=".7" />
      <g fill="#0f2240"><rect x="606" y="336" width="8" height="40" /><rect x="640" y="336" width="8" height="40" /><rect x="674" y="336" width="8" height="40" /></g>
      <circle cx="616" cy="318" r="4" fill={GOLD} />

      {/* crane */}
      <g stroke={SILVER} strokeWidth="3" fill="none">
        <path d="M626 322 V176 M642 322 V176 M884 322 V176 M900 322 V176" />
        <path d="M626 322 L642 280 L626 238 L642 196 M642 322 L626 280 L642 238 L626 196 M884 322 L900 280 L884 238 L900 196 M900 322 L884 280 L900 238 L884 196" strokeWidth="1.5" strokeOpacity=".7" />
        <path d="M700 118 V172 M700 118 L468 174 M700 118 L930 174" strokeWidth="2" />
      </g>
      <rect x="468" y="170" width="462" height="10" fill="#16305a" stroke={SILVER} strokeWidth="1.5" />
      <rect x="468" y="170" width="462" height="2.5" fill={GOLD} />
      <rect x="836" y="148" width="72" height="22" fill="#16305a" stroke={SILVER} strokeWidth="1.5" />
      <rect x="846" y="154" width="14" height="8" fill="#ffe9a8" fillOpacity=".8" />

      {/* lifting gear */}
      <g clipPath="url(#i-clip)">
        <g className="i-lift">
          <rect x="-1" y="-400" width="2" height="400" fill={SILVER} />
          <rect x="-28" y="0" width="56" height="4" fill={GOLD} />
          <Box x={-28} y={4} color={GOLD} className="i-liftbox" />
        </g>
      </g>
      <g className="i-trolley"><rect x="-15" y="166" width="30" height="16" fill={GOLD} stroke="#0f2240" /><circle cx="-8" cy="184" r="3" fill="#0f2240" /><circle cx="8" cy="184" r="3" fill="#0f2240" /></g>

      {/* registration gate */}
      <g className="i-scan">
        <rect x="684" y="186" width="32" height="136" fill="url(#g-scan)" />
        <rect x="699" y="186" width="2" height="136" fill="#fff4cf" />
      </g>
      <g transform="translate(700 358)">
        <g className="i-badge">
          <rect x="-72" y="-15" width="144" height="30" rx="15" fill="#0a1a33" stroke={GOLD} strokeWidth="1.6" />
          <path d="M-58 0 l5 5 l9 -11" fill="none" stroke={GOLD_SOFT} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <text x="10" y="5" textAnchor="middle" fontSize="13" fontWeight="700" fill="#f6f4ed" letterSpacing={lang === 'en' ? '1.6' : '0'} fontFamily="'DM Sans','Noto Kufi Arabic',sans-serif">{registered}</text>
        </g>
      </g>

      {/* truck */}
      <g transform="translate(774 270)"><g className="i-truck"><Truck boxClass="i-truckbox" /></g></g>

      {/* route leaving the port */}
      <path className="i-route-glow" d="M640 327 H960" stroke={GOLD} strokeWidth="11" fill="none" strokeLinecap="round" filter="url(#f-glow)" />
      <path className="i-route" d="M640 327 H960" stroke={GOLD_SOFT} strokeWidth="3.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Intro({ lang, onDone }: { lang: Language; onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const finish = useCallback(() => { setLeaving(true); window.setTimeout(onDone, 480); }, [onDone]);
  useEffect(() => {
    const timer = window.setTimeout(finish, 3950);
    return () => window.clearTimeout(timer);
  }, [finish]);
  return (
    <div className={`intro ${leaving ? 'leaving' : ''}`} dir="ltr" data-testid="intro-scene">
      <IntroScene lang={lang} />
      <div className="intro-title">
        {lang === 'en'
          ? <><strong>THE INTERNATIONAL ROUTE FOR LOGISTIC SERVICES</strong><span className="arabic">المسار الدولي للخدمات اللوجيستية</span></>
          : <><strong className="arabic">المسار الدولي للخدمات اللوجيستية</strong><span>THE INTERNATIONAL ROUTE FOR LOGISTIC SERVICES</span></>}
      </div>
      <button type="button" className="intro-skip" onClick={finish} data-testid="button-skip-intro">{lang === 'en' ? 'Skip' : 'تخطي'}</button>
    </div>
  );
}

/* ---------- panorama: glowing routes, planes, ships, port, trucks ---------- */
type Hub = { x: number; y: number; en: string; ar: string; major?: boolean; anchor?: 'start' | 'middle' | 'end'; dy?: number };
const HUBS: Hub[] = [
  { x: 720, y: 150, en: 'Amman', ar: 'عمّان', major: true, anchor: 'end', dy: -14 },
  { x: 800, y: 196, en: 'Queen Alia Airport', ar: 'مطار الملكة علياء', major: true, anchor: 'start', dy: 4 },
  { x: 706, y: 256, en: 'Aqaba Port', ar: 'ميناء العقبة', major: true, anchor: 'end', dy: 26 },
  { x: 240, y: 80, en: 'Europe', ar: 'أوروبا', anchor: 'middle', dy: -14 },
  { x: 380, y: 212, en: 'Africa', ar: 'أفريقيا', anchor: 'middle', dy: 28 },
  { x: 1200, y: 70, en: 'Asia', ar: 'آسيا', anchor: 'middle', dy: -14 },
  { x: 1100, y: 206, en: 'Gulf', ar: 'الخليج', anchor: 'middle', dy: 28 },
];
const ARCS = [
  { d: 'M240 80 Q560 6 800 196', dur: '11s', begin: '0s' },
  { d: 'M800 196 Q1000 24 1200 70', dur: '12s', begin: '-5s' },
  { d: 'M380 212 Q540 100 720 150', dur: '9s', begin: '-2s' },
  { d: 'M800 196 Q955 268 1100 206', dur: '10s', begin: '-7s' },
];
const CRANE_X = [150, 1250];
const STACK_COLORS = [GOLD, SILVER, '#7f93ad', GOLD_SOFT, '#a77d1c', '#f2f4f6'];

function PortCrane({ x, delay }: { x: number; delay: string }) {
  return (
    <g transform={`translate(${x} 262)`}>
      <path d="M0 98 V16 M16 98 V16 M80 98 V16 M96 98 V16" stroke={SILVER} strokeOpacity=".75" strokeWidth="2.4" fill="none" />
      <path d="M0 98 L16 60 L0 22 M16 98 L0 60 L16 22 M80 98 L96 60 L80 22 M96 98 L80 60 L96 22" stroke={SILVER} strokeOpacity=".4" strokeWidth="1.2" fill="none" />
      <rect x="-86" y="10" width="206" height="7" fill="#16305a" stroke={SILVER} strokeOpacity=".7" />
      <rect x="-86" y="10" width="206" height="2" fill={GOLD} />
      <path d="M48 -26 V10 M48 -26 L-86 10 M48 -26 L120 10" stroke={SILVER} strokeOpacity=".7" strokeWidth="1.6" fill="none" />
      <g className="pc-trolley" style={vars({ '--delay': delay })}>
        <rect x="-8" y="6" width="16" height="9" fill={GOLD} />
        <g className="pc-hang">
          <rect x="-0.8" y="15" width="1.6" height="34" fill={SILVER} />
          <rect x="-15" y="49" width="30" height="14" fill={GOLD_SOFT} stroke="#0a1a33" strokeOpacity=".4" />
        </g>
      </g>
    </g>
  );
}

function Stack({ x, rows, cols }: { x: number; rows: number; cols: number }) {
  const boxes: ReactNode[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) boxes.push(<rect key={`${r}-${c}`} x={x + c * 31} y={360 - (r + 1) * 14} width="29" height="12.5" fill={STACK_COLORS[(r * 3 + c * 2) % STACK_COLORS.length]} fillOpacity=".85" />);
  return <g>{boxes}</g>;
}

function Drive({ dir, dur, delay, y, scale }: { dir: 'r' | 'l'; dur: string; delay: string; y: number; scale: number }) {
  const flip = dir === 'l';
  return (
    <g transform={`translate(0 ${y})`}>
      <g className={flip ? 'drive-l' : 'drive-r'} style={vars({ '--d': dur, '--delay': delay })}>
        <g transform={flip ? `scale(${-scale} ${scale}) translate(-136 0)` : `scale(${scale})`}><Truck beam={!flip} /></g>
      </g>
    </g>
  );
}

function Drift({ dur, delay, y, scale }: { dur: string; delay: string; y: number; scale: number }) {
  return (
    <g transform={`translate(0 ${y})`}>
      <g className="drift-r" style={vars({ '--d': dur, '--delay': delay })}><g transform={`scale(${scale})`}><Ship /></g></g>
    </g>
  );
}

export function Panorama({ lang, variant = 'full' }: { lang: Language; variant?: 'full' | 'slim' }) {
  const viewBox = variant === 'full' ? '0 0 1440 440' : '0 20 1440 420';
  return (
    <div className={`panorama panorama-${variant}`} dir="ltr" aria-hidden="true">
      <svg viewBox={viewBox} preserveAspectRatio="xMidYMax slice">
        <rect x="0" y="0" width="1440" height="270" fill="url(#p-dots)" />

        {/* sea */}
        <rect x="0" y="262" width="1440" height="100" fill="url(#g-sea)" />
        <path className="route-flow slow" d="M0 304 H1440" stroke={GOLD} strokeOpacity=".4" strokeWidth="1.4" fill="none" />
        <path className="route-flow slow" d="M0 338 H1440" stroke={GOLD} strokeOpacity=".25" strokeWidth="1.2" fill="none" />
        <g className="wave-slide"><path d={`M-80 276 ${'q20 -7 40 0 t40 0 '.repeat(20)}`} fill="none" stroke="#7fa6d6" strokeOpacity=".3" strokeWidth="1.6" /></g>
        <g className="wave-slide slow"><path d={`M-80 322 ${'q20 -7 40 0 t40 0 '.repeat(20)}`} fill="none" stroke="#7fa6d6" strokeOpacity=".22" strokeWidth="1.6" /></g>
        <g className="vehicle">
          <Drift dur="52s" delay="-12s" y={238} scale={0.62} />
          <Drift dur="70s" delay="-44s" y={284} scale={0.42} />
        </g>

        {ARCS.map((arc) => (
          <g key={arc.d}>
            <path d={arc.d} fill="none" stroke={SILVER} strokeOpacity=".16" strokeWidth="1.2" />
            <path className="route-flow" d={arc.d} fill="none" stroke={GOLD} strokeWidth="6" strokeOpacity=".55" filter="url(#f-glow)" />
            <path className="route-flow" d={arc.d} fill="none" stroke={GOLD_SOFT} strokeWidth="1.8" strokeLinecap="round" />
          </g>
        ))}

        {HUBS.map((hub, i) => (
          <g key={hub.en}>
            <circle className="hub-ring" cx={hub.x} cy={hub.y} r={hub.major ? 6 : 4} fill="none" stroke={GOLD_SOFT} strokeWidth="1.6" style={{ animationDelay: `${i * 0.45}s` }} />
            <circle cx={hub.x} cy={hub.y} r={hub.major ? 6 : 4} fill={GOLD} stroke="#0a1a33" strokeWidth="2" />
            <text x={hub.x + (hub.anchor === 'end' ? -12 : hub.anchor === 'start' ? 12 : 0)} y={hub.y + (hub.dy ?? 0)} textAnchor={hub.anchor ?? 'middle'} fontSize={hub.major ? 18 : 15} fontWeight={hub.major ? 700 : 500} fill={hub.major ? '#f6f4ed' : '#aeb8bf'} fontFamily="'DM Sans','Noto Kufi Arabic',sans-serif" letterSpacing={lang === 'en' ? '.6' : '0'}>{lang === 'en' ? hub.en : hub.ar}</text>
          </g>
        ))}

        {ARCS.map((arc) => (
          <g className="vehicle" key={`p-${arc.d}`} opacity="0">
            <animateMotion dur={arc.dur} begin={arc.begin} repeatCount="indefinite" rotate="auto" path={arc.d} />
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.88;1" dur={arc.dur} begin={arc.begin} repeatCount="indefinite" />
            <g transform="scale(.7) translate(-60 -18)"><Plane /></g>
          </g>
        ))}

        {/* port */}
        <rect x="0" y="360" width="1440" height="80" fill="#07142a" />
        <rect x="0" y="360" width="1440" height="2" fill={SILVER} fillOpacity=".5" />
        <Stack x={20} rows={3} cols={4} /><Stack x={310} rows={2} cols={3} /><Stack x={1050} rows={3} cols={3} /><Stack x={1310} rows={2} cols={4} />
        {CRANE_X.map((x, i) => <PortCrane key={x} x={x} delay={i === 0 ? '0s' : '-3.5s'} />)}

        {/* road */}
        <rect x="0" y="392" width="1440" height="44" fill="#0b1c36" />
        <rect x="0" y="392" width="1440" height="1.5" fill={GOLD} fillOpacity=".7" />
        <rect x="0" y="434" width="1440" height="1.5" fill={GOLD} fillOpacity=".7" />
        <path className="road-dash" d="M0 414 H1440" stroke={SILVER} strokeOpacity=".55" strokeWidth="2" strokeDasharray="22 18" fill="none" />
        <g className="vehicle">
          <Drive dir="r" dur="22s" delay="-3s" y={374} scale={0.72} />
          <Drive dir="r" dur="31s" delay="-19s" y={374} scale={0.72} />
          <Drive dir="l" dur="26s" delay="-9s" y={395} scale={0.72} />
        </g>
      </svg>
    </div>
  );
}

/* ---------- small animated service icons ---------- */
export function AnimIcon({ kind }: { kind: ServiceKind }) {
  return (
    <svg className="anim-icon" viewBox="0 0 64 64" aria-hidden="true">
      {kind === 'ocean' && (
        <g>
          <g className="ai-rock"><path d="M10 38 H54 L48 48 H16 Z" fill={GOLD} /><rect x="16" y="26" width="9" height="12" fill={SILVER} /><rect x="26" y="26" width="9" height="12" fill={GOLD_SOFT} /><rect x="36" y="26" width="9" height="12" fill={SILVER} /><rect x="46" y="16" width="5" height="22" fill="#f2f4f6" /></g>
          <g className="ai-wave"><path d={`M-8 52 ${'q4 -4 8 0 t8 0 '.repeat(10)}`} fill="none" stroke="#7fa6d6" strokeWidth="2" /></g>
        </g>
      )}
      {kind === 'air' && (
        <g>
          <path className="ai-trail" d="M6 50 Q24 40 40 28" fill="none" stroke={GOLD_SOFT} strokeWidth="2" strokeDasharray="3 5" />
          <g className="ai-fly"><g transform="translate(14 16) scale(.5)"><Plane /></g></g>
        </g>
      )}
      {kind === 'land' && (
        <g>
          <path className="ai-road" d="M2 52 H62" stroke={SILVER} strokeOpacity=".6" strokeWidth="2" strokeDasharray="8 6" fill="none" />
          <g className="ai-drive"><g transform="translate(6 22) scale(.4)"><Truck beam={false} /></g></g>
        </g>
      )}
      {kind === 'customs' && (
        <g>
          <rect x="14" y="8" width="34" height="46" rx="2" fill="#f2f4f6" />
          <path d="M20 18H42M20 25H42M20 32H34" stroke="#16305a" strokeOpacity=".5" strokeWidth="2.2" />
          <path className="ai-check" d="M22 44 l6 6 l12 -14" fill="none" stroke={GOLD} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <g className="ai-stamp"><rect x="36" y="2" width="22" height="9" rx="2" fill={GOLD} /><rect x="43" y="11" width="8" height="8" fill="#a77d1c" /></g>
        </g>
      )}
      {kind === 'warehouse' && (
        <g>
          <path d="M6 28 L32 12 L58 28 V54 H6 Z" fill="#16305a" stroke={SILVER} strokeWidth="2" />
          <rect x="20" y="32" width="24" height="22" fill="#0a1a33" />
          <rect className="ai-door" x="20" y="32" width="24" height="22" fill={SILVER} />
          <rect className="ai-box" x="2" y="46" width="14" height="8" fill={GOLD} />
        </g>
      )}
      {kind === 'control' && (
        <g>
          <path d="M12 46 Q32 6 52 46" fill="none" stroke={SILVER} strokeOpacity=".4" strokeWidth="2" />
          <path className="ai-flow" d="M12 46 Q32 6 52 46" fill="none" stroke={GOLD_SOFT} strokeWidth="2.6" strokeDasharray="4 7" strokeLinecap="round" />
          <circle cx="12" cy="46" r="5" fill={GOLD} /><circle cx="52" cy="46" r="5" fill={GOLD} />
          <circle className="ai-pulse" cx="32" cy="26" r="6" fill="none" stroke={GOLD_SOFT} strokeWidth="2" /><circle cx="32" cy="26" r="5" fill={GOLD_SOFT} />
        </g>
      )}
    </svg>
  );
}

/* ---------- footer waves ---------- */
export function FooterWaves() {
  return (
    <div className="footer-waves" dir="ltr" aria-hidden="true">
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
        <g className="wave-slide"><path d={`M-80 34 ${'q20 -8 40 0 t40 0 '.repeat(20)}`} fill="none" stroke="#7fa6d6" strokeOpacity=".3" strokeWidth="1.6" /></g>
        <g className="wave-slide slow"><path d={`M-80 46 ${'q20 -8 40 0 t40 0 '.repeat(20)}`} fill="none" stroke="#7fa6d6" strokeOpacity=".2" strokeWidth="1.6" /></g>
      </svg>
    </div>
  );
}
