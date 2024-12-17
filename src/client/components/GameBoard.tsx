import React from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Position, GameState } from '../../server/models/game';
import { BOARD_SIZE, CORNER_POSITIONS } from '../../server/constants/gameConfig';

interface GameBoardProps {
  gameState: GameState;
  onPlaceChip: (position: Position, card: Card) => void;
  selectedCard: Card | null;
  currentPlayerId: string;
  lastMove: { position: Position; color: string } | null;
}

interface CellProps {
  isCorner: boolean;
  isHighlighted: boolean;
}

interface ChipProps {
  color: string;
  isLastMove: boolean;
}

interface SuitSymbolProps {
  color: string;
}

const BoardContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(${BOARD_SIZE}, 1fr);
  gap: 2px;
  padding: 16px;
  background-color: #2c3e50;
  border-radius: 8px;
  max-width: 800px;
  margin: 0 auto;
`;

const Cell = styled(motion.div)<CellProps>`
  aspect-ratio: 1;
  background-color: ${({ isCorner }) => isCorner ? '#34495e' : '#fff'};
  border: 2px solid ${({ isHighlighted }) => isHighlighted ? '#f1c40f' : '#34495e'};
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: ${({ isHighlighted }) => isHighlighted ? 'pointer' : 'default'};
  position: relative;
  transition: border-color 0.2s ease;

  &:hover {
    transform: ${({ isHighlighted }) => isHighlighted ? 'scale(1.05)' : 'none'};
  }
`;

const CardInfo = styled(motion.div)`
  text-align: center;
  font-size: 0.8em;
`;

const Chip = styled(motion.div)<ChipProps>`
  width: 80%;
  height: 80%;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  position: absolute;
  top: 10%;
  left: 10%;
  box-shadow: ${({ isLastMove }) => isLastMove ? '0 0 10px #f1c40f' : '0 2px 4px rgba(0, 0, 0, 0.2)'};
`;

const SuitSymbol = styled(motion.span)<SuitSymbolProps>`
  font-size: 1.2em;
  color: ${({ color }) => color};
`;

const getSuitSymbol = (suit: string): { symbol: string; color: string } => {
  switch (suit) {
    case 'hearts': return { symbol: '♥', color: '#e74c3c' };
    case 'diamonds': return { symbol: '♦', color: '#e74c3c' };
    case 'clubs': return { symbol: '♣', color: '#2c3e50' };
    case 'spades': return { symbol: '♠', color: '#2c3e50' };
    default: return { symbol: '', color: '#000' };
  }
};

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  onPlaceChip,
  selectedCard,
  currentPlayerId,
  lastMove
}) => {
  const isCurrentPlayer = gameState.players[gameState.currentPlayerIndex].id === currentPlayerId;

  const canPlaceChip = (position: Position, card: Card | null): boolean => {
    if (!isCurrentPlayer || !selectedCard || !card) return false;
    
    // Check if it's a corner
    if (CORNER_POSITIONS.some(pos => pos.x === position.x && pos.y === position.y)) {
      return true;
    }

    // Check if position is already taken
    if (gameState.chips[position.y][position.x]) return false;

    // Handle Jacks
    if (selectedCard.value === 'J') {
      if (selectedCard.suit === 'hearts' || selectedCard.suit === 'diamonds') {
        // One-eyed Jack (remove chip)
        return gameState.chips[position.y][position.x] !== null;
      } else {
        // Two-eyed Jack (place anywhere)
        return gameState.chips[position.y][position.x] === null;
      }
    }

    // Normal card - must match the board position
    return card.suit === selectedCard.suit && card.value === selectedCard.value;
  };

  const handleCellClick = (position: Position, card: Card | null): void => {
    if (!selectedCard || !canPlaceChip(position, card)) return;
    onPlaceChip(position, selectedCard);
  };

  const isLastMove = (x: number, y: number): boolean => {
    return !!(lastMove && lastMove.position.x === x && lastMove.position.y === y);
  };

  return (
    <BoardContainer
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {gameState.board.map((row, y) =>
        row.map((card, x) => {
          const position = { x, y };
          const isCorner = CORNER_POSITIONS.some(pos => pos.x === x && pos.y === y);
          const chip = gameState.chips[y][x];
          const isHighlighted = selectedCard !== null && canPlaceChip(position, card);
          const suitInfo = card ? getSuitSymbol(card.suit) : { symbol: '', color: '#000' };

          return (
            <Cell
              key={`${x}-${y}`}
              isCorner={isCorner}
              isHighlighted={isHighlighted}
              onClick={() => handleCellClick(position, card)}
              whileHover={isHighlighted ? { scale: 1.05 } : {}}
              whileTap={isHighlighted ? { scale: 0.95 } : {}}
            >
              <AnimatePresence mode="wait">
                {chip ? (
                  <Chip
                    key={`chip-${x}-${y}`}
                    color={chip}
                    isLastMove={isLastMove(x, y)}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30
                    }}
                    whileHover={{ scale: 1.1 }}
                  />
                ) : (
                  card && (
                    <CardInfo
                      key={`card-${x}-${y}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div
                        initial={{ y: -10 }}
                        animate={{ y: 0 }}
                      >
                        {card.value}
                      </motion.div>
                      <SuitSymbol
                        color={suitInfo.color}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        {suitInfo.symbol}
                      </SuitSymbol>
                    </CardInfo>
                  )
                )}
              </AnimatePresence>
            </Cell>
          );
        })
      )}
    </BoardContainer>
  );
};

export default GameBoard; 