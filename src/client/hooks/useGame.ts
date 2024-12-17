import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameState, Card, Position } from '../types/game';
import { ApiError } from '../types/api';

interface UseGameReturn {
  loading: boolean;
  error: string | null;
  gameState: GameState | null;
  createGame: () => Promise<void>;
  joinGame: (gameId: string) => Promise<void>;
  playCard: (card: Card, position: Position) => Promise<void>;
}

export const useGame = (): UseGameReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const navigate = useNavigate();

  const handleError = (err: unknown) => {
    if (err instanceof ApiError) {
        setError(err instanceof Error ? err.message : 'error');
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError('An unexpected error occurred');
    }
    setLoading(false);
  };

  const createGame = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new ApiError('Failed to create game', response.status);
      }
      
      const data = await response.json();
      navigate(`/game/${data.id}`);
    } catch (err) {
      handleError(err);
    }
  }, [navigate]);

  const joinGame = useCallback(async (gameId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/games/${gameId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new ApiError('Failed to join game', response.status);
      }

      const data = await response.json();
      setGameState(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const playCard = useCallback(async (card: Card, position: Position) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/games/${gameState?.id}/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: card.id, position }),
      });

      if (!response.ok) {
        throw new ApiError('Failed to play card', response.status);
      }

      const data = await response.json();
      setGameState(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [gameState?.id]);

  return {
    loading,
    error,
    gameState,
    createGame,
    joinGame,
    playCard,
  };
};

export default useGame; 