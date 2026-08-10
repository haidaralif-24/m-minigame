import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase.js';
import { getInitialGameState } from '../services/gameLogic.js';

const GAME_STATE_DOC = 'gameState';

export function useGameState() {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const docRef = doc(db, GAME_STATE_DOC);
    
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setGameState(snapshot.data());
      } else {
        // Initialize game state if it doesn't exist
        const initialState = getInitialGameState();
        updateDoc(docRef, initialState).catch(console.error);
        setGameState(initialState);
      }
      setLoading(false);
    }, (err) => {
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateGameState = async (updates) => {
    const docRef = doc(db, GAME_STATE_DOC);
    await updateDoc(docRef, updates);
  };

  return { gameState, loading, error, updateGameState };
}