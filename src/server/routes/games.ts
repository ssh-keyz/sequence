import { Router, Request, Response, NextFunction } from 'express';
import { check, validationResult } from 'express-validator';
import { GameModel } from '../models/game';
import { authenticate } from '../middleware/auth';

const router = Router();

// Validation middleware
const gameValidation = [
  check('position').isObject().withMessage('Position must be an object'),
  check('position.x').isInt({ min: 0, max: 9 }).withMessage('X position must be between 0 and 9'),
  check('position.y').isInt({ min: 0, max: 9 }).withMessage('Y position must be between 0 and 9'),
  check('cardId').isString().notEmpty().withMessage('Card ID is required')
];

// Create a new game
router.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const game = await GameModel.create(req.user!.id);
    res.status(201).json(game);
  } catch (err) {
    next(err);
  }
});

// Join a game
router.post('/:id/join', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gameState = await GameModel.join(req.params.id, req.user!.id);
    res.json(gameState);
  } catch (err) {
    next(err);
  }
});

// Start a game
router.post('/:id/start', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gameState = await GameModel.start(req.params.id);
    res.json(gameState);
  } catch (err) {
    next(err);
  }
});
// Make a move
router.post('/:id/play', authenticate, gameValidation, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { position, cardId } = req.body;
    const gameState = await GameModel.makeMove(req.params.id, req.user!.id, cardId, position);
    res.json(gameState);
  } catch (err) {
    next(err);
  }
});

// Get game state
router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gameState = await GameModel.getState(req.params.id);
    res.json(gameState);
  } catch (err) {
    next(err);
  }
});

// List available games
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const games = await GameModel.listGames();
    res.json(games);
  } catch (err) {
    next(err);
  }
});

export default router;
