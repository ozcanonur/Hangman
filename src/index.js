/* eslint-disable nonblock-statement-body-position */
/* eslint-disable object-curly-newline */
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

const { findIndicesOfLetterInWord } = require('./utils/hangman');

// WOOP WOOP room name and user name lower case fucks up
const users = [];

io.on('connection', (socket) => {
  socket.on('join', ({ username, room }, callback) => {
    // Add the user to users list, {id, username, room}
    const { error, user } = addUser(users, socket.id, username, room);
    if (error) return callback(error);

    // Join the room
    socket.join(user.room);
    // Emit welcome message to self
    socket.emit('message', { name: 'Admin', message: `Welcome ${user.username}` });
    // Emit user joined message to others
    socket.broadcast
      .to(user.room)
      .emit('message', { name: user.username, message: 'has entered the room.' });

    // Find opponent
    const opponent = users.find((e) => e.room === room && e.username !== username);
    if (opponent) {
      // Emit opponent name to yourself
      socket.emit('opponentName', opponent.username);
      // Emit your name to the opponent
      socket.broadcast.to(user.room).emit('opponentName', username);
    }

    // Setup own board
    socket.emit('setupBoard', user.word.length);
    // Setup opponent's board
    if (opponent) socket.emit('opponentBoard', opponent.word.length);
    // Send own board to opponent
    socket.broadcast.to(user.room).emit('opponentBoard', user.word.length);

    callback();
  });

  socket.on('disconnect', () => {
    // Remove user from the users list, return the removed user
    const user = removeUser(users, socket.id);
    if (user) {
      io.to(user.room).emit('message', { name: user.username, message: 'has left the room.' });
    }
  });

  socket.on('message', (message, callback) => {
    // Get the user who sent the message and emit the message to everyone in room
    const user = getUser(users, socket.id);
    io.to(user.room).emit('message', {
      name: user.username,
      message,
      createdAt: new Date().getTime(),
    });
    callback();
  });

  socket.on('chooseLetter', ({ selectedLetter, username }) => {
    const user = users.find((e) => e.username === username);
    // Find indices where this letter appears
    const foundIndices = findIndicesOfLetterInWord(user.word, selectedLetter);
    // -1 guess left is no found
    if (foundIndices.length === 0) user.guessesLeft -= 1;

    // If both side loses
    const isBothLost = !users.some((e) => e.guessesLeft > 0);
    if (isBothLost) return io.to(user.room).emit('bothLost', user.word);

    // One player loses
    if (user.guessesLeft === 0) {
      // Emit to SELF that you have no guesses left
      socket.emit('noGuessesLeft', user.word);
      // Emit to OPPONENT that you have no guesses left
      return socket.broadcast.to(user.room).emit('opponentNoGuessesLeft');
    }

    // One player wins
    // Remove foundindices from lettersLeftToGuess in user object
    user.lettersLeftToGuess = user.lettersLeftToGuess.filter((letter) => letter !== selectedLetter);
    if (user.lettersLeftToGuess.length === 0) {
      // Emit to SELF that you won the game
      socket.emit('gameWon');
      // Emit to OPPONENT that you won the game
      const opponent = users.find((e) => e.room === user.room && e.username !== username);
      return socket.broadcast.to(user.room).emit('opponentWon', opponent.word);
    }

    // Emit the feedback to SELF
    const selfFeedback = {
      selectedLetter,
      foundIndices,
      guessesLeft: user.guessesLeft,
      who: 'self',
    };
    socket.emit('chooseLetterFeedback', selfFeedback);

    // Emit the SELF feedback to opponent
    const opponentFeedback = {
      selectedLetter,
      foundIndices,
      guessesLeft: user.guessesLeft,
      who: 'opponent',
    };
    return socket.broadcast.to(user.room).emit('chooseLetterFeedback', opponentFeedback);
  });
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is up on port ${port}`);
});
