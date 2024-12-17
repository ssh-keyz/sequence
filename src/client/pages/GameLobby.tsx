import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import { ApiError } from '../types/api';

interface Game {
  id: string;
  playerCount: number;
  status: string;
  createdAt: Date;
}

const GameLobby: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/games');
      if (!response.ok) {
        throw new ApiError('Failed to fetch games', response.status);
      }
      const data = await response.json();
      setGames(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch games');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGame = async () => {
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new ApiError('Failed to create game', response.status);
      }

      const data = await response.json();
      navigate(`/game/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game');
    }
  };

  const handleJoinGame = async (gameId: string) => {
    try {
      const response = await fetch(`/api/games/${gameId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new ApiError('Failed to join game', response.status);
      }

      navigate(`/game/${gameId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join game');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Game Lobby</h1>
      
      {error && <ErrorMessage message={error} />}

      <button
        onClick={handleCreateGame}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-8"
      >
        Create New Game
      </button>

      <div className="grid gap-4">
        {games.map((game) => (
          <div
            key={game.id}
            className="bg-white p-4 rounded shadow flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">Game #{game.id.slice(0, 8)}</div>
              <div className="text-sm text-gray-600">
                Players: {game.playerCount}/4
              </div>
              <div className="text-sm text-gray-600">
                Status: {game.status}
              </div>
            </div>
            <button
              onClick={() => handleJoinGame(game.id)}
              disabled={game.status !== 'waiting' || game.playerCount >= 4}
              className={`px-4 py-2 rounded ${
                game.status === 'waiting' && game.playerCount < 4
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Join Game
            </button>
          </div>
        ))}
        {games.length === 0 && (
          <div className="text-center text-gray-600">
            No games available. Create one to get started!
          </div>
        )}
      </div>
    </div>
  );
};

export default GameLobby; 