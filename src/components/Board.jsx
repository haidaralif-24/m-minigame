import { useMemo } from 'react';
import { BOARD_LENGTH } from '../data/constants.js';
import boardTiles from '../data/boardTiles.json';
import { TILE_TYPES } from '../data/constants.js';
import StickmanToken from './StickmanToken.jsx';

const TILE_SIZE = 56;
const GAP = 4;
const COLS = 10;
const ROWS = 4;

function getTilePosition(index) {
  const row = Math.floor(index / COLS);
  const isEvenRow = row % 2 === 0;
  const col = isEvenRow ? (index % COLS) : (COLS - 1 - (index % COLS));
  return { row, col };
}

function getTileStyle(index, tile) {
  const baseStyle = {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 700,
    textAlign: 'center',
    padding: '4px',
    position: 'relative',
    overflow: 'hidden',
  };

  switch (tile.type) {
    case TILE_TYPES.START:
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
        border: '2px solid #22d3ee',
        color: 'white',
      };
    case TILE_TYPES.FINISH:
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #f97316, #ea580c)',
        border: '2px solid #fb923c',
        color: 'white',
      };
    case TILE_TYPES.BONUS:
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        border: '2px solid #22c55e',
        color: '#22c55e',
      };
    case TILE_TYPES.PENALTY:
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        border: '2px solid #ef4444',
        color: '#ef4444',
      };
    default:
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        border: '2px solid #475569',
        color: '#94a3b8',
      };
  }
}

function getTokenPositions(boardPositions, tokenColors) {
  const positions = {};
  const tokenCounts = {};
  
  Object.entries(boardPositions).forEach(([teamId, tileIndex]) => {
    if (!tokenCounts[tileIndex]) tokenCounts[tileIndex] = 0;
    const count = tokenCounts[tileIndex]++;
    
    const { row, col } = getTilePosition(tileIndex);
    const offsetX = (count % 2 === 0 ? -1 : 1) * 8 * Math.floor(count / 2 + 0.5);
    const offsetY = (count % 3 === 0 ? -1 : 1) * 8 * Math.floor(count / 3 + 0.5);
    
    const x = col * (TILE_SIZE + GAP) + TILE_SIZE / 2 + offsetX;
    const y = row * (TILE_SIZE + GAP) + TILE_SIZE / 2 + offsetY;
    
    positions[teamId] = { x, y };
  });
  
  return positions;
}

export default function Board({ boardPositions, tokenColors, animatedTeamId, animationDelta }) {
  const tokenPositions = useMemo(
    () => getTokenPositions(boardPositions, tokenColors),
    [boardPositions, tokenColors]
  );

  const tiles = useMemo(() => {
    const grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
    
    boardTiles.forEach((tile, index) => {
      const { row, col } = getTilePosition(index);
      grid[row][col] = { ...tile, index };
    });
    
    return grid;
  }, []);

  return (
    <div className="relative board-glow rounded-2xl p-4" style={{ 
      width: 'fit-content',
      background: '#0f172a',
    }}>
      <div className="grid gap-[4px]" style={{ 
        gridTemplateColumns: `repeat(${COLS}, ${TILE_SIZE}px)`,
      }}>
        {tiles.map((row, rowIdx) =>
          row.map((tile, colIdx) => {
            if (!tile) return <div key={`empty-${rowIdx}-${colIdx}`} style={{ width: TILE_SIZE, height: TILE_SIZE }} />;
            
            const isStart = tile.index === 0;
            const isFinish = tile.index === BOARD_LENGTH - 1;
            const tokenCount = Object.values(boardPositions).filter(p => p === tile.index).length;
            
            return (
              <div
                key={`tile-${tile.index}`}
                style={getTileStyle(tile.index, tile)}
                className="relative select-none"
              >
                <span className="z-10">
                  {isStart ? 'START' : isFinish ? 'FINISH' : tile.index}
                </span>
                
                {tile.type === TILE_TYPES.BONUS && (
                  <span className="absolute top-1 right-1 text-xs font-bold text-green-400">+{tile.move}</span>
                )}
                {tile.type === TILE_TYPES.PENALTY && (
                  <span className="absolute top-1 right-1 text-xs font-bold text-red-400">{tile.move}</span>
                )}
                
                {tokenCount > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    {Object.entries(boardPositions)
                      .filter(([, pos]) => pos === tile.index)
                      .map(([teamId], i) => {
                        const teamNum = parseInt(teamId.replace('team', ''), 10);
                        const color = tokenColors[teamNum - 1];
                        const count = Object.values(boardPositions).filter(p => p === tile.index).length;
                        const offsetX = (i % 2 === 0 ? -1 : 1) * 8 * Math.floor(i / 2 + 0.5);
                        const offsetY = (i % 3 === 0 ? -1 : 1) * 8 * Math.floor(i / 3 + 0.5);
                        
                        return (
                          <StickmanToken
                            key={teamId}
                            color={color}
                            size={28}
                            teamNumber={teamNum}
                            style={{
                              position: 'absolute',
                              transform: `translate(${offsetX}px, ${offsetY}px)`,
                              zIndex: 10 - i,
                            }}
                          />
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <span className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }}></span>
          Bonus
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <span className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }}></span>
          Penalty
        </div>
      </div>
    </div>
  );
}