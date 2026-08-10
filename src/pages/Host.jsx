import { useEffect } from 'react';
import { useGameState } from '../hooks/useGameState.js';
import Board from '../components/Board.jsx';
import Leaderboard from '../components/Leaderboard.jsx';
import HostControls from '../components/HostControls.jsx';
import { getInitialGameState } from '../services/gameLogic.js';
import { TOKEN_COLORS, TEAM_NAMES } from '../data/constants.js';

export default function HostPage() {
  const { gameState, loading, error, updateGameState } = useGameState();

  useEffect(() => {
    if (gameState && !gameState.turnOrder) {
      updateGameState(getInitialGameState());
    }
  }, [gameState]);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-400">Error: {error.message}</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2 tracking-tight">
          Maulid Board
        </h1>
        <p className="text-slate-400">Host View — Team 1-6 Snake Board</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
        <div className="flex-1 flex justify-center">
          <Board 
            boardPositions={gameState?.boardPositions || {}} 
            tokenColors={TOKEN_COLORS}
          />
        </div>
        
        <div className="w-full lg:w-80 space-y-6">
          <Leaderboard boardPositions={gameState?.boardPositions || {}} />
          <HostControls gameState={gameState} onUpdate={updateGameState} />
        </div>
      </div>
    </div>
  );
}