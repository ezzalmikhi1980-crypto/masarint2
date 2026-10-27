import type { CSSProperties, ReactElement } from 'react';
import type { Language } from './data';

/* Equirectangular projection centred on Jordan — must match the generated /world-map.jpg */
type LL = [number, number];
const W = 2800;
const H = 1000;
const LON0 = -144;
const SCALE = W / 360;
const LAT_TOP = 72;
const RAD = Math.PI / 180;
const GOLD = '#d2a337';
const GOLD_SOFT = '#e7c76a';
const SILVER = '#c7d0d6';
const SEA_BLUE = '#9ec3e6';

const f1 = (n: number) => n.toFixed(1);
const vars = (values: Record<string, string>) => values as unknown as CSSProperties;

export function project(lon: number, lat: number): [number, number] {
  let l = lon;
  while (l < LON0) l += 360;
  while (l >= LON0 + 360) l -= 360;
  return [(l - LON0) * SCALE, (LAT_TOP - lat) * SCALE];
}

/* deterministic pseudo-random so the scene is identical on every load */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function greatCircle(a: LL, b: LL, n = 56): [number, number][] {
  const lo1 = a[0] * RAD, la1 = a[1] * RAD, lo2 = b[0] * RAD, la2 = b[1] * RAD;
  const d = 2 * Math.asin(Math.sqrt(Math.sin((la2 - la1) / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin((lo2 - lo1) / 2) ** 2));
  const pts: [number, number][] = [];
  let prevX = 0;
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(la1) * Math.cos(lo1) + B * Math.cos(la2) * Math.cos(lo2);
    const y = A * Math.cos(la1) * Math.sin(lo1) + B * Math.cos(la2) * Math.sin(lo2);
    const z = A * Math.sin(la1) + B * Math.sin(la2);
    const [px, py] = project(Math.atan2(y, x) / RAD, Math.atan2(z, Math.sqrt(x * x + y * y)) / RAD);
    let px2 = px;
    if (i > 0) { while (px2 - prevX > W / 2) px2 -= W; while (prevX - px2 > W / 2) px2 += W; }
    prevX = px2;
    pts.push([px2, py]);
  }
  return pts;
}

