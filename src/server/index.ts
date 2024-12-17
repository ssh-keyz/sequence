import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import * as path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";

dotenv.config();

import * as configuration from "./config";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { authenticate, optionalAuthenticate } from "./middleware/auth";
import authRoutes from "./routes/auth";

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(helmet());
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

const staticPath = path.join(process.cwd(), "src", "public");
app.use(express.static(staticPath));

configuration.configureSession(app);

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  try {
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });

  // Game-specific events will be added here
});

app.use("/api/auth", authRoutes);

app.use("/api/games", authenticate, /* games router */);
app.use("/api/users", authenticate, /* users router */);

app.use("/", optionalAuthenticate, /* public router */);

app.use(notFoundHandler);
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
