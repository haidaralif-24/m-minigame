import StickmanToken from './StickmanToken.jsx';
import { TOKEN_COLORS } from '../data/constants.js';

export default function Leaderboard({ boardPositions }) {
  const rankings = Object.entries(boardPositions)
    .map(([teamId, position]) => ({
      teamId,
      teamNum: parseInt(teamId.replace('team', ''), 10),
      position,
      color: TOKEN_COLORS[parseInt(teamId.replace('team', ''), 10) - 1],
    }))
    .sort((a, b) => b.position - a.position);

  return (
    <div className="bg-[#1e293b]/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      <h3 className="text-xl font-bold text-white mb-4 text-glow">Leaderboard</h3>
      <div className="space-y-3">
        {rankings.map(({ teamId, teamNum, position, color }, i) => (
          <div
            key={teamId}
            className="flex items-center gap-3 p-3 rounded-xl bg-[#0f172a]/80 border border-slate-700/30 hover:border-slate-500/50 transition-colors"
          >
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#334155] text-sm font-bold text-slate-300">{i + 1}</span>
            <StickmanToken color={color} size={24} teamNumber={teamNum} />
            <span className="font-semibold text-white">Team {teamNum}</span>
            <span className="ml-auto text-sm font-mono text-slate-400">Tile {position}</span>
          </div>
        ))}
      </div>
    </div>
  );
}