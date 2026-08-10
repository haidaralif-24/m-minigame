import { useGameState } from '../hooks/useGameState.js';
import Board from '../components/Board.jsx';
import Leaderboard from '../components/Leaderboard.jsx';
import { TOKEN_COLORS, ACTIVE_META } from '../data/constants.js';

export default function BoardPage() {
  const { gameState, loading, error } = useGameState();

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-slate-400">Connecting...</div>;
  if (error) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-red-400">Connection error</div>;

  if (gameState?.phase === 'lobby') {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-6xl font-black text-slate-600 mb-4">⏳</h1>
        <h2 className="text-3xl font-bold text-white mb-2">Waiting for Host</h2>
        <p className="text-slate-400 text-lg">The game has not started yet. The host will unlock the board.</p>
      </div>
    );
  }

  const activeTeamId = gameState?.turnOrder?.[gameState?.activeTeamIndex];
  const activeTeamNum = parseInt(activeTeamId?.replace('team', ''), 10);

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2 tracking-tight">
          {ACTIVE_META.title}
        </h1>
        <p className="text-slate-400">Spectator / Projector View</p>
        <div className="mt-4 inline-block px-4 py-2 rounded-full bg-[#0f172a] border border-cyan-500/30 text-cyan-300 font-bold">
          Round {gameState?.round || 1} — Active: Team {activeTeamNum || '?'}
        </div>
      </header>

      <div className="relative w-full h-screen overflow-hidden">
        <Board 
          boardPositions={gameState?.boardPositions || {}} 
          tokenColors={TOKEN_COLORS}
          className="w-full h-full"
        />
      </div>

      {/* Floating widgets */}
      <div className="absolute top-6 right-6 flex flex-col gap-4 z-50">
        <Leaderboard boardPositions={gameState?.boardPositions || {}} />
        
        {gameState?.lastRoll && (
          <div className="bg-[#1e293b]/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50 shadow-2xl w-48">
            <h4 className="text-sm text-slate-400 mb-1">Last Roll</h4>
            <p className="text-2xl font-black text-orange-400">d{gameState.lastRoll.value}</p>
            <p className="text-sm text-white mt-1">Team {parseInt(gameState.lastRoll.teamId?.replace('team', ''), 10)}</p>
          </div>
        )}

        {gameState?.winner && (
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-2xl p-6 border border-orange-400/30 shadow-2xl animate-[pulse-glow_2s_ease-in-out_infinite] w-48 text-center">
            <h3 className="text-3xl font-black text-orange-400 mb-2">WINNER!</h3>
            <p className="text-xl text-white">Team {parseInt(gameState.winner?.replace('team', ''), 10)}</p>
          </div>
        )}
      </div>
    </div>
  );
}