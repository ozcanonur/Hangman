/* eslint-disable consistent-return */
const socketio = require('socket.io');
const server = require('../index');

const io = socketio(server);

const users = [];

const { onJoin, onDisconnect } = require('./ioOnConnection');
const { onMessage } = require('./ioOnMessage');
const { onChooseLetter } = require('./ioOnChooseLetter');

io.on('connection', (socket) => {
  socket.on('join', ({ username, room }, callback) => {
    onJoin(socket, users, username, room, callback);
  });

  socket.on('disconnect', () => {
    onDisconnect(io, socket, users);
  });

  socket.on('message', (message, callback) => {
    onMessage(io, socket, users, message, callback);
  });

  socket.on('chooseLetter', ({ selectedLetter, username }) => {
    onChooseLetter(io, socket, users, username, selectedLetter);
  });
});
