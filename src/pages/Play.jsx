import { useEffect, useState } from 'react';
import { useRoom } from '../hooks/useRoom.js';
import { submitRapidAnswer, markPlayerDisconnected } from '../services/roomService.js';
import { RAPID_QUESTIONS, getActivePlayerId } from '../services/gameLogic.js';
import { TOKEN_COLORS, ACTIVE_META } from '../data/constants.js';

export default function PlayPage() {
  const { room, loading, error, session } = useRoom();
  const [answer, setAnswer] = useState(''); const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  useEffect(() => () => { if(session?.roomCode&&session?.playerId) markPlayerDisconnected(session.roomCode,session.playerId).catch(()=>{}); }, [session?.roomCode,session?.playerId]);
  if (loading) return <div className="min-h-screen bg-[#0f172a] grid place-items-center text-slate-400">Connecting…</div>;
  if (error || !room) return <div className="min-h-screen bg-[#0f172a] grid place-items-center text-red-400">Room unavailable.</div>;
  const players = room.players || {}; const me = players[session.playerId]; const activeId = getActivePlayerId(room); const question = RAPID_QUESTIONS[room.rapidShot?.questionIndex || 0];
  const submitted = Boolean(room.rapidShot?.submitted?.[session.playerId]);
  const sendAnswer = async () => { if(!answer.trim()||submitted)return; setBusy(true);setMessage('');try{await submitRapidAnswer(session.roomCode,session.playerId,answer);setAnswer('');setMessage('Answer submitted!');}catch(err){setMessage(err.message||'Could not submit.');}finally{setBusy(false);} };
  return <div className="min-h-screen bg-[#0f172a] text-white p-4"><header className="max-w-2xl mx-auto text-center mb-6"><h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">{ACTIVE_META.title}</h1><p className="text-slate-400">Room <b className="text-cyan-300 tracking-widest">{session.roomCode}</b> • {me?.name}</p></header><main className="max-w-2xl mx-auto space-y-4">
    <div className="bg-slate-800/80 rounded-3xl p-5 border border-slate-700"><div className="flex justify-between items-center mb-4"><h2 className="font-black text-xl">Players</h2><span className="text-cyan-300">{Object.values(players).filter(p=>p.connected!==false).length}/7</span></div>{Object.values(players).filter(p=>p.connected!==false).map((p,i)=><div key={p.id} className="flex justify-between p-3 rounded-xl bg-slate-900/60 mb-2"><b style={{color:TOKEN_COLORS[i]}}>{p.name}</b><span className="text-slate-500">{p.id===activeId?'ACTIVE':''}</span></div>)}</div>
    {room.phase==='lobby'&&<div className="bg-slate-800/80 rounded-3xl p-8 text-center"><div className="text-6xl mb-4 animate-pulse">⏳</div><h2 className="text-2xl font-black">Waiting for host</h2><p className="text-slate-400 mt-2">Keep this page open. The host will start the rapid-shot round.</p></div>}
    {room.phase==='rapid-shot'&&<div className="bg-slate-800/80 rounded-3xl p-8"><div className="text-cyan-300 font-bold mb-2">RAPID SHOT {room.rapidShot.questionIndex+1}/{RAPID_QUESTIONS.length}</div><h2 className="text-2xl md:text-3xl font-black mb-6">{question.text}</h2><input disabled={submitted||busy} value={answer} onChange={(e)=>setAnswer(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&sendAnswer()} placeholder="Type your answer…" className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-700 text-white mb-3"/><button disabled={submitted||busy||!answer.trim()} onClick={sendAnswer} className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 font-black disabled:opacity-40">{submitted?'ANSWER LOCKED':busy?'SUBMITTING…':'SUBMIT ANSWER'}</button>{message&&<p className="text-center text-cyan-300 mt-3">{message}</p>}</div>}
    {room.phase==='order-reveal'&&<div className="bg-slate-800/80 rounded-3xl p-8"><h2 className="text-3xl font-black mb-4">Your Starting Order</h2>{room.turnOrder.map((id,i)=><div key={id} className={`flex justify-between p-4 rounded-xl mb-2 ${id===session.playerId?'bg-cyan-500/20 border border-cyan-400':''}`}><span>#{i+1} {players[id]?.name}</span><b>{room.rapidShot?.scores?.[id]||0}</b></div>)}</div>}
    {room.phase==='board'&&<div className="bg-slate-800/80 rounded-3xl p-8 text-center"><h2 className="text-3xl font-black">{players[activeId]?.name}'s turn</h2><p className="text-slate-400 mt-2">Watch the host screen for the dice roll.</p>{activeId===session.playerId&&<div className="mt-5 text-amber-300 font-bold">IT'S YOUR TURN!</div>}</div>}
    {room.phase==='finished'&&<div className="bg-slate-800/80 rounded-3xl p-8 text-center"><div className="text-6xl">🏆</div><h2 className="text-3xl font-black text-orange-400 mt-3">{players[room.winner]?.name} wins!</h2></div>}
  </main></div>;
}