const lineD = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x)} ${f1(y)}`).join(' ');
const lengthOf = (pts: [number, number][]) => pts.reduce((sum, p, i) => (i ? sum + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);

/* Catmull-Rom through waypoints -> dense polyline (stays close to the lanes we place in open water) */
function spline(ll: LL[], seg = 10): [number, number][] {
  const p = ll.map(([lo, la]) => project(lo, la));
  const out: [number, number][] = [];
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
    for (let s = 0; s < seg; s++) {
      const t = s / seg, t2 = t * t, t3 = t2 * t;
      out.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  out.push(p[p.length - 1]);
  return out;
}

/* ---------- places ---------- */
const JORDAN: LL = [36.0, 31.8];
type Side = 'l' | 'r' | 't' | 'b';
type Hub = { id: string; ll: LL; en: string; ar: string; side?: Side; label?: boolean; air?: boolean; busy?: boolean };
const HUBS: Hub[] = [
  { id: 'london', ll: [-0.45, 51.5], en: 'London', ar: 'لندن', side: 'l', label: true, air: true },
  { id: 'frankfurt', ll: [8.6, 50.0], en: 'Frankfurt', ar: 'فرانكفورت', side: 'r', air: true },
  { id: 'madrid', ll: [-3.6, 40.5], en: 'Madrid', ar: 'مدريد', side: 'l', air: true },
  { id: 'rome', ll: [12.3, 41.8], en: 'Rome', ar: 'روما', side: 't', air: true },
  { id: 'istanbul', ll: [28.8, 41.3], en: 'Istanbul', ar: 'إسطنبول', side: 'l', label: true, air: true, busy: true },
  { id: 'moscow', ll: [37.4, 56.0], en: 'Moscow', ar: 'موسكو', side: 't', label: true, air: true },
  { id: 'cairo', ll: [31.4, 30.1], en: 'Cairo', ar: 'القاهرة', side: 'b', label: true, air: true },
  { id: 'casablanca', ll: [-7.6, 33.4], en: 'Casablanca', ar: 'الدار البيضاء', side: 'l', air: true },
  { id: 'lagos', ll: [3.3, 6.6], en: 'Lagos', ar: 'لاغوس', side: 'b', label: true, air: true },
  { id: 'addis', ll: [38.8, 9.0], en: 'Addis Ababa', ar: 'أديس أبابا', side: 'r', air: true },
  { id: 'nairobi', ll: [36.9, -1.3], en: 'Nairobi', ar: 'نيروبي', side: 'r', air: true },
  { id: 'joburg', ll: [28.2, -26.1], en: 'Johannesburg', ar: 'جوهانسبرغ', side: 'r', label: true, air: true },
  { id: 'riyadh', ll: [46.7, 24.9], en: 'Riyadh', ar: 'الرياض', side: 'b', air: true },
  { id: 'dubai', ll: [55.4, 25.2], en: 'Dubai', ar: 'دبي', side: 'r', label: true, air: true, busy: true },
  { id: 'karachi', ll: [67.2, 24.9], en: 'Karachi', ar: 'كراتشي', side: 'b', air: true },
  { id: 'mumbai', ll: [72.9, 19.1], en: 'Mumbai', ar: 'مومباي', side: 'b', label: true, air: true, busy: true },
  { id: 'delhi', ll: [77.1, 28.6], en: 'Delhi', ar: 'نيودلهي', side: 't', air: true },
  { id: 'bangkok', ll: [100.7, 13.7], en: 'Bangkok', ar: 'بانكوك', side: 'l', air: true },
  { id: 'singapore', ll: [104.0, 1.4], en: 'Singapore', ar: 'سنغافورة', side: 'b', label: true, air: true, busy: true },
  { id: 'hongkong', ll: [113.9, 22.3], en: 'Hong Kong', ar: 'هونغ كونغ', side: 'b', air: true },
  { id: 'shanghai', ll: [121.8, 31.1], en: 'Shanghai', ar: 'شنغهاي', side: 'r', label: true, air: true, busy: true },
  { id: 'beijing', ll: [116.6, 40.1], en: 'Beijing', ar: 'بكين', side: 't', air: true },
  { id: 'seoul', ll: [126.4, 37.5], en: 'Seoul', ar: 'سيول', side: 't', air: true },
  { id: 'tokyo', ll: [140.4, 35.8], en: 'Tokyo', ar: 'طوكيو', side: 'r', label: true, air: true },
  { id: 'sydney', ll: [151.2, -33.9], en: 'Sydney', ar: 'سيدني', side: 'l', label: true, air: true },
  { id: 'newyork', ll: [-73.8, 40.6], en: 'New York', ar: 'نيويورك', side: 'l', label: true, air: true, busy: true },
  { id: 'losangeles', ll: [-118.4, 33.9], en: 'Los Angeles', ar: 'لوس أنجلوس', side: 'b', label: true, air: true },
  { id: 'saopaulo', ll: [-46.5, -23.4], en: 'São Paulo', ar: 'ساو باولو', side: 'b', label: true, air: true },
];
/* sea ports that get a marker (and a few labels) */
const PORTS: Hub[] = [
  { id: 'rotterdam', ll: [4.0, 51.95], en: 'Rotterdam', ar: 'روتردام', side: 't', label: true },
  { id: 'piraeus', ll: [23.65, 37.9], en: 'Piraeus', ar: 'بيرايوس', side: 'b' },
  { id: 'portsaid', ll: [32.3, 31.28], en: 'Port Said', ar: 'بورسعيد', side: 'l' },
  { id: 'aqaba', ll: [34.98, 29.45], en: 'Aqaba', ar: 'العقبة' },
  { id: 'jebelali', ll: [55.0, 25.1], en: 'Jebel Ali', ar: 'جبل علي', side: 'b' },
  { id: 'colombo', ll: [79.85, 6.95], en: 'Colombo', ar: 'كولومبو', side: 'b', label: true },
  { id: 'mombasa', ll: [39.7, -4.05], en: 'Mombasa', ar: 'مومباسا', side: 'r', label: true },
  { id: 'durban', ll: [31.0, -29.9], en: 'Durban', ar: 'ديربان', side: 'r' },
  { id: 'busan', ll: [129.05, 35.1], en: 'Busan', ar: 'بوسان', side: 'l' },
  { id: 'santos', ll: [-46.3, -24.0], en: 'Santos', ar: 'سانتوس', side: 'r' },
];

/* sea lanes: waypoints placed in open water, west -> east or outward from Jordan */
type Lane = { id: string; pts: LL[]; ships: number };
const LANES: Lane[] = [
  { id: 'asia', ships: 3, pts: [[34.98, 29.45], [34.75, 28.7], [34.6, 28.05], [34.5, 27.5], [35.2, 26.6], [36.1, 25.2], [37.1, 23.6], [38.4, 21.6], [39.3, 19.7], [40.6, 17.3], [41.8, 14.9], [43.3, 12.7], [46, 11.9], [49, 12.5], [53.5, 14.0], [58, 14.5], [64, 13.8], [70, 11.0], [74.5, 7.6], [77.5, 6.3], [80.6, 5.4], [85, 5.6], [90, 5.6], [94, 6.4], [96.6, 6.1], [98.6, 4.9], [100, 3.7], [101.4, 2.5], [102.7, 1.6], [104.0, 1.25], [105.5, 2.0], [107.5, 4.5], [109.5, 8.0], [111.5, 11.5], [114, 15.5], [116.5, 19], [118.8, 22.5], [119.8, 24.6], [120.8, 26.5], [122.3, 29.5], [122.6, 31.0]] },
  { id: 'suez', ships: 3, pts: [[34.98, 29.45], [34.75, 28.7], [34.6, 28.05], [34.2, 27.45], [33.75, 27.95], [33.2, 28.7], [32.75, 29.5], [32.55, 29.95], [32.45, 30.5], [32.3, 31.25], [31.2, 32.3], [28.5, 33.4], [25.5, 34.1], [21, 35.2], [17, 36.1], [14.2, 35.4], [11.8, 37.2], [9, 38.0], [6, 38.3], [2, 37.9], [-0.5, 37.0], [-2.5, 36.3], [-4.5, 36.0], [-6.2, 36.2], [-9.8, 36.6], [-10.2, 39], [-10.2, 42], [-10.3, 43.7], [-8, 45.8], [-6, 48.1], [-5.2, 49.3], [-3, 49.9], [-1.0, 50.1], [0.8, 50.3], [1.6, 50.95], [2.8, 51.7], [3.4, 51.9]] },
  { id: 'piraeus', ships: 1, pts: [[28.5, 33.4], [27, 35.0], [25.8, 36.3], [24.4, 37.2], [23.65, 37.85]] },
  { id: 'cape', ships: 2, pts: [[49, 12.5], [52.6, 11.7], [53, 9], [51.5, 5.5], [48.5, 2.0], [45.5, -1.5], [41.8, -4.2], [41.8, -9], [42, -13], [41.5, -17], [38.5, -21], [36.5, -25.5], [33.7, -28.8], [31.8, -30.0], [28.5, -34.3], [24, -35.5], [20.5, -36.0], [18.0, -35.2], [16.8, -33.2], [14.5, -28], [11.0, -22], [9.5, -14], [8, -8], [6.5, -2], [5, 2], [3.4, 5.4], [-2, 4.0], [-8.5, 3.6], [-14, 7.0], [-18.5, 12], [-18.0, 14.6], [-18.5, 19.5], [-18, 23], [-19, 26], [-18.5, 30.0], [-12, 33.5], [-10, 34.4], [-6.5, 36.2]] },
  { id: 'atl-us', ships: 2, pts: [[-6.5, 36.2], [-12, 37.5], [-22, 38.5], [-32, 40], [-44, 41.2], [-56, 41.2], [-66, 40.2], [-72.5, 39.6], [-73.6, 40.4]] },
  { id: 'atl-br', ships: 2, pts: [[-9.8, 36.6], [-14, 32], [-20, 27], [-23, 20], [-27.5, 8], [-30.5, 0], [-32.5, -5.5], [-34, -10], [-37, -13.5], [-38, -18.5], [-39.5, -22.5], [-43, -25.2], [-46.2, -24.5]] },
  { id: 'gulf', ships: 2, pts: [[58, 14.5], [61.5, 18.5], [62, 21.5], [61, 23.2], [59.5, 24.6], [57.5, 25.6], [56.6, 26.4], [55.3, 26.0], [54.9, 25.25]] },
  { id: 'mumbai', ships: 1, pts: [[64, 13.8], [67, 15.6], [70, 17.4], [72.5, 18.8]] },
  { id: 'karachi', ships: 1, pts: [[62, 14], [64.5, 19], [65.9, 23.2], [66.7, 24.4]] },
  { id: 'eastasia', ships: 2, pts: [[122.6, 31.0], [126, 30.5], [131.5, 29.8], [136, 32.2], [139.5, 33.7], [139.7, 34.6], [139.8, 35.3]] },
  { id: 'busan', ships: 1, pts: [[123.5, 31.5], [126.5, 32.8], [128.9, 34.4]] },
];

/* overland corridors */
const ROADS: { id: string; pts: LL[] }[] = [
  { id: 'gulf-road', pts: [[36, 31.8], [39.5, 30.2], [43, 27.5], [46.7, 24.9], [50.1, 25.6], [55.3, 25.2]] },
  { id: 'iraq-iran', pts: [[36, 31.8], [40, 32.6], [44.4, 33.3], [48.5, 34.5], [51.4, 35.7]] },
  { id: 'anatolia', pts: [[36, 31.8], [36.3, 33.5], [37.2, 36.2], [33, 38.5], [32.9, 39.9], [29, 41.0]] },
  { id: 'sinai-nile', pts: [[36, 31.8], [35, 29.6], [34.2, 29.6], [33, 29.9], [31.4, 30.1]] },
];

/* ---------- sprites (top-down, facing +x) ---------- */
function PlaneSprite() {
  return (
    <g>
      <rect x="-330" y="-2.4" width="330" height="4.8" fill="url(#wm-trail)" opacity=".1" />
      <rect x="-330" y="-0.9" width="330" height="1.8" fill="url(#wm-trail)" opacity=".5" />
      <g transform="translate(5 9)" fill="#000" opacity=".28"><path d="M-34 0 L26 -3 Q38 -2 42 0 Q38 2 26 3Z" /><path d="M6 -2 L-14 -34 L-6 -34 L20 -2Z" /><path d="M6 2 L-14 34 L-6 34 L20 2Z" /></g>
      <path d="M6 -2 L-14 -34 L-5 -34 L21 -2Z" fill="#c9d1d9" /><path d="M6 2 L-14 34 L-5 34 L21 2Z" fill="#c9d1d9" />
      <path d="M-28 -2 L-38 -14 L-33 -14 L-22 -2Z" fill="#c9d1d9" /><path d="M-28 2 L-38 14 L-33 14 L-22 2Z" fill="#c9d1d9" />
      <ellipse cx="-3" cy="-18" rx="6.5" ry="2.6" fill="#8f9ba7" /><ellipse cx="-3" cy="18" rx="6.5" ry="2.6" fill="#8f9ba7" />
      <path d="M-35 0 Q-35 -3.2 -28 -3.2 L26 -3.2 Q38 -2.4 43 0 Q38 2.4 26 3.2 L-28 3.2 Q-35 3.2 -35 0Z" fill="#f1f4f7" />
      <rect x="-35" y="-0.9" width="16" height="1.8" fill={GOLD} />
      <ellipse cx="33" cy="0" rx="4.2" ry="1.6" fill="#3a5170" />
      <circle className="nav-blink" cx="-12" cy="-34" r="2" fill="#ff5252" /><circle className="nav-blink" cx="-12" cy="34" r="2" fill="#4cff8a" />
      <circle className="nav-strobe" cx="-37" cy="0" r="1.6" fill="#ffffff" />
    </g>
  );
}

const BOX_PALETTE = ['#c9a24a', '#8fa0b2', '#b5542d', '#2f6f8f', '#d9d3c3', '#5d7f3d', '#a77d1c', '#6d83a0'];
function ShipSprite({ seed }: { seed: number }) {
  const r = rng(seed);
  const boxes: ReactElement[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 9; col++) {
      if (r() < 0.07) continue;
      boxes.push(<rect key={`${row}-${col}`} x={-46 + col * 9.6} y={-7.4 + row * 4.9} width="9" height="4.4" fill={BOX_PALETTE[Math.floor(r() * BOX_PALETTE.length)]} />);
    }
  }
  return (
    <g>
      <path d="M-60 0 L-250 -15 L-250 15 Z" fill="url(#wm-wake)" />
      <path d="M-60 -2.5 L-190 -7 M-60 2.5 L-190 7" stroke="#ffffff" strokeOpacity=".3" strokeWidth="1.4" fill="none" />
      <path d="M-58 -9 H38 Q58 -9 66 0 Q58 9 38 9 H-58 Z" transform="translate(3 7)" fill="#000" opacity=".3" />
      <path d="M-60 -10 H38 Q59 -10 68 0 Q59 10 38 10 H-60 Z" fill="#12213a" />
      <path d="M-58 -8.4 H36 Q54 -8.4 62 0 Q54 8.4 36 8.4 H-58 Z" fill="#243b5e" />
      {boxes}
      <rect x="-58" y="-7.2" width="10" height="14.4" fill="#e9edf1" /><rect x="-56" y="-5" width="3" height="10" fill="#243b5e" opacity=".7" />
      <rect x="-52" y="-2.2" width="4" height="4.4" fill={GOLD} />
      <path d="M44 0 H62" stroke="#c7d0d6" strokeOpacity=".5" strokeWidth=".8" />
    </g>
  );
}

function TruckSprite() {
  return (
    <g>
      <path d="M16 0 L60 -9 L60 9 Z" fill="url(#wm-beam)" />
      <rect x="-15" y="-3.6" width="21" height="7.2" rx="1" fill="#cfd6dd" />
      <rect x="-14" y="-3" width="19" height="6" fill={GOLD} opacity=".92" />
      <rect x="7" y="-3.4" width="8" height="6.8" rx="1.2" fill="#1f3a68" />
      <rect x="11.5" y="-2.5" width="2.8" height="5" fill="#9fc4e8" />
      <circle cx="15.4" cy="-2.2" r="1" fill="#fff6cf" /><circle cx="15.4" cy="2.2" r="1" fill="#fff6cf" />
    </g>
  );
}

/* ---------- moving things ---------- */
type MoverProps = { d: string; dur: number; begin: number; children: ReactElement; hold: number };
function Mover({ d, dur, begin, hold, children }: MoverProps) {
  const move = (1 - hold).toFixed(3);
  const fade = Math.min(0.05, (1 - hold) / 6).toFixed(3);
  const t = (n: number) => n.toFixed(3);
  const m = 1 - hold;
  const times = `0;${fade};${t(m - Number(fade))};${t(m)};1`;
  return (
    <g className="vehicle" opacity="0">
      <animateMotion dur={`${dur.toFixed(1)}s`} begin={`${begin.toFixed(1)}s`} repeatCount="indefinite" rotate="auto" path={d} calcMode="linear" keyPoints="0;1;1" keyTimes={`0;${move};1`} />
      <animate attributeName="opacity" values="0;1;1;0;0" keyTimes={times} dur={`${dur.toFixed(1)}s`} begin={`${begin.toFixed(1)}s`} repeatCount="indefinite" />
      {children}
    </g>
  );
}

/* ---------- built once at module load ---------- */
const hubOf = (id: string) => HUBS.find((h) => h.id === id) as Hub;
const AIR = HUBS.filter((h) => h.air).map((hub) => {
  const pts = greatCircle(JORDAN, hub.ll);
  return { id: hub.id, hub, pts, d: lineD(pts), rd: lineD([...pts].reverse()), len: lengthOf(pts) };
});
const SEA = LANES.map((lane) => {
  const pts = spline(lane.pts);
  return { lane, pts, d: lineD(pts), rd: lineD([...pts].reverse()), len: lengthOf(pts) };
});
const LAND = ROADS.map((road) => {
  const pts = spline(road.pts, 8);
  return { id: road.id, pts, d: lineD(pts), rd: lineD([...pts].reverse()), len: lengthOf(pts) };
});

type Mv = { key: string; d: string; dur: number; begin: number; seed: number };
const PLANES: Mv[] = [];
const SHIPS: Mv[] = [];
const TRUCKS: Mv[] = [];
{
  const r = rng(2026);
  AIR.forEach((route, i) => {
    const mk = (reverse: boolean, tag: string) => {
      const speed = 44 + r() * 26;
      const flight = route.len / speed;
      const cycle = flight / 0.78 + r() * 6;
      PLANES.push({ key: `${route.id}-${tag}`, d: reverse ? route.rd : route.d, dur: cycle, begin: -r() * cycle, seed: i });
    };
    mk(i % 2 === 1, 'a');
    if (route.hub.busy) mk(i % 2 === 0, 'b');
  });
  SEA.forEach((route, i) => {
    for (let n = 0; n < route.lane.ships; n++) {
      const speed = 17 + r() * 10;
      const trip = route.len / speed;
      const cycle = trip / 0.9;
      SHIPS.push({ key: `${route.lane.id}-${n}`, d: n % 2 === 0 ? route.d : route.rd, dur: cycle, begin: -((n + r() * 0.8) / route.lane.ships) * cycle, seed: i * 10 + n + 3 });
    }
  });
  LAND.forEach((route, i) => {
    for (let n = 0; n < 2; n++) {
      const speed = 8 + r() * 4;
      const trip = route.len / speed;
      const cycle = trip / 0.85 + 2;
      TRUCKS.push({ key: `${route.id}-${n}`, d: n % 2 === 0 ? route.d : route.rd, dur: cycle, begin: -r() * cycle, seed: i * 5 + n });
    }
  });
}

const LABEL_OFFSET: Record<Side, { dx: number; dy: number; anchor: 'start' | 'end' | 'middle' }> = {
  r: { dx: 13, dy: 7, anchor: 'start' },
  l: { dx: -13, dy: 7, anchor: 'end' },
  t: { dx: 0, dy: -13, anchor: 'middle' },
  b: { dx: 0, dy: 27, anchor: 'middle' },
};

const CONTINENTS: { ll: LL; en: string; ar: string }[] = [
  { ll: [-102, 47], en: 'NORTH AMERICA', ar: 'أمريكا الشمالية' },
  { ll: [-60, -12], en: 'SOUTH AMERICA', ar: 'أمريكا الجنوبية' },
  { ll: [14, 50.5], en: 'EUROPE', ar: 'أوروبا' },
  { ll: [20, 8], en: 'AFRICA', ar: 'أفريقيا' },
  { ll: [92, 52], en: 'ASIA', ar: 'آسيا' },
  { ll: [134, -26], en: 'AUSTRALIA', ar: 'أستراليا' },
];

export function WorldMap({ lang }: { lang: Language }) {
  const [jx, jy] = project(JORDAN[0], JORDAN[1]);
  const ar = lang === 'ar';
  const labelFont = "'DM Sans','Noto Kufi Arabic',sans-serif";
  const hubs = [...HUBS, ...PORTS];
  return (
    <div className="worldmap" dir="ltr" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="wm-trail" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffffff" stopOpacity="0" /><stop offset="1" stopColor="#ffffff" stopOpacity="1" /></linearGradient>
          <linearGradient id="wm-wake" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#dff0ff" stopOpacity="0" /><stop offset="1" stopColor="#dff0ff" stopOpacity=".42" /></linearGradient>
          <linearGradient id="wm-beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff2c2" stopOpacity=".55" /><stop offset="1" stopColor="#fff2c2" stopOpacity="0" /></linearGradient>
          <radialGradient id="wm-jordan"><stop offset="0" stopColor={GOLD_SOFT} stopOpacity=".55" /><stop offset="1" stopColor={GOLD} stopOpacity="0" /></radialGradient>
        </defs>
        <image href="/world-map.jpg" x="0" y="0" width={W} height={H} preserveAspectRatio="none" />

        {CONTINENTS.map((c) => { const [x, y] = project(c.ll[0], c.ll[1]); return <text key={c.en} x={x} y={y} textAnchor="middle" fontSize="30" fontWeight="500" letterSpacing={ar ? '0' : '9'} fill={SILVER} fillOpacity=".32" fontFamily={labelFont}>{ar ? c.ar : c.en}</text>; })}

        {/* sea lanes */}
        {SEA.map((route) => (
          <g key={route.lane.id}>
            <path d={route.d} fill="none" stroke={SEA_BLUE} strokeOpacity=".07" strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" />
            <path d={route.d} fill="none" stroke={SEA_BLUE} strokeOpacity=".2" strokeWidth="1.5" strokeLinejoin="round" />
            <path className="sea-flow" d={route.d} fill="none" stroke="#cfe6ff" strokeOpacity=".8" strokeWidth="2.1" strokeLinejoin="round" strokeLinecap="round" />
          </g>
        ))}

        {/* overland corridors */}
        {LAND.map((route) => (
          <g key={route.id}>
            <path d={route.d} fill="none" stroke={SILVER} strokeOpacity=".28" strokeWidth="1.4" strokeLinejoin="round" />
            <path className="land-flow" d={route.d} fill="none" stroke="#f1f4f7" strokeOpacity=".85" strokeWidth="1.8" strokeLinejoin="round" />
          </g>
        ))}

        {/* air routes from Jordan */}
        {AIR.map((route) => (
          <g key={route.id}>
            <path d={route.d} fill="none" stroke={GOLD} strokeOpacity=".07" strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" />
            <path d={route.d} fill="none" stroke={GOLD_SOFT} strokeOpacity=".16" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
            <path d={route.d} fill="none" stroke={GOLD_SOFT} strokeOpacity=".42" strokeWidth="1.3" strokeLinejoin="round" />
            <path className="air-flow" d={route.d} fill="none" stroke="#fff0b8" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
          </g>
        ))}

        {/* hubs and ports */}
        {hubs.map((hub, i) => {
          const [x, y] = project(hub.ll[0], hub.ll[1]);
          const isPort = !hub.air;
          const side = LABEL_OFFSET[hub.side ?? 'r'];
          return (
            <g key={hub.id}>
              <circle className="hub-ring" cx={x} cy={y} r="5" fill="none" stroke={isPort ? SEA_BLUE : GOLD_SOFT} strokeWidth="1.6" style={{ animationDelay: `${(i % 9) * 0.35}s` }} />
              <circle cx={x} cy={y} r={isPort ? 3.4 : 4.2} fill={isPort ? '#cfe6ff' : GOLD_SOFT} stroke="#07142a" strokeWidth="1.6" />
              {hub.label ? <text x={x + side.dx} y={y + side.dy} textAnchor={side.anchor} fontSize="21" fontWeight="600" fill="#eef2f6" stroke="#07142a" strokeWidth="4.5" paintOrder="stroke" strokeLinejoin="round" fontFamily={labelFont} letterSpacing={ar ? '0' : '.4'}>{ar ? hub.ar : hub.en}</text> : null}
            </g>
          );
        })}

        {/* traffic */}
        {SHIPS.map((m) => <Mover key={m.key} d={m.d} dur={m.dur} begin={m.begin} hold={0.1}><g transform="scale(.56)"><ShipSprite seed={m.seed} /></g></Mover>)}
        {TRUCKS.map((m) => <Mover key={m.key} d={m.d} dur={m.dur} begin={m.begin} hold={0.15}><g transform="scale(.62)"><TruckSprite /></g></Mover>)}
        {PLANES.map((m) => <Mover key={m.key} d={m.d} dur={m.dur} begin={m.begin} hold={0.22}><g transform="scale(.52)"><PlaneSprite /></g></Mover>)}

        {/* Jordan — the focal point */}
        <circle cx={jx} cy={jy} r="120" fill="url(#wm-jordan)" />
        {[0, 1, 2].map((n) => <circle key={n} className="jordan-ring" cx={jx} cy={jy} r="12" fill="none" stroke={GOLD_SOFT} strokeWidth="2.4" style={{ animationDelay: `${n * 0.9}s` }} />)}
        <circle cx={jx} cy={jy} r="15" fill={GOLD} fillOpacity=".35" />
        <circle cx={jx} cy={jy} r="8" fill="#fff4cf" stroke={GOLD} strokeWidth="3" />
        <path d={`M${f1(jx + 10)} ${f1(jy - 10)} L${f1(jx + 56)} ${f1(jy - 56)} H${f1(jx + 150)}`} stroke={GOLD_SOFT} strokeWidth="2" fill="none" />
        <text x={jx + 62} y={jy - 66} fontSize="50" fontWeight="700" fill={GOLD_SOFT} stroke="#07142a" strokeWidth="7" paintOrder="stroke" strokeLinejoin="round" fontFamily={labelFont} letterSpacing={ar ? '0' : '2'}>{ar ? 'الأردن' : 'JORDAN'}</text>
        <text x={jx + 62} y={jy - 30} fontSize="23" fontWeight="500" fill="#eef2f6" stroke="#07142a" strokeWidth="5" paintOrder="stroke" strokeLinejoin="round" fontFamily={labelFont}>{ar ? 'عمّان · العقبة · مطار الملكة علياء' : 'Amman · Aqaba · Queen Alia Airport'}</text>
      </svg>
      <div className="worldmap-fade" />
    </div>
  );
}
