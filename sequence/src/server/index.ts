import express from 'express';
import { createServer } from 'http';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { configureSocketIO } from './config/socket';
import { configureRoutes } from './routes';
import configureSession from './config/session';
import mainLobbyRouter from './routes/main-lobby';
import gamesRouter from './routes/games';

const app = express();
const server = createServer(app);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'", "https:", "data:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN
    : 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up view engine
app.set('views', path.join(process.cwd(), 'src', 'views'));
app.set('view engine', 'ejs');

// Serve static files
app.use(express.static(path.join(process.cwd(), 'src', 'public')));

// Configure session
const sessionMiddleware = configureSession(app);

// Configure Socket.IO
const io = configureSocketIO(server);

// Configure routes
app.use('/', mainLobbyRouter);
app.use('/games', gamesRouter);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
