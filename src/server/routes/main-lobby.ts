import express from "express";
import { Games } from "../db";

const router = express.Router();

router.get("/", async (request, response) => {
  const user = request.session.user;

  // Handle guest users by redirecting to login
  if (!user) {
    response.redirect('/auth/login');
    return;
  }

  const availableGames = await Games.availableGames();
  const playerGames: Record<number, boolean> = await Games.playerGames(user.id);

  // Add currentPlayerIsMember flag to each game
  availableGames.forEach((game) => {
    game.currentPlayerIsMember = playerGames[game.id] || false;
  });

  response.render("main-lobby", { 
    title: "Game Lobby",
    user,
    availableGames
  });
});

export default router;
