/* Hand-drawn SVG icon set — line style, inherits currentColor.
   用法：<RockIcon size={24} />；棋子可用 <Svg><RockGlyph /></Svg> */

export function Svg({ size = 24, sw = 1.8, children, className, style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/* ---------- Brand ---------- */

export function LogoMark({ size = 24 }) {
  return (
    <Svg size={size} sw={2}>
      <circle cx="9" cy="12" r="5.5" />
      <circle cx="15" cy="12" r="5.5" />
    </Svg>
  );
}

/* ---------- UI ---------- */

export function SunIcon({ size = 20 }) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.3M12 19.2v2.3M2.5 12h2.3M19.2 12h2.3M5 5l1.6 1.6M17.4 17.4L19 19M19 5l-1.6 1.6M6.6 17.4L5 19" />
    </Svg>
  );
}

export function MoonIcon({ size = 20 }) {
  return (
    <Svg size={size}>
      <path d="M20 14.5A8.2 8.2 0 0 1 9.5 4 8.2 8.2 0 1 0 20 14.5z" />
    </Svg>
  );
}

export function GlobeIcon({ size = 17 }) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="8.5" />
      <ellipse cx="12" cy="12" rx="4" ry="8.5" />
      <path d="M3.5 12h17" />
    </Svg>
  );
}

export function HomeIcon({ size = 17 }) {
  return (
    <Svg size={size}>
      <path d="M4.5 11L12 4l7.5 7" />
      <path d="M6.5 9.5V20h11V9.5" />
    </Svg>
  );
}

export function RestartIcon({ size = 17 }) {
  return (
    <Svg size={size}>
      <path d="M4.5 9a8 8 0 1 1-.7 4.5" />
      <path d="M4.5 4.5V9H9" />
    </Svg>
  );
}

