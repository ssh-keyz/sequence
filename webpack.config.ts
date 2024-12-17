import dotenv from "dotenv";
import path from "path";
import webpack from "webpack";

dotenv.config();

const mode =
  process.env.NODE_ENV === "production" ? "production" : "development";

const config: webpack.Configuration = {
  entry: {
    main: path.join(process.cwd(), "src", "client", "main.ts"),
    chat: path.join(process.cwd(), "src", "client", "chat.ts"),
    "main-lobby": path.join(process.cwd(), "src", "client", "main-lobby.ts"),
    games: path.join(process.cwd(), "src", "client", "games.ts"),
    "game-lobby": path.join(process.cwd(), "src", "client", "game-lobby.ts"),
  },
  mode,
  output: {
    path: path.join(process.cwd(), "src", "public", "js"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
};

export default config;
