import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HOST_PIN, TEAM_KEYS } from '../data/constants.js';

export default function LobbyPage() {
  const [input, setInput] = useState('');
  const [role, setRole] = useState(null); // 'host' | 'team'
  const [teamIndex, setTeamIndex] = useState(0);
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (input === HOST_PIN) {
      setRole('host');
      navigate('/host');
    } else if (TEAM_KEYS.includes(input)) {
      setRole('team');
      setTeamIndex(TEAM_KEYS.indexOf(input));
      navigate('/play');
    } else {
      alert('Invalid password');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="bg-[#1e293b]/80 backdrop-blur-sm rounded-3xl p-10 border border-slate-700/40 max-w-md w-full shadow-[0_0_60px_rgba(6,182,212,0.15)]">
        <h1 className="text-3xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">Maulid Board</h1>
        <p className="text-center text-slate-400 mb-8">Waiting lobby — enter your access key</p>

        <div className="space-y-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.toLowerCase())}
            placeholder="Enter password..."
            className="w-full px-5 py-4 rounded-2xl bg-[#0f172a] border border-slate-600 text-white placeholder:text-slate-600 text-lg focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all text-center tracking-widest"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xl py-4 rounded-2xl hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all active:scale-[0.98]"
          >
            Enter
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700/40 grid grid-cols-3 gap-3 text-xs text-slate-500 text-center">
          <div>Host: <span className="text-cyan-300">dadarzz</span></div>
          <div>Team: <span className="text-amber-300">one-six</span></div>
          <div>Board locked until start</div>
        </div>
      </div>
    </div>
  );
}