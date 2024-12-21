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

// Helper to determine if request is API
const isApiRequest = (req: Request): boolean => {
  return req.path.startsWith('/api/') || Boolean(req.headers.accept?.includes('application/json'));
};

// GET login page
router.get('/login', (_req: Request, res: Response) => {
  res.render('auth/login', { 
    title: 'Login',
    error: null,
    values: {}
  });
});

// GET register page
router.get('/register', (_req: Request, res: Response) => {
  res.render('auth/register', { 
    title: 'Register',
    error: null,
    values: {}
  });
});

// POST login
router.post('/login', loginValidation, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (isApiRequest(req)) {
        res.status(400).json({ errors: errors.array() });
      } else {
        res.render('auth/login', {
          title: 'Login',
          error: errors.array()[0].msg,
          values: req.body
        });
      }
      return;
    }

    const { email, password } = req.body;
    const auth = await UserModel.authenticate({ email, password });
    
    if (!auth) {
      if (isApiRequest(req)) {
        res.status(401).json({ error: 'Invalid credentials' });
      } else {
        res.render('auth/login', {
          title: 'Login',
          error: 'Invalid credentials',
          values: req.body
        });
      }
      return;
    }

    if (isApiRequest(req)) {
      res.json(auth);
    } else {
      res.redirect('/lobby');
    }
  } catch (err) {
    next(err);
  }
});

// POST register
router.post('/register', registerValidation, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (isApiRequest(req)) {
        res.status(400).json({ errors: errors.array() });
      } else {
        res.render('auth/register', {
          title: 'Register',
          error: errors.array()[0].msg,
          values: req.body
        });
      }
      return;
    }

    const { username, email, password } = req.body;
    const user = await UserModel.create({ username, email, password });
    const auth = await UserModel.authenticate({ email, password });
    
    if (!auth) {
      if (isApiRequest(req)) {
        res.status(500).json({ error: 'Authentication failed after registration' });
      } else {
        res.render('auth/register', {
          title: 'Register',
          error: 'Authentication failed after registration',
          values: req.body
        });
      }
      return;
    }

    if (isApiRequest(req)) {
      res.status(201).json(auth);
    } else {
      res.redirect('/lobby');
    }
  } catch (err) {
    next(err);
  }
});

// API-only routes
router.post('/refresh', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token required' });
      return;
    }

    const result = await UserModel.refreshToken(refreshToken);
    if (!result) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await UserModel.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const { password_hash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    next(err);
  }
});

export default router;
