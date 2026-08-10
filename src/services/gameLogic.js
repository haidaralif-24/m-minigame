import { BOARD_LENGTH, TILE_TYPES, TEAM_IDS } from '../data/constants.js';
import boardTiles from '../data/boardTiles.json';

export function rollDice(sides = 6) {
  return Math.floor(Math.random() * sides) + 1;
}

export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getInitialGameState() {
  const turnOrder = shuffleArray([...TEAM_IDS]);
  const boardPositions = {};
  TEAM_IDS.forEach(id => { boardPositions[id] = 0; });
  
  return {
    phase: 'board',
    round: 1,
    turnOrder,
    activeTeamIndex: 0,
    boardPositions,
    diceSize: 6,
    lastRoll: null,
    winner: null,
  };
}

export function getActiveTeamId(gameState) {
  return gameState.turnOrder[gameState.activeTeamIndex];
}

export function moveToken(gameState, steps) {
  const activeTeamId = getActiveTeamId(gameState);
  let newPosition = gameState.boardPositions[activeTeamId] + steps;
  
  if (newPosition >= BOARD_LENGTH - 1) {
    newPosition = BOARD_LENGTH - 1;
  }
  
  const newBoardPositions = { ...gameState.boardPositions, [activeTeamId]: newPosition };
  const tile = boardTiles[newPosition];
  
  let bonusMove = 0;
  if (tile.type === TILE_TYPES.BONUS) {
    bonusMove = tile.move;
    newPosition = Math.min(BOARD_LENGTH - 1, newPosition + bonusMove);
    newBoardPositions[activeTeamId] = newPosition;
  } else if (tile.type === TILE_TYPES.PENALTY) {
    bonusMove = tile.move;
    newPosition = Math.max(0, newPosition + bonusMove);
    newBoardPositions[activeTeamId] = newPosition;
  }
  
  const winner = newPosition >= BOARD_LENGTH - 1 ? activeTeamId : null;
  
  return {
    boardPositions: newBoardPositions,
    bonusMove,
    tileType: tile.type,
    winner,
  };
}

export function nextTurn(gameState) {
  const nextIndex = (gameState.activeTeamIndex + 1) % gameState.turnOrder.length;
  return {
    activeTeamIndex: nextIndex,
    round: nextIndex === 0 ? gameState.round + 1 : gameState.round,
  };
}

export function getTeamRankings(gameState) {
  const positions = gameState.boardPositions;
  return [...TEAM_IDS].sort((a, b) => positions[b] - positions[a]);
}

export function getTileInfo(index) {
  if (index < 0 || index >= boardTiles.length) return null;
  return boardTiles[index];
}