import { useMemo } from 'react';
import { BOARD_LENGTH } from '../data/constants.js';
import boardTiles from '../data/boardTiles.json';
import { TILE_TYPES } from '../data/constants.js';
import StickmanToken from './StickmanToken.jsx';

const TILE_SIZE = 64;

// Hand-authored winding path coordinates (map-like exploration route)
const PATH_POINTS = [
  { x: 60, y: 40 }, { x: 160, y: 50 }, { x: 260, y: 45 }, { x: 360, y: 70 },
  { x: 440, y: 60 }, { x: 520, y: 100 }, { x: 540, y: 200 }, { x: 460, y: 240 },
  { x: 360, y: 230 }, { x: 260, y: 260 }, { x: 180, y: 240 }, { x: 120, y: 190 },
  { x: 80, y: 120 }, { x: 160, y: 110 }, { x: 260, y: 130 }, { x: 340, y: 150 },
  { x: 420, y: 140 }, { x: 500, y: 170 }, { x: 540, y: 260 }, { x: 480, y: 310 },
  { x: 380, y: 300 }, { x: 280, y: 320 }, { x: 200, y: 290 }, { x: 120, y: 300 },
  { x: 60, y: 260 }, { x: 100, y: 180 }, { x: 200, y: 160 }, { x: 300, y: 180 },
  { x: 400, y: 200 }, { x: 480, y: 220 }, { x: 520, y: 300 },
];

function getPoint(index) {
  return PATH_POINTS[index % PATH_POINTS.length] || { x: 60 + index * 20, y: 100 };
}

function getTileStyle(tile) {
  const base = {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 700,
    textAlign: 'center',
    padding: '4px',
    position: 'absolute',
    border: '3px solid',
    boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
  };
  switch (tile.type) {
    case TILE_TYPES.START:
      return { ...base, background: '#06b6d4', borderColor: '#22d3ee', color: '#fff' };
    case TILE_TYPES.FINISH:
      return { ...base, background: '#f97316', borderColor: '#fb923c', color: '#fff' };
    case TILE_TYPES.BONUS:
      return { ...base, background: '#86efac', borderColor: '#22c55e', color: '#14532d' };
    case TILE_TYPES.PENALTY:
      return { ...base, background: '#fca5a5', borderColor: '#ef4444', color: '#7f1d1d' };
    default:
      return { ...base, background: '#f8fafc', borderColor: '#94a3b8', color: '#334155' };
  }
}

export default function Board({ boardPositions, tokenColors }) {
  const tiles = useMemo(() => boardTiles, []);

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-2xl w-full h-full min-h-[90vh]" style={{ background: '#dbeafe' }}>
      {/* Scenery */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#e0f2fe" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#skyGrad)" />
        {/* Grass hills */}
        <ellipse cx="200" cy="350" rx="180" ry="60" fill="#86efac" opacity="0.9" />
        <ellipse cx="480" cy="340" rx="140" ry="50" fill="#86efac" opacity="0.8" />
        {/* Water */}
        <ellipse cx="100" cy="200" rx="50" ry="30" fill="#67e8f9" opacity="0.7" />
        {/* Path line connecting tiles */}
        {PATH_POINTS.map((pt, i) => {
          if (i === 0) return null;
          const prev = PATH_POINTS[i - 1];
          return <line key={`path-${i}`} x1={prev.x} y1={prev.y} x2={pt.x} y2={pt.y} stroke="#fde047" strokeWidth="6" strokeLinecap="round" strokeDasharray="8 4" opacity="0.9" />;
        })}
      </svg>

      {/* Tiles placed along path */}
      {tiles.map((tile, index) => {
        const pt = getPoint(index);
        const tokenCount = Object.values(boardPositions || {}).filter(p => p === index).length;
        return (
          <div key={index} style={{ ...getTileStyle(tile), left: pt.x - TILE_SIZE / 2, top: pt.y - TILE_SIZE / 2 }}>
            <span>{tile.type === TILE_TYPES.START ? 'GO' : tile.type === TILE_TYPES.FINISH ? 'END' : index}</span>
            {tile.type === TILE_TYPES.BONUS && <span className="absolute top-1 right-1 text-[9px] font-black text-green-700">+{tile.move}</span>}
            {tile.type === TILE_TYPES.PENALTY && <span className="absolute top-1 right-1 text-[9px] font-black text-red-700">{tile.move}</span>}
            {tokenCount > 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {Object.entries(boardPositions || {})
                  .filter(([, pos]) => pos === index)
                  .map(([teamId], i) => {
                    const teamNum = parseInt(teamId.replace('team', ''), 10);
                    const color = tokenColors[teamNum - 1];
                    return <StickmanToken key={teamId} color={color} size={28} teamNumber={teamNum} style={{ position: 'absolute', transform: `translate(${(i % 2 === 0 ? -1 : 1) * 8}px, ${(i % 3 === 0 ? -1 : 1) * 8}px)` }} />;
                  })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
