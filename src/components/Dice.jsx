import { useState } from 'react';
import { rollDice } from '../services/gameLogic.js';

const PIP_LAYOUT = {
  1: [[2, 2]],
  2: [[0.5, 0.5], [2.5, 2.5]],
  3: [[0.5, 0.5], [1.5, 1.5], [2.5, 2.5]],
  4: [[0.5, 0.5], [2.5, 0.5], [0.5, 2.5], [2.5, 2.5]],
  5: [[0.5, 0.5], [2.5, 0.5], [1.5, 1.5], [0.5, 2.5], [2.5, 2.5]],
  6: [[0.5, 0.5], [2.5, 0.5], [0.5, 1.5], [2.5, 1.5], [0.5, 2.5], [2.5, 2.5]],
};

export default function Dice({ onRollComplete }) {
  const [value, setValue] = useState(1);
  const [rolling, setRolling] = useState(false);

  const handleRoll = () => {
    setRolling(true);
    setTimeout(() => {
      const result = rollDice(6);
      setValue(result);
      setRolling(false);
      if (onRollComplete) onRollComplete(result);
    }, 600);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleRoll}
        disabled={rolling}
        className="bg-gradient-to-br from-orange-400 to-orange-600 text-white px-6 py-3 rounded-xl font-bold text-xl shadow-[0_0_30px_rgba(249,115,22,0.5)] hover:shadow-[0_0_50px_rgba(249,115,22,0.7)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {rolling ? 'Rolling...' : 'Roll Dice'}
      </button>
      <div
        className={`relative w-16 h-16 bg-gradient-to-br from-white/95 to-slate-100 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex items-center justify-center ${rolling ? 'animate-[dice-roll_0.6s_ease-in-out]' : ''}`}
        style={{ perspective: '800px' }}
      >
        <div className="text-4xl font-black text-slate-800">
          {rolling ? '...' : value}
        </div>
        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10" />
      </div>
      <div className="text-sm text-slate-400 font-mono">
        {rolling ? 'Rolling d6...' : `Result: ${value}`}
      </div>
    </div>
  );
}