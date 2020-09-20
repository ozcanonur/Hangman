/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
const http = require('http');
const express = require('express');
const path = require('path');
const socketio = require('socket.io');

const addUser = require('./utils/addUser');
const removeUser = require('./utils/removeUser');
const getUser = require('./utils/getUser');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

const { getRandomWord } = require('./utils/hangman');

const words = require('./words');
// WOOP WOOP room name and user name lower case fucks up
const users = [];

io.on('connection', (socket) => {
  const word = getRandomWord(words, 50);
  let guessesLeft = 7;

  socket.on('join', ({ username, room }, callback) => {
    // Add the user to users list, {id, username, room}
    const { error, user } = addUser(users, socket.id, username, room, word);
    if (error) return callback(error);

    // Join the room
    socket.join(user.room);
    // Emit welcome message to self
    socket.emit('message', { name: 'Admin', message: `Welcome ${user.username}` });
    // Emit user joined message to others
    socket.broadcast.to(user.room).emit('message', { name: user.username, message: 'has entered the room.' });

    // Find opponent
    const opponent = users.find((e) => e.room === room && e.username !== username);
    if (opponent) {
      // Emit opponent name to yourself
      socket.emit('opponentName', opponent.username);
      // Emit your name to the opponent
      socket.broadcast.to(user.room).emit('opponentName', username);
    }

    // Setup own board
    socket.emit('setupBoard', word.length);
    // Setup opponent's board
    if (opponent) socket.emit('opponentBoard', opponent.word.length);
    // Send own board to opponent
    socket.broadcast.to(user.room).emit('opponentBoard', word.length);

    callback();
  });

  socket.on('disconnect', () => {
    // Remove user from the users list, return the removed user
    const user = removeUser(users, socket.id);
    if (user) io.to(user.room).emit('message', { name: user.username, message: 'has left the room.' });
  });

  socket.on('message', (message, callback) => {
    // Get the user who sent the message and emit the message to everyone in room
    const user = getUser(users, socket.id);
    io.to(user.room).emit('message', { name: user.username, message, createdAt: new Date().getTime() });
    callback();
  });

  // socket.on('select', (letter) => {
  //   const foundIndices = findIndicesOfLetterInWord(word, letter);
  //   if (foundIndices.length === 0) guessesLeft -= 1;

  //   if (guessesLeft === 0) return io.emit('gameOver', word);

  //   return io.emit('feedback', { letter, foundIndices, guessesLeft });
  // });
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is up on port ${port}`);
});
