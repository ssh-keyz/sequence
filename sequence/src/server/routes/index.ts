import express from 'express';
import path from 'path';
import homeRoutes from './home';
import lobbyRoutes from './main-lobby';
import { errorHandler } from '../middleware/error';

export const configureRoutes = (app: express.Express): void => {
  // View routes
  app.use('/', homeRoutes);
  app.use('/lobby', lobbyRoutes);

  // Serve static files
  const staticPath = path.join(__dirname, '../../public');
  app.use(express.static(staticPath));

  // Error handling
  app.use(errorHandler);
};
