import {
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase.js';
import { getInitialGameState, MAX_PLAYERS } from './gameLogic.js';

const ROOMS = 'rooms';
const SESSION_KEY = 'maulid-player-session';

const makeCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const makeId = () => crypto.randomUUID();

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export async function createRoom(hostName = 'Host') {
  let code = makeCode();
  let ref = doc(db, ROOMS, code);
  let snapshot = await getDoc(ref);
  while (snapshot.exists()) {
    code = makeCode();
    ref = doc(db, ROOMS, code);
    snapshot = await getDoc(ref);
  }

  const hostId = makeId();
  const state = getInitialGameState();
  const room = {
    ...state,
    phase: 'lobby',
    hostId,
    hostName: hostName.trim() || 'Host',
    maxPlayers: MAX_PLAYERS,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(ref, room);
  const session = { roomCode: code, playerId: hostId, role: 'host', name: room.hostName };
  return saveSession(session);
}

export async function joinRoom(roomCode, name, pin) {
  const code = roomCode.trim().toUpperCase();
  const cleanName = name.trim();
  if (!code || !cleanName || !pin) throw new Error('Room code, username and password are required.');

  const ref = doc(db, ROOMS, code);
  const playerId = makeId();
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) throw new Error('Room not found.');
    const room = snapshot.data();
    if (room.phase !== 'lobby') throw new Error('The game has already started.');
    const players = room.players || {};
    if (Object.keys(players).length >= (room.maxPlayers || MAX_PLAYERS)) throw new Error('This room is full.');
    if (Object.values(players).some((p) => p.name?.toLowerCase() === cleanName.toLowerCase())) {
      throw new Error('That username is already taken.');
    }
    transaction.update(ref, {
      [`players.${playerId}`]: {
        id: playerId,
        name: cleanName,
        pin,
        score: 0,
        position: 0,
        connected: true,
        joinedAt: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    });
  });
  return saveSession({ roomCode: code, playerId, role: 'player', name: cleanName });
}

export function subscribeToRoom(roomCode, callback, onError) {
  return onSnapshot(doc(db, ROOMS, roomCode), (snapshot) => {
    callback(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
  }, onError);
}

export async function updateRoom(roomCode, updates) {
  await updateDoc(doc(db, ROOMS, roomCode), { ...updates, updatedAt: serverTimestamp() });
}

export async function updatePlayer(roomCode, playerId, updates) {
  await updateDoc(doc(db, ROOMS, roomCode), {
    [`players.${playerId}`]: updates,
    updatedAt: serverTimestamp(),
  });
}

export async function leaveRoom(roomCode, playerId) {
  const ref = doc(db, ROOMS, roomCode);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return;
  const players = { ...(snapshot.data().players || {}) };
  if (players[playerId]) players[playerId] = { ...players[playerId], connected: false };
  await updateDoc(ref, { players, updatedAt: serverTimestamp() });
}
