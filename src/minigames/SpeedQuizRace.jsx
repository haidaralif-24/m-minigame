import { useState } from 'react';

export default function SpeedQuizRace({ players = {}, onComplete }) {
  const [results, setResults] = useState({});
  const entries = Object.values(players);
  const submit = (playerId) => {
    if (results[playerId]) return;
    const next = { ...results, [playerId]: Object.keys(results).length + 1 };
    setResults(next);
    if (Object.keys(next).length === entries.length && onComplete) {
      onComplete(Object.entries(next).sort((a, b) => a[1] - b[1]).map(([playerId, rank]) => ({ playerId, rank })));
    }
  };
  return <div className="p-8 text-white text-center"><h2 className="text-2xl font-black mb-6">Speed Quiz Race</h2><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{entries.map((player)=><button key={player.id} disabled={Boolean(results[player.id])} onClick={()=>submit(player.id)} className="bg-slate-800 p-4 rounded-xl hover:bg-slate-700 disabled:opacity-40"><div className="font-bold">{player.name}</div><div className="text-slate-400">{results[player.id]?`#${results[player.id]}`:'Finish'}</div></button>)}</div></div>;
}
