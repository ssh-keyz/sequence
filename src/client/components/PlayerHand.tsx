import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../types/game';

interface PlayerHandProps {
  cards: Card[];
  isCurrentPlayer: boolean;
  onCardSelect: (card: Card) => void;
}

const PlayerHand: React.FC<PlayerHandProps> = ({ cards, isCurrentPlayer, onCardSelect }) => {
  return (
    <motion.div
      className={`fixed bottom-0 left-0 right-0 p-4 bg-white shadow-lg ${
        isCurrentPlayer ? 'border-t-4 border-blue-500' : 'border-t-4 border-gray-300'
      }`}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex justify-center gap-2 overflow-x-auto pb-2">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            className={`relative cursor-pointer transform hover:scale-105 transition-transform ${
              isCurrentPlayer ? 'hover:shadow-lg' : 'opacity-50'
            }`}
            whileHover={{ y: -10 }}
            onClick={() => isCurrentPlayer && onCardSelect(card)}
          >
            <img
              src={`/cards/${card.suit}_${card.value}.png`}
              alt={`${card.value} of ${card.suit}`}
              className="w-24 h-36 rounded-lg shadow"
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PlayerHand; 