export function PlayIcon({ size = 17 }) {
  return (
    <Svg size={size} sw={1.8}>
      <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function PauseIcon({ size = 17 }) {
  return (
    <Svg size={size} sw={1.8}>
      <rect x="7" y="5" width="3.4" height="14" rx="1.4" fill="currentColor" stroke="none" />
      <rect x="13.6" y="5" width="3.4" height="14" rx="1.4" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function CloseIcon({ size = 17 }) {
  return (
    <Svg size={size} sw={2}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

export function CheckIcon({ size = 17 }) {
  return (
    <Svg size={size} sw={2.2}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </Svg>
  );
}

export function TrophyIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <path d="M8 4h8v4.5a4 4 0 0 1-8 0V4z" />
      <path d="M8 5.5H4.8a3.2 3.2 0 0 0 3.5 5M16 5.5h3.2a3.2 3.2 0 0 1-3.5 5" />
      <path d="M12 12.5V19.5M8.5 19.5h7" />
    </Svg>
  );
}

export function DrawIcon({ size = 20 }) {
  return (
    <Svg size={size} sw={2}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8 10.2h8M8 13.8h8" />
    </Svg>
  );
}

export function TapIcon({ size = 15 }) {
  return (
    <Svg size={size}>
      <path d="M6.5 3.5L18.5 11l-6.6 1.6-2.6 6.5z" />
    </Svg>
  );
}

export function ListIcon({ size = 18 }) {
  return (
    <Svg size={size}>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="5" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="5" cy="18" r="1.2" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function ChevUpIcon({ size = 20 }) {
  return (
    <Svg size={size} sw={2.2}>
      <path d="M6 14.5l6-6 6 6" />
    </Svg>
  );
}

export function ChevDownIcon({ size = 20 }) {
  return (
    <Svg size={size} sw={2.2}>
      <path d="M6 9.5l6 6 6-6" />
    </Svg>
  );
}

export function MinusIcon({ size = 18 }) {
  return (
    <Svg size={size} sw={2.2}>
      <path d="M5 12h14" />
    </Svg>
  );
}

export function PlusIcon({ size = 18 }) {
  return (
    <Svg size={size} sw={2.2}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

/* ---------- Tic Tac Toe pieces ---------- */

export function CircleMark({ size = 48, sw = 2.4 }) {
  return (
    <Svg size={size} sw={sw}>
      <circle cx="12" cy="12" r="7" />
    </Svg>
  );
}

export function CrossMark({ size = 48, sw = 2.6 }) {
  return (
    <Svg size={size} sw={sw}>
      <path d="M7 7l10 10M17 7L7 17" />
    </Svg>
  );
}

/* ---------- Rock Paper Scissors hands ---------- */

export function RockGlyph() {
  return (
    <>
      <rect x="7.5" y="9" width="9.5" height="11" rx="4.5" />
      <path d="M7.5 13H5.2a2.1 2.1 0 0 0 0 4.2h2.3" />
      <path d="M10.6 9V7.6M13.8 9V7" />
    </>
  );
}

export function PaperGlyph() {
  return (
    <>
      <path d="M8.5 20.5v-9l-2.3-2.3a1.6 1.6 0 0 1 2.3-2.2l2 2V4.8a1.5 1.5 0 0 1 3 0V9l2.4-2.7a1.6 1.6 0 0 1 2.3 2.1l-2.7 3.1v5A4.5 4.5 0 0 1 11 21h-1a1.5 1.5 0 0 1-1.5-.5z" />
    </>
  );
}

export function ScissorsGlyph() {
  return (
    <>
      <circle cx="6.5" cy="6.5" r="2.4" />
      <circle cx="6.5" cy="17.5" r="2.4" />
      <path d="M8.4 8.2L20 19.5M8.4 15.8L20 4.5" />
    </>
  );
}

export function RockIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <RockGlyph />
    </Svg>
  );
}

export function PaperIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <PaperGlyph />
    </Svg>
  );
}

export function ScissorsIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <ScissorsGlyph />
    </Svg>
  );
}

/* ---------- Dice ---------- */

const PIPS = {
  1: [[12, 12]],
  2: [[8.8, 8.8], [15.2, 15.2]],
  3: [[8.8, 8.8], [12, 12], [15.2, 15.2]],
  4: [[8.8, 8.8], [15.2, 8.8], [8.8, 15.2], [15.2, 15.2]],
  5: [[8.8, 8.8], [15.2, 8.8], [12, 12], [8.8, 15.2], [15.2, 15.2]],
  6: [[8.8, 8.8], [15.2, 8.8], [8.8, 12], [15.2, 12], [8.8, 15.2], [15.2, 15.2]],
};

export function DiceFace({ value = 1, size = 56 }) {
  const pips = PIPS[value] || PIPS[1];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      {pips.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.7" fill="currentColor" stroke="none" />
      ))}
    </svg>
  );
}

/* ---------- Memory deck (8 distinct shapes) ---------- */

export function StarGlyph() {
  return (
    <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.7l5.9-.8z" />
  );
}

export function HeartGlyph() {
  return (
    <path d="M12 20s-7.2-4.6-9-9.2C1.9 8 3.6 5 6.4 5c2 0 3.6 1.4 5.6 3.8C14 6.4 15.6 5 17.6 5c2.8 0 4.5 3 3.4 5.8C19.2 15.4 12 20 12 20z" />
  );
}

export function BoltGlyph() {
  return <path d="M13 2.5L5 13.5h5.5L10 21.5l8-11h-5.5z" />;
}

export function CrescentGlyph() {
  return <path d="M20 14.5A8.2 8.2 0 0 1 9.5 4 8.2 8.2 0 1 0 20 14.5z" />;
}

export function DropGlyph() {
  return (
    <path d="M12 3s6.2 6.6 6.2 11a6.2 6.2 0 0 1-12.4 0C5.8 9.6 12 3 12 3z" />
  );
}

export function DiamondGlyph() {
  return <path d="M12 3.5l5.5 8.5L12 20.5 6.5 12z" />;
}

export function TriangleGlyph() {
  return <path d="M12 4.5l7.5 15h-15z" />;
}

export function RingGlyph() {
  return (
    <>
      <circle cx="12" cy="12" r="6.5" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </>
  );
}

