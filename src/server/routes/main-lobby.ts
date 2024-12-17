import express from "express";
import { Games } from "../db";

const router = express.Router();

router.get("/", async (request, response) => {
  // @ts-expect-error TODO: Define the session type for the user object
  const { id: userId } = request.session.user ?? {};

  if (!userId) {
    response.redirect("/login");
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
