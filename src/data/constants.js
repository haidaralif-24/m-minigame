import meta from '../content/maulid-nabi/meta.json';

export const ACTIVE_EVENT = meta.id;
export const ACTIVE_META = meta;
export const NUM_PLAYERS = 7;
export const MAX_PLAYERS = 7;
export const BOARD_LENGTH = 31;
export const DICE_SIZE = 6;
export const HOST_PIN = 'dadarzz';
export const TOKEN_COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6'];
export const PHASES = { LOBBY: 'lobby', RAPID_SHOT: 'rapid-shot', ORDER_REVEAL: 'order-reveal', BOARD: 'board', FINISHED: 'finished' };
export const TILE_TYPES = { START: 'start', NORMAL: 'normal', BONUS: 'bonus', PENALTY: 'penalty', FINISH: 'finish' };
