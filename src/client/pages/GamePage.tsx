import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import GameBoard from '../components/GameBoard';
import PlayerHand from '../components/PlayerHand';
import GameStatus from '../components/GameStatus';
import ChatBox from '../components/ChatBox';
import ErrorMessage from '../components/ErrorMessage';
import { Card, Position, GameState } from '../../server/models/game';
import { useGame } from '../hooks/useGame';

const PageContainer = styled.div`
  padding: 20px;
  min-height: 100vh;
  background-color: #2c3e50;
`;

const GameContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const GameContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ActionButton = styled(motion.button)<{ variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  background-color: ${props => props.variant === 'secondary' ? '#95a5a6' : '#3498db'};
  color: white;
  margin: 8px;

  &:hover {
    background-color: ${props => props.variant === 'secondary' ? '#7f8c8d' : '#2980b9'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NotificationOverlay = styled(motion.div)`
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #2ecc71;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const GamePage: React.FC = () => {
  const { gameState, error, playCard } = useGame();
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  const handleCardSelect = (card: Card) => {
    setSelectedCard(card);
  };

  const handlePositionSelect = (position: Position) => {
    if (selectedCard) {
      playCard(selectedCard, position);
      setSelectedCard(null);
      setSelectedPosition(null);
    } else {
      setSelectedPosition(position);
    }
  };

  if (!gameState) {
    return <div>Loading...</div>;
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isCurrentPlayer = currentPlayer?.id === localStorage.getItem('userId');

  return (
    <div className="relative h-screen bg-gray-100">
      {error && <ErrorMessage message={error} />}
      
      <GameBoard
        gameState={gameState}
        onPlaceChip={handlePositionSelect}
        selectedCard={selectedCard}
        currentPlayerId={localStorage.getItem('userId') || ''}
        lastMove={null}
      />
      
      <GameStatus
        gameState={gameState}
        currentPlayerId={localStorage.getItem('userId') || ''}
      />
      
      <PlayerHand
        cards={currentPlayer?.cards || []}
        isCurrentPlayer={isCurrentPlayer}
        onCardSelect={handleCardSelect}
      />
    </div>
  );
};

export default GamePage; 