const http = require('http');
const express = require('express');
const path = require('path');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

const words = require('./words');

const { getRandomWord, findIndicesOfLetterInWord } = require('./util');

io.on('connection', (socket) => {
  const word = getRandomWord(words, 50);
  let guessesLeft = 7;

  socket.on('join', () => {
    socket.emit('join', word.length);
  });

  socket.on('select', (letter) => {
    const foundIndices = findIndicesOfLetterInWord(word, letter);
    if (foundIndices.length === 0) guessesLeft -= 1;

    if (guessesLeft === 0) return socket.emit('gameOver', word);

    return socket.emit('feedback', { letter, foundIndices, guessesLeft });
  });
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is up on port ${port}`);
});
