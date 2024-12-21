import { Server } from "socket.io";
import { Server as HttpServer } from "http";

export const configureSocketIO = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === "production"
        ? process.env.CORS_ORIGIN
        : "http://localhost:3000",
      credentials: true
    }
  });

  // Handle socket connections
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Handle joining game rooms
    socket.on("join-game", (gameId) => {
      socket.join(`game:${gameId}`);
      console.log(`Client ${socket.id} joined game ${gameId}`);
    });

    // Handle chat messages
    socket.on("chat:message", ({ gameId, message }) => {
      io.to(`game:${gameId}`).emit(`chat:${gameId}:message`, {
        sender: socket.id,
        message,
        timestamp: new Date()
      });
    });

    // Handle disconnections
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

export default configureSocketIO;
