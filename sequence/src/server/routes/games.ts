import express from "express";
import { Games } from "../db";
import Players from "../db/players";

const router = express.Router();

router.get("/:gameId", async (request, response) => {
  try {
    const gameId = parseInt(request.params.gameId);
    const sessionId = request.sessionID;
    const player = await Players.getOrCreate(sessionId);
    
    response.render("games/game", { 
      title: `Game #${gameId}`,
      gameId,
      playerId: player.id
    });
  } catch (error) {
    console.error('Error loading game:', error);
    response.status(500).render("error", { 
      title: "Error",
      message: "An error occurred while loading the game"
    });
  }
});

router.post("/:gameId/draw", async (request, response) => {
  try {
    const gameId = parseInt(request.params.gameId);
    const sessionId = request.sessionID;
    const player = await Players.getOrCreate(sessionId);
    
    const { is_current_player } = await Games.isCurrentPlayer(gameId, player.id);
    if (!is_current_player) {
      response.status(400).json({ error: "Not your turn" });
      return;
    }
    
    await Games.drawCard(gameId, player.id);
    await Games.updatePlayerDrawTurn(gameId, player.id);
    
    response.status(200).send();
  } catch (error) {
    console.error('Error drawing card:', error);
    response.status(500).json({ error: "An error occurred while drawing a card" });
  }
});

router.get("/:gameId/update", async (request, response) => {
  try {
    const gameId = parseInt(request.params.gameId);
    const sessionId = request.sessionID;
    const player = await Players.getOrCreate(sessionId);
    
    const players = await Games.getPlayers(gameId);
    const hand = await Games.getPlayerHand(gameId, player.id);
    
    response.json({
      players: players.filter(p => p.id !== player.id),
      player: {
        ...players.find(p => p.id === player.id),
        hand
      }
    });
  } catch (error) {
    console.error('Error updating game:', error);
    response.status(500).json({ error: "An error occurred while updating the game" });
  }
});

export default router;
