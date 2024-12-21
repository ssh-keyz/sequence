const path = require('path');

module.exports = {
  entry: {
    main: './src/client/main.ts',
    games: './src/client/games.ts',
    'main-lobby': './src/client/main-lobby.ts',
    'game-lobby': './src/client/game-lobby.ts',
    chat: './src/client/chat.ts'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'src/public/js'),
  },
}; 