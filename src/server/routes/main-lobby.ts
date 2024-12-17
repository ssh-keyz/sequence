import express from "express";
import { Games } from "../db";

const router = express.Router();

router.get("/", async (request, response) => {
  const userId = request.session.user?.id;

  // Handle guest users by showing available games without player-specific data
  if (!userId) {
    const availableGames = await Games.availableGames();
    response.render("main-lobby", { 
      title: "Welcome", 
      availableGames: availableGames.map(game => ({
        ...game,
        currentPlayerIsMember: false
      }))
    });
    return;
  }

  const availableGames = await Games.availableGames();
  const playerGames: Record<number, boolean> = await Games.playerGames(userId);

  // Probably a way to do this in SQL, but doesn't seem worth the effort at the moment
  availableGames.forEach((game) => {
    if (playerGames[game.id]) {
      game.currentPlayerIsMember = true;
    }
  });

  response.render("main-lobby", { title: "Welcome", availableGames });
});

export default router;
