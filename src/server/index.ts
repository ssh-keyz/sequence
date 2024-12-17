import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import * as path from "path";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { IncomingMessage } from "http";
import { SessionData } from "express-session";

// Extend IncomingMessage to include session
interface SessionIncomingMessage extends IncomingMessage {
  session: SessionData;
}

// Extend Socket type to include session
interface SessionSocket extends Socket {
  request: IncomingMessage & {
    session: SessionData;
  };
}

dotenv.config();

import * as configuration from "./config";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { authenticate, optionalAuthenticate } from "./middleware/auth";
import authRoutes from "./routes/auth";
import mainLobbyRouter from "./routes/main-lobby";

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
    },
  },
}));
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? process.env.CORS_ORIGIN
    : "http://localhost:3000",
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use("/api/", limiter);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Set up view engine
app.set("views", path.join(process.cwd(), "src", "views"));
app.set("view engine", "ejs");

// Serve static files with explicit MIME types
app.use(express.static(path.join(process.cwd(), "src", "public"), {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Set up Socket.IO with session support
const sessionMiddleware = configuration.configureSession(app);

const wrap = (middleware: any) => (socket: any, next: any) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use((socket, next) => {
  const session = (socket as SessionSocket).request.session;
  if (session && session.user) {
    next();
  } else {
    next(new Error("Authentication required"));
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  
  // Attach user data to socket
  const user = (socket as SessionSocket).request.session.user;
  socket.data.user = user;
  
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });

  // Game-specific events will be added here
});

app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);
app.use("/api/games", authenticate, /* games router */);
app.use("/api/users", authenticate, /* users router */);

// Use main-lobby router for root path
app.use("/", optionalAuthenticate, mainLobbyRouter);

app.use(notFoundHandler);
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