export const MEMO_DECK = [
  { key: 'star', Glyph: StarGlyph },
  { key: 'heart', Glyph: HeartGlyph },
  { key: 'bolt', Glyph: BoltGlyph },
  { key: 'moon', Glyph: CrescentGlyph },
  { key: 'drop', Glyph: DropGlyph },
  { key: 'diamond', Glyph: DiamondGlyph },
  { key: 'triangle', Glyph: TriangleGlyph },
  { key: 'ring', Glyph: RingGlyph },
];

/* ---------- Menu + header artwork ---------- */

export function ArtTicTacToe({ size = 30 }) {
  return (
    <Svg size={size} sw={1.7}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5.5" />
      <circle cx="9.2" cy="9.4" r="2.3" />
      <path d="M13.6 13.4l3.4 3.4M17 13.4l-3.4 3.4" />
    </Svg>
  );
}

export function ArtConnectFour({ size = 30 }) {
  return (
    <Svg size={size} sw={1.7}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5.5" />
      <circle cx="7.6" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="11.2" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="14.8" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="17.4" cy="12" r="1.5" />
    </Svg>
  );
}

export function ArtGomoku({ size = 30 }) {
  return (
    <Svg size={size} sw={1.6}>
      <path d="M8.5 4v16M15.5 4v16M4 8.5h16M4 15.5h16" />
      <circle cx="8.5" cy="8.5" r="1.9" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="15.5" r="1.9" />
    </Svg>
  );
}

export function ArtDotsBoxes({ size = 30 }) {
  return (
    <Svg size={size} sw={1.7}>
      {[5, 12, 19].map((y) =>
        [5, 12, 19].map((x) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" fill="currentColor" stroke="none" />
        )),
      )}
      <rect x="9.6" y="9.6" width="4.8" height="4.8" rx="1.2" />
    </Svg>
  );
}

export function ArtMemory({ size = 30 }) {
  return (
    <Svg size={size} sw={1.7}>
      <rect x="3" y="6.5" width="10.5" height="13.5" rx="3" />
      <rect x="10.5" y="4" width="10.5" height="13.5" rx="3" fill="currentColor" fillOpacity="0.12" />
      <path d="M15.7 7.5l1.1 2.3 2.5.3-1.8 1.7.4 2.5-2.2-1.2-2.2 1.2.4-2.5-1.8-1.7 2.5-.3z" />
    </Svg>
  );
}

export function ArtRace({ size = 30 }) {
  return (
    <Svg size={size} sw={1.7}>
      <circle cx="12" cy="13.5" r="6.5" />
      <path d="M12 13.5l2.7-2.7" />
      <path d="M12 7V5M9.5 3.5h5" />
    </Svg>
  );
}

