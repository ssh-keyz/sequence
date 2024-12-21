import express from "express";
import { Games } from "../db";
import Players from "../db/players";

const router = express.Router();

router.get("/", async (request, response) => {
  try {
    // Create or get player from session
    const sessionId = request.sessionID;
    const player = await Players.getOrCreate(sessionId);
    
    const availableGames = await Games.availableGames();
    
    response.render("main-lobby", { 
      title: "Game Lobby",
      availableGames,
      playerId: player.id
    });
  } catch (error) {
    console.error('Error in main lobby:', error);
    response.status(500).render("error", { 
      title: "Error",
      message: "An error occurred while loading the game lobby"
    });
  }
});

router.post("/games/create", async (request, response) => {
  try {
    const sessionId = request.sessionID;
    const player = await Players.getOrCreate(sessionId);
    
    const game = await Games.create(player.id);
    response.redirect(`/games/${game.id}`);
  } catch (error) {
    console.error('Error creating game:', error);
    response.status(500).render("error", { 
      title: "Error",
      message: "An error occurred while creating the game"
    });
  }
});

router.post("/games/join/:gameId", async (request, response) => {
  try {
    const gameId = parseInt(request.params.gameId);
    const sessionId = request.sessionID;
    const player = await Players.getOrCreate(sessionId);
    
    await Games.join(gameId, player.id);
    response.redirect(`/games/${gameId}`);
  } catch (error) {
    console.error('Error joining game:', error);
    response.status(500).render("error", { 
      title: "Error",
      message: "An error occurred while joining the game"
    });
  }
});

export default router;
