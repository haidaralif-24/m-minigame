import { useEffect, useState } from 'react';
import Board from '../components/Board.jsx';
import Dice from '../components/Dice.jsx';
import { useRoom } from '../hooks/useRoom.js';
import { getActivePlayerId, getRankings, resolveRapidShotOrder, RAPID_QUESTIONS } from '../services/gameLogic.js';
import { updateRoom } from '../services/roomService.js';
import { TOKEN_COLORS, ACTIVE_META } from '../data/constants.js';
import boardTiles from '../data/boardTiles.json';

const GAME_LIBRARY = [{ id: 'speed-quiz-race', name: 'Speed Quiz Race' }];

export default function HostPage() {
  const { room, loading, error, session } = useRoom();
  const [pin, setPin] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [rolling, setRolling] = useState(false);
  useEffect(() => { if (room?.hostId && session?.playerId === room.hostId) setUnlocked(true); }, [room?.hostId, session?.playerId]);
  if (loading) return <div className="min-h-screen bg-[#0f172a] grid place-items-center text-slate-400">Loading room…</div>;
  if (error || !room) return <div className="min-h-screen bg-[#0f172a] grid place-items-center text-red-400">Room unavailable.</div>;
  if (!unlocked) return <div className="min-h-screen bg-[#0f172a] grid place-items-center p-4"><div className="bg-slate-800 p-8 rounded-3xl w-full max-w-sm"><h2 className="text-2xl font-black text-white mb-4">Host PIN</h2><input value={pin} onChange={(e) => setPin(e.target.value)} type="password" className="w-full p-4 rounded-xl bg-slate-900 text-white mb-4"/><button onClick={() => { if (pin === 'dadarzz') setUnlocked(true); }} className="w-full py-4 rounded-xl bg-cyan-500 font-black text-white">Unlock</button></div></div>;

  const players = room.players || {};
  const playerEntries = Object.values(players).filter((p) => p.connected !== false);
  const activeId = getActivePlayerId(room);
  const activePlayer = players[activeId];
  const rankings = getRankings(room, players);
  const update = (updates) => updateRoom(session.roomCode, updates);

  const startRapid = async () => {
    const scores = Object.fromEntries(playerEntries.map((p) => [p.id, 0]));
    await update({ phase: 'rapid-shot', round: 1, turnOrder: [], activePlayerIndex: 0, boardPositions: Object.fromEntries(playerEntries.map((p) => [p.id, 0])), winner: null, rapidShot: { questionIndex: 0, answers: {}, scores, submitted: {} } });
  };
  const advanceRapid = async () => {
    const index = room.rapidShot?.questionIndex || 0;
    if (index < RAPID_QUESTIONS.length - 1) return update({ 'rapidShot.questionIndex': index + 1, 'rapidShot.answers': {}, 'rapidShot.submitted': {} });
    await update({ phase: 'order-reveal', turnOrder: resolveRapidShotOrder(players, room.rapidShot?.scores || {}), activePlayerIndex: 0, round: 1 });
  };
  const beginBoard = () => update({ phase: 'board', activePlayerIndex: 0, round: room.round || 1, lastRoll: null });
  const handleRoll = async (value) => {
    if (rolling || room.phase !== 'board' || !activeId || players[activeId]?.connected === false) return;
    setRolling(true);
    let position = Math.min(30, (room.boardPositions?.[activeId] || 0) + value);
    const tile = boardTiles[position];
    if (tile.type === 'bonus') position = Math.min(30, position + tile.move);
    if (tile.type === 'penalty') position = Math.max(0, position + tile.move);
    const boardPositions = { ...(room.boardPositions || {}), [activeId]: position };
    const winner = position >= 30 ? activeId : null;
    await update({ boardPositions, lastRoll: { value, playerId: activeId }, ...(winner ? { winner, phase: 'finished' } : {}) });
    setTimeout(() => setRolling(false), 500);
  };
  const nextTurn = () => {
    if (room.winner || !room.turnOrder?.length) return;
    const activeIds = room.turnOrder.filter((id) => players[id]?.connected !== false);
    const currentPos = activeIds.indexOf(activeId);
    if (activeIds.length === 0 || currentPos === -1 || currentPos === activeIds.length - 1) {
      const game = GAME_LIBRARY[Math.floor(Math.random() * GAME_LIBRARY.length)];
      return update({ phase: 'minigame', minigame: { id: game.id, name: game.name, results: {}, startedAt: Date.now() } });
    }
    return update({ activePlayerIndex: room.turnOrder.indexOf(activeIds[currentPos + 1]), lastRoll: null });
  };
  const recordMiniGameResult = async (playerId) => {
    const results = { ...(room.minigame?.results || {}) };
    if (results[playerId]) return;
    results[playerId] = Object.keys(results).length + 1;
    if (Object.keys(results).length >= playerEntries.length) {
      const order = Object.entries(results).sort((a, b) => a[1] - b[1]).map(([id]) => id);
      await update({ phase: 'board', round: (room.round || 1) + 1, turnOrder: order, activePlayerIndex: 0, lastRoll: null, minigame: { ...room.minigame, results } });
    } else await update({ 'minigame.results': results });
  };

  return <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-6">
    <header className="max-w-[1500px] mx-auto flex flex-wrap items-center justify-between gap-4 mb-5"><div><h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500">{ACTIVE_META.title}</h1><p className="text-slate-400">Projected Host / Spectator View</p></div><div className="text-right"><div className="text-xs text-slate-400">ROOM CODE</div><div className="text-3xl font-black tracking-[.3em] text-cyan-300">{session.roomCode}</div></div></header>
    <div className="max-w-[1500px] mx-auto grid lg:grid-cols-[1fr_360px] gap-5"><section><Board boardPositions={room.boardPositions} tokenColors={TOKEN_COLORS} players={players}/></section><aside className="space-y-4">
      <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700"><div className="flex justify-between mb-4"><h2 className="font-black text-xl">Players</h2><span className="text-cyan-300 font-bold">{playerEntries.length}/7</span></div>{Object.values(players).map((p, i) => <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl mb-2 ${p.id === activeId ? 'bg-cyan-500/15 border border-cyan-400/40' : 'bg-slate-900/60'} ${p.connected === false ? 'opacity-40' : ''}`}><span><b style={{ color: TOKEN_COLORS[i] }}>{p.name}</b>{p.id === activeId && <small className="ml-2 text-cyan-300">ACTIVE</small>}</span><span className="text-slate-400">{p.connected === false ? 'OFFLINE' : room.boardPositions?.[p.id] || 0}</span></div>)}</div>
      {room.phase === 'lobby' && <div className="bg-slate-800/80 rounded-2xl p-5"><p className="text-slate-400 mb-3">Players join with room code <b className="text-cyan-300">{session.roomCode}</b>.</p><button disabled={!playerEntries.length} onClick={startRapid} className="w-full py-4 rounded-xl bg-emerald-500 font-black disabled:opacity-40">START RAPID SHOT</button></div>}
      {room.phase === 'rapid-shot' && <div className="bg-slate-800/80 rounded-2xl p-5"><div className="text-xs text-cyan-300 font-bold mb-2">RAPID SHOT {room.rapidShot.questionIndex + 1}/{RAPID_QUESTIONS.length}</div><h2 className="text-xl font-black mb-4">{RAPID_QUESTIONS[room.rapidShot.questionIndex].text}</h2><p className="text-slate-400 text-sm mb-4">Submitted: {Object.keys(room.rapidShot.submitted || {}).length}/{playerEntries.length}</p><button onClick={advanceRapid} className="w-full py-3 rounded-xl bg-blue-500 font-bold">{room.rapidShot.questionIndex === RAPID_QUESTIONS.length - 1 ? 'CALCULATE ORDER' : 'NEXT QUESTION'}</button></div>}
      {room.phase === 'order-reveal' && <div className="bg-slate-800/80 rounded-2xl p-5"><h2 className="text-2xl font-black mb-3">Starting Order</h2>{room.turnOrder.map((id, i) => <div key={id} className="flex justify-between p-2"><span>#{i + 1} {players[id]?.name}</span><b>{room.rapidShot?.scores?.[id] || 0}</b></div>)}<button onClick={beginBoard} className="w-full mt-3 py-4 rounded-xl bg-emerald-500 font-black">START BOARD</button></div>}
      {room.phase === 'board' && <div className="bg-slate-800/80 rounded-2xl p-5"><div className="mb-4"><span className="text-slate-400">Round {room.round}</span><h2 className="text-2xl font-black">{activePlayer?.name || '—'}'s turn</h2>{activePlayer?.connected === false && <p className="text-red-300 mt-2">Player offline — advance to the next player.</p>}</div>{activePlayer?.connected !== false ? <Dice onRollComplete={handleRoll} /> : <button onClick={nextTurn} className="w-full py-3 rounded-xl bg-amber-500 font-bold">SKIP OFFLINE PLAYER</button>}{room.lastRoll && <button onClick={nextTurn} className="w-full mt-3 py-3 rounded-xl bg-emerald-500 font-bold">NEXT PLAYER →</button>}</div>}
      {room.phase === 'minigame' && <div className="bg-slate-800/80 rounded-2xl p-5"><div className="text-xs text-amber-300 font-bold">RANDOMIZED GAME LIBRARY</div><h2 className="text-2xl font-black mt-1">{room.minigame?.name}</h2><p className="text-slate-400 text-sm my-3">Click players in finish order. This becomes the next round's dice order.</p>{playerEntries.map((p) => <button key={p.id} disabled={Boolean(room.minigame?.results?.[p.id])} onClick={() => recordMiniGameResult(p.id)} className="w-full flex justify-between p-3 rounded-xl bg-slate-900 hover:bg-slate-700 disabled:opacity-40 mb-2"><span>{p.name}</span><span>{room.minigame?.results?.[p.id] || '—'}</span></button>)}</div>}
      {room.phase === 'finished' && <div className="bg-slate-800/80 rounded-2xl p-6 text-center"><div className="text-5xl mb-3">🏆</div><h2 className="text-3xl font-black text-orange-400">{players[room.winner]?.name} WINS!</h2></div>}
      <div className="bg-slate-800/80 rounded-2xl p-5"><h2 className="font-black mb-3">Leaderboard</h2>{rankings.map((id, i) => <div key={id} className="flex justify-between py-2"><span>#{i + 1} {players[id]?.name}</span><b>{room.boardPositions?.[id] || 0}</b></div>)}</div>
    </aside></div>
  </div>;
}