export function ArtPong({ size = 30 }) {
  return (
    <Svg size={size} sw={1.7}>
      <path d="M12 4v16" strokeDasharray="2.4 2.6" />
      <path d="M5.5 8v8M18.5 8v8" strokeWidth="2.6" />
      <circle cx="12" cy="14.5" r="1.8" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function ArtGuess({ size = 30 }) {
  return (
    <Svg size={size} sw={1.7}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function ArtClash({ size = 30 }) {
  return (
    <Svg size={size} sw={1.7}>
      <path d="M12 3l1.8 5.7 5.7 1.8-5.7 1.8L12 18l-1.8-5.7L4.5 10.5l5.7-1.8z" />
      <path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
    </Svg>
  );
}

export function ArtOthello({ size = 30 }) {
  return (
    <Svg size={size} sw={1.7}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5.5" />
      <circle cx="9.5" cy="9.5" r="2.6" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="14.5" r="2.6" />
    </Svg>
  );
}

export function ArtHangman({ size = 30 }) {
  return (
    <Svg size={size} sw={1.7}>
      <path d="M5 20V4M5 4h11M11.5 4v3.5" />
      <circle cx="11.5" cy="10" r="2.4" />
      <path d="M11.5 12.4V16M11.5 13.5l-2.5 1.5M11.5 13.5l2.5 1.5M11.5 16l-2.3 3M11.5 16l2.3 3" />
    </Svg>
  );
}

export function ArtBlackjack({ size = 30 }) {
  return (
    <Svg size={size} sw={1.7}>
      <rect x="3" y="6" width="10" height="14" rx="2.5" />
      <rect x="11" y="4" width="10" height="14" rx="2.5" fill="currentColor" fillOpacity="0.12" />
      <path d="M16 8.2c-1.6 1-2.6 2-2.6 3.1 0 .9.7 1.5 1.4 1.5.5 0 .9-.3 1.2-.8.3.5.7.8 1.2.8.7 0 1.4-.6 1.4-1.5 0-1.1-1-2.1-2.6-3.1z" />
    </Svg>
  );
}

export function ArtMole({ size = 30 }) {
  return (
    <Svg size={size} sw={1.7}>
      <ellipse cx="12" cy="19" rx="7.5" ry="2.6" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="10.2" cy="11.2" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="13.8" cy="11.2" r="0.9" fill="currentColor" stroke="none" />
      <path d="M10.5 14.5c1 1 2 1 3 0" />
    </Svg>
  );
}

export function ArtMines({ size = 30 }) {
  return (
    <Svg size={size} sw={1.7}>
      <circle cx="12" cy="12" r="5.5" />
      <path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2" />
      <circle cx="10.2" cy="10.2" r="1.2" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function ArtBattle({ size = 30 }) {
  return (
    <Svg size={size} sw={1.7}>
      <path d="M4 16l3-8 3 5 3-9 3 12" />
      <path d="M3 19.5h18" />
    </Svg>
  );
}

export function ArtCheckers({ size = 30 }) {
  return (
    <Svg size={size} sw={1.7}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M3.5 9.2h17M3.5 14.8h17M9.2 3.5v17M14.8 3.5v17" strokeWidth="1" opacity="0.6" />
      <circle cx="9.2" cy="17.6" r="2" fill="currentColor" stroke="none" />
      <circle cx="14.8" cy="6.4" r="2" />
    </Svg>
  );
}

export function ArtMaster({ size = 30 }) {
  return (
    <Svg size={size} sw={1.7}>
      <circle cx="7" cy="12" r="2.4" fill="currentColor" stroke="none" />
      <circle cx="12.5" cy="12" r="2.4" />
      <circle cx="18" cy="12" r="2.4" fill="currentColor" fillOpacity="0.35" stroke="none" />
      <path d="M5 19.5h14" />
    </Svg>
  );
}

export function ArtSos({ size = 30 }) {
  return (
    <Svg size={size} sw={1.7}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <path d="M7 15.5c0-1.2 1-1.6 2-2s2-.8 2-2-1-1.9-2-1.9-1.9.7-2 1.9M14 8.5c2.8 0 2.8 7 0 7s-2.8-7 0-7zM14 12h2.5" />
    </Svg>
  );
}

export function ArtNim({ size = 30 }) {
  return (
    <Svg size={size} sw={1.7}>
      <path d="M7 5v14M12 8v11M17 4v15" strokeWidth="2.4" />
    </Svg>
  );
}

export function ArtLights({ size = 30 }) {
  return (
    <Svg size={size} sw={1.7}>
      <path d="M9.5 18h5l-.7-3.2a4.5 4.5 0 1 0-3.6 0z" />
      <path d="M10.5 20.5h3" />
      <path d="M12 2.5v1.5M5.6 5.6l1 1M18.4 5.6l-1 1" />
    </Svg>
  );
}

export function ArtMath({ size = 30 }) {
  return (
    <Svg size={size} sw={1.9}>
      <path d="M5 9h6M8 6v6M13 15.5h7M16.5 12.5v6" />
    </Svg>
  );
}

export function ArtSimon({ size = 30 }) {
  return (
    <Svg size={size} sw={1.7}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2.5" fill="currentColor" stroke="none" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2.5" opacity="0.45" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2.5" opacity="0.45" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2.5" />
    </Svg>
  );
}

export function ArtSnake({ size = 30 }) {
  return (
    <Svg size={size} sw={1.9}>
      <path d="M5 15h7a4 4 0 1 0-4-4H6a4 4 0 1 1 4 4" />
      <circle cx="18.5" cy="15" r="1.4" fill="currentColor" stroke="none" />
    </Svg>
  );
}
