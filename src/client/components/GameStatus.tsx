import React from 'react';
import styled from '@emotion/styled';
import { GameState } from '../../server/models/game';

interface GameStatusProps {
  gameState: GameState;
  currentPlayerId: string;
}

interface PlayerItemProps {
  isCurrentPlayer: boolean;
  color: string;
}

interface PlayerNameProps {
  isCurrentPlayer: boolean;
}

const StatusContainer = styled.div`
  background-color: #34495e;
  border-radius: 8px;
  padding: 16px;
  margin: 16px auto;
  max-width: 800px;
  color: #fff;
`;

const StatusHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const GameInfo = styled.div`
  font-size: 1.2em;
  font-weight: bold;
`;

const PlayerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PlayerItem = styled.div<PlayerItemProps>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background-color: ${({ isCurrentPlayer }) => isCurrentPlayer ? '#2c3e50' : 'transparent'};
  border-radius: 4px;
  border-left: 4px solid ${({ color }) => color};
`;

const PlayerChip = styled.div<{ color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
`;

const PlayerName = styled.span<PlayerNameProps>`
  font-weight: ${({ isCurrentPlayer }) => isCurrentPlayer ? 'bold' : 'normal'};
`;

const CardsRemaining = styled.span`
  margin-left: auto;
  color: #bdc3c7;
`;

const DeckInfo = styled.div`
  margin-top: 16px;
  color: #bdc3c7;
  font-size: 0.9em;
`;

const GameStatus: React.FC<GameStatusProps> = ({ gameState, currentPlayerId }) => {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isGameOver = gameState.status === 'completed';
  const winner = gameState.winner 
    ? gameState.players.find(p => p.id === gameState.winner)
    : null;

  return (
    <StatusContainer>
      <StatusHeader>
        <GameInfo>
          {isGameOver ? (
            <span>Game Over - {winner?.username} wins!</span>
          ) : (
            <span>
              {gameState.status === 'waiting' 
                ? 'Waiting for players...' 
                : `${currentPlayer.username}'s turn`}
            </span>
          )}
        </GameInfo>
      </StatusHeader>

      <PlayerList>
        {gameState.players.map((player) => {
          const isCurrentTurn = player.id === currentPlayer.id;
          const isCurrentUser = player.id === currentPlayerId;

          return (
            <PlayerItem
              key={player.id}
              isCurrentPlayer={isCurrentTurn}
              color={player.color}
            >
              <PlayerChip color={player.color} />
              <PlayerName isCurrentPlayer={isCurrentTurn}>
                {player.username} {isCurrentUser && '(You)'}
              </PlayerName>
              <CardsRemaining>
                {player.cards.length} cards
              </CardsRemaining>
            </PlayerItem>
          );
        })}
      </PlayerList>

      <DeckInfo>
        Cards in deck: {gameState.deck.length}
      </DeckInfo>
    </StatusContainer>
  );
};

export default GameStatus; 