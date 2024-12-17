import express, { Router, Request, Response, NextFunction } from 'express';
import { check, validationResult } from 'express-validator';
import { UserModel } from '../models/user';
import { authenticate } from '../middleware/auth';

const router = Router();

// Validation middleware
const registerValidation = [
  check('username').notEmpty().trim().escape(),
  check('email').isEmail().normalizeEmail(),
  check('password').isLength({ min: 6 })
];

const loginValidation = [
  check('email').isEmail().normalizeEmail(),
  check('password').notEmpty()
];

// Register route
router.post('/register', registerValidation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { username, email, password } = req.body;
    const user = await UserModel.create({ username, email, password });
    const auth = await UserModel.authenticate({ username, password });
    
    if (!auth) {
      res.status(500).json({ error: 'Authentication failed after registration' });
      return;
    }

    res.status(201).json({ token: auth.token, refreshToken: auth.refreshToken });
  } catch (err) {
    next(err);
  }
});

// Login route
router.post('/login', loginValidation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;
    const user = await UserModel.findByEmail(email);

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const auth = await UserModel.authenticate({ username: user.username, password });
    
    if (!auth) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    res.json({ token: auth.token, refreshToken: auth.refreshToken });
  } catch (err) {
    next(err);
  }
});

// Get current user route
router.get('/me', authenticate, async (req: Request, res: Response) => {
  const user = await UserModel.findById(req.user!.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const { password_hash, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

export default router;
