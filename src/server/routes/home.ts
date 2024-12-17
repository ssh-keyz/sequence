import express from "express";

const router = express.Router();

router.get("/", (_request, response) => {
  response.render("home", { title: "Welcome" });
});

export default router;
