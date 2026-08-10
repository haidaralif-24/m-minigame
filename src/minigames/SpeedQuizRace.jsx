import { useState } from 'react';
import { TEAM_KEYS, TEAM_NAMES } from '../data/constants.js';

export default function SpeedQuizRace({ teams, onComplete }) {
  const [answers, setAnswers] = useState({});

  const submit = (teamId, correct) => {
    const updated = { ...answers, [teamId]: { correct, time: Date.now() } };
    setAnswers(updated);
    if (Object.keys(updated).length === 6) {
      const results = TEAM_KEYS.map((id) => ({
        teamId: id,
        score: updated[id]?.correct ? 6 - TEAM_KEYS.indexOf(id) : 0,
      }));
      onComplete(results);
    }
  };

  return (
    <div className="p-8 text-white text-center">
      <h2 className="text-2xl font-black mb-6">Speed Quiz Race</h2>
      <div className="grid grid-cols-3 gap-4">
        {TEAM_KEYS.map((k) => (
          <button
            key={k}
            onClick={() => submit(k, Math.random() > 0.5)}
            className="bg-slate-800 p-4 rounded-xl hover:bg-slate-700"
          >
            {TEAM_NAMES[TEAM_KEYS.indexOf(k)]}
          </button>
        ))}
      </div>
    </div>
  );
}
