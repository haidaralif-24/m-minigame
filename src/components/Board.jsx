import { useMemo } from 'react';
import boardTiles from '../data/boardTiles.json';
import { TILE_TYPES } from '../data/constants.js';
import StickmanToken from './StickmanToken.jsx';

const TILE_SIZE = 64;
const PATH_POINTS = [{x:60,y:40},{x:160,y:50},{x:260,y:45},{x:360,y:70},{x:440,y:60},{x:520,y:100},{x:540,y:200},{x:460,y:240},{x:360,y:230},{x:260,y:260},{x:180,y:240},{x:120,y:190},{x:80,y:120},{x:160,y:110},{x:260,y:130},{x:340,y:150},{x:420,y:140},{x:500,y:170},{x:540,y:260},{x:480,y:310},{x:380,y:300},{x:280,y:320},{x:200,y:290},{x:120,y:300},{x:60,y:260},{x:100,y:180},{x:200,y:160},{x:300,y:180},{x:400,y:200},{x:480,y:220},{x:520,y:300}];
const getPoint = (index) => PATH_POINTS[index % PATH_POINTS.length];
function getTileStyle(tile) { const base={width:TILE_SIZE,height:TILE_SIZE,borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,position:'absolute',border:'3px solid',boxShadow:'0 4px 12px rgba(0,0,0,.35)'}; if(tile.type===TILE_TYPES.START)return{...base,background:'#06b6d4',borderColor:'#22d3ee',color:'#fff'}; if(tile.type===TILE_TYPES.FINISH)return{...base,background:'#f97316',borderColor:'#fb923c',color:'#fff'}; if(tile.type===TILE_TYPES.BONUS)return{...base,background:'#86efac',borderColor:'#22c55e',color:'#14532d'}; if(tile.type===TILE_TYPES.PENALTY)return{...base,background:'#fca5a5',borderColor:'#ef4444',color:'#7f1d1d'}; return{...base,background:'#f8fafc',borderColor:'#94a3b8',color:'#334155'}; }

export default function Board({ boardPositions = {}, tokenColors = [], players = {} }) {
  const tiles = useMemo(() => boardTiles, []);
  const playerIds = Object.keys(players);
  return <div className="relative rounded-3xl overflow-hidden shadow-2xl w-full min-h-[620px]" style={{background:'#dbeafe'}}>
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none"><defs><linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#bae6fd"/><stop offset="100%" stopColor="#e0f2fe"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#skyGrad)"/><ellipse cx="200" cy="350" rx="180" ry="60" fill="#86efac" opacity=".9"/><ellipse cx="480" cy="340" rx="140" ry="50" fill="#86efac" opacity=".8"/>{PATH_POINTS.slice(1).map((pt,i)=><line key={i} x1={PATH_POINTS[i].x} y1={PATH_POINTS[i].y} x2={pt.x} y2={pt.y} stroke="#fde047" strokeWidth="6" strokeLinecap="round" strokeDasharray="8 4"/>)}</svg>
    {tiles.map((tile,index)=>{const pt=getPoint(index);const tokens=Object.entries(boardPositions).filter(([,pos])=>pos===index);return <div key={index} style={{...getTileStyle(tile),left:pt.x-TILE_SIZE/2,top:pt.y-TILE_SIZE/2}}><span>{tile.type===TILE_TYPES.START?'GO':tile.type===TILE_TYPES.FINISH?'END':index}</span>{tile.move&&<span className="absolute top-1 right-1 text-[9px]">{tile.move>0?'+':''}{tile.move}</span>}{tokens.map(([playerId],i)=>{const playerIndex=playerIds.indexOf(playerId);const color=tokenColors[playerIndex>=0?playerIndex:i]||'#0f172a';return <StickmanToken key={playerId} color={color} size={28} teamNumber={playerIndex+1} style={{position:'absolute',transform:`translate(${i%2?10:-10}px,${i%3?8:-8}px)`}}/>;})}</div>;})}
  </div>;
}
