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

// GET register page
router.get('/register', (_req: Request, res: Response) => {
  res.render('auth/register', { title: 'Register' });
});

// GET login page
router.get('/login', (_req: Request, res: Response) => {
  res.render('auth/login', { title: 'Login' });
});

// Register route
router.post('/register', registerValidation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.headers.accept?.includes('application/json')) {
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
      const error = 'Authentication failed after registration';
      if (req.headers.accept?.includes('application/json')) {
        res.status(500).json({ error });
      } else {
        res.render('auth/register', { 
          title: 'Register',
          error,
          values: req.body
        });
      }
      return;
    }

    if (req.headers.accept?.includes('application/json')) {
      res.status(201).json({ token: auth.token, refreshToken: auth.refreshToken });
    } else {
      req.session.user = auth.user;
      res.redirect('/');
    }
  } catch (err) {
    next(err);
  }
});

// Login route
router.post('/login', loginValidation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.headers.accept?.includes('application/json')) {
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
      const error = 'Invalid credentials';
      if (req.headers.accept?.includes('application/json')) {
        res.status(401).json({ error });
      } else {
        res.render('auth/login', { 
          title: 'Login',
          error,
          values: req.body
        });
      }
      return;
    }

    if (req.headers.accept?.includes('application/json')) {
      res.json({ token: auth.token, refreshToken: auth.refreshToken });
    } else {
      req.session.user = auth.user;
      res.redirect('/');
    }
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
