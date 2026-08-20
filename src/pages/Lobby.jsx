import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ACTIVE_META } from '../data/constants.js';
import { createRoom, joinRoom } from '../services/roomService.js';

export default function LobbyPage() {
  const [mode, setMode] = useState('join');
  const [roomCode, setRoomCode] = useState('');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoin = async () => {
    setError(''); setBusy(true);
    try { await joinRoom(roomCode, name, pin); navigate('/play'); }
    catch (err) { setError(err.message || 'Unable to join room.'); }
    finally { setBusy(false); }
  };

  const handleHost = async () => {
    setError(''); setBusy(true);
    try { await createRoom(name || 'Host'); navigate('/host'); }
    catch (err) { setError(err.message || 'Unable to create room.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="bg-[#1e293b]/90 rounded-3xl p-8 md:p-10 border border-slate-700/40 max-w-md w-full shadow-2xl">
        <h1 className="text-4xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{ACTIVE_META.title}</h1>
        <p className="text-center text-slate-400 mt-2 mb-8">{ACTIVE_META.tagline}</p>
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#0f172a] rounded-xl mb-6">
          <button onClick={() => setMode('join')} className={`py-3 rounded-lg font-bold ${mode === 'join' ? 'bg-cyan-500 text-white' : 'text-slate-400'}`}>Join Game</button>
          <button onClick={() => setMode('host')} className={`py-3 rounded-lg font-bold ${mode === 'host' ? 'bg-blue-500 text-white' : 'text-slate-400'}`}>Host Game</button>
        </div>
        <div className="space-y-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Username" maxLength={24} className="w-full px-5 py-4 rounded-xl bg-[#0f172a] border border-slate-600 text-white focus:outline-none focus:border-cyan-400" />
          {mode === 'join' && <>
            <input value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase())} placeholder="Room code (e.g. A1B2C3)" maxLength={6} className="w-full px-5 py-4 rounded-xl bg-[#0f172a] border border-slate-600 text-white uppercase tracking-widest text-center focus:outline-none focus:border-cyan-400" />
            <input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Player password / PIN" type="password" maxLength={32} className="w-full px-5 py-4 rounded-xl bg-[#0f172a] border border-slate-600 text-white focus:outline-none focus:border-cyan-400" />
          </>}
          {error && <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 p-3 text-sm">{error}</div>}
          <button disabled={busy || !name.trim() || (mode === 'join' && (!roomCode.trim() || !pin))} onClick={mode === 'join' ? handleJoin : handleHost} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xl py-4 rounded-2xl disabled:opacity-40">
            {busy ? 'Connecting…' : mode === 'join' ? 'JOIN GAME' : 'CREATE ROOM'}
          </button>
        </div>
        <p className="text-center text-xs text-slate-500 mt-6">Up to 7 players per room • Use the room code on every device</p>
      </div>
    </div>
  );
}
