import { useState } from 'react';
import { HOST_PIN } from '../data/constants.js';
import Dice from './Dice.jsx';
import { moveToken, nextTurn, getActiveTeamId } from '../services/gameLogic.js';

export default function HostControls({ gameState, onUpdate }) {
  const [pinInput, setPinInput] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [rollResult, setRollResult] = useState(null);
  const [tileResult, setTileResult] = useState(null);

  const handlePinSubmit = () => {
    if (pinInput === HOST_PIN) setAuthenticated(true);
  };

  const handleRoll = async (diceValue) => {
    setRollResult(diceValue);
    const activeTeamId = getActiveTeamId(gameState);
    const result = moveToken(gameState, diceValue);
    setTileResult(result);
    
    await onUpdate({
      boardPositions: result.boardPositions,
      lastRoll: { value: diceValue, teamId: activeTeamId },
      ...(result.winner ? { winner: result.winner, phase: 'finished' } : {}),
    });
    
    setTimeout(() => setTileResult(null), 3000);
  };

  const handleNextTurn = async () => {
    if (tileResult?.winner) return; // Don't advance after win
    const updates = nextTurn(gameState);
    await onUpdate({
      ...updates,
      lastRoll: null,
    });
    setRollResult(null);
  };

  const activeTeamId = getActiveTeamId(gameState);
  const activeTeamNum = parseInt(activeTeamId?.replace('team', ''), 10);

  if (!authenticated) {
    return (
      <div className="bg-[#1e293b]/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Host Login</h2>
        <input
          type="password"
          value={pinInput}
          onChange={(e) => setPinInput(e.target.value)}
          placeholder="Enter host PIN"
          className="w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-slate-600 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 mb-4"
          onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
        />
        <button
          onClick={handlePinSubmit}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
        >
          Unlock Host Controls
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#1e293b]/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      <h2 className="text-xl font-bold text-white mb-4">Host Controls</h2>
      
      <div className="mb-4 p-3 rounded-xl bg-[#0f172a] border border-slate-700">
        <span className="text-sm text-slate-400">Active Team:</span>
        <span className="ml-2 text-lg font-bold text-cyan-400">Team {activeTeamNum}</span>
        <span className="ml-4 text-xs text-slate-500">Turn: {gameState?.round}</span>
      </div>

      {gameState?.winner ? (
        <div className="text-center py-4">
          <h3 className="text-2xl font-black text-orange-400 mb-2">Winner!</h3>
          <p className="text-lg text-white">Team {parseInt(gameState.winner.replace('team', ''), 10)}</p>
        </div>
      ) : (
        <>
          <Dice onRollComplete={handleRoll} />
          
          {rollResult && !tileResult && (
            <button
              onClick={handleNextTurn}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all"
            >
              Confirm Roll (d{rollResult}) → Next Turn
            </button>
          )}
          
          {tileResult && (
            <div className="mt-3 p-3 rounded-xl bg-[#0f172a] border border-slate-600 text-sm">
              <p>Team {parseInt(getActiveTeamId(gameState)?.replace('team', ''), 10)} rolled <span className="text-orange-400 font-bold">{rollResult}</span></p>
              <p>Moved to tile <span className="text-cyan-400 font-bold">{gameState?.boardPositions?.[getActiveTeamId(gameState)]}</span></p>
              {tileResult.bonusMove !== 0 && (
                <p className={tileResult.bonusMove > 0 ? 'text-green-400' : 'text-red-400'}>
                  {tileResult.bonusMove > 0 ? '+' : ''}{tileResult.bonusMove} bonus move
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}