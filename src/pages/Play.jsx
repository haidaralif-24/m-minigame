import { useState } from 'react';
import { TEAM_KEYS, TEAM_NAMES, TOKEN_COLORS, ACTIVE_META } from '../data/constants.js';
import { useGameState } from '../hooks/useGameState.js';

export default function PlayPage() {
  const [selectedKey, setSelectedKey] = useState('');
  const [teamName, setTeamName] = useState('');
  const [joined, setJoined] = useState(false);
  const { gameState, loading } = useGameState();

  const handleJoin = () => {
    if (TEAM_KEYS.includes(selectedKey)) {
      const idx = TEAM_KEYS.indexOf(selectedKey);
      setTeamName(TEAM_NAMES[idx]);
      setJoined(true);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-slate-400">Loading...</div>;

  if (!joined) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="bg-[#1e293b]/60 backdrop-blur-sm rounded-3xl p-10 max-w-sm w-full border border-slate-700/40">
          <h2 className="text-2xl font-black text-white mb-6 text-center">Select Your Team</h2>
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="w-full px-4 py-4 rounded-xl bg-[#0f172a] border border-slate-600 text-white focus:outline-none focus:border-cyan-400 mb-6 text-center text-lg"
          >
            <option value="">-- Pick team --</option>
            {TEAM_KEYS.map((k, i) => (
              <option key={k} value={k}>{TEAM_NAMES[i]} ({k})</option>
            ))}
          </select>
          <button
            onClick={handleJoin}
            disabled={!TEAM_KEYS.includes(selectedKey)}
            className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold py-4 rounded-2xl hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Join
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400 mb-2">{teamName}</h1>
        <p className="text-slate-400">Team lobby — waiting for host to start</p>
      </header>

      <div className="max-w-md mx-auto bg-[#1e293b]/60 rounded-3xl p-8 border border-slate-700/40 text-center">
        {gameState?.phase === 'lobby' ? (
          <>
            <div className="text-6xl mb-4 animate-pulse">⏳</div>
            <h3 className="text-xl font-bold text-white mb-2">Waiting...</h3>
            <p className="text-slate-400">The host has not started the game yet.</p>
          </>
        ) : (
          <>
            <h3 className="text-xl font-bold text-green-400 mb-2">Game Active</h3>
            <p className="text-slate-400">Phase: {gameState?.phase}</p>
          </>
        )}
      </div>
    </div>
  );
}