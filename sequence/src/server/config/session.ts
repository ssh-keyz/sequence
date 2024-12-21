import connectPgSimple from "connect-pg-simple";
import type { Express, RequestHandler } from "express";
import session from "express-session";

let sessionMiddleware: RequestHandler | undefined = undefined;

export default (app: Express): RequestHandler => {
  if (sessionMiddleware === undefined) {
    sessionMiddleware = session({
      store: new (connectPgSimple(session))({
        createTableIfMissing: true,
        conObject: {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          database: process.env.DB_NAME || 'sequence_game',
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres'
        }
      }),
      secret: process.env.SESSION_SECRET || 'development_secret',
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE || '86400000', 10)
      }
    });
    app.use(sessionMiddleware);
  }
  return sessionMiddleware;
}; 