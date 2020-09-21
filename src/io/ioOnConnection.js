/* eslint-disable consistent-return */
const { addUser, removeUser } = require('../utils/users');

const onJoin = (socket, users, username, room, callback) => {
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
};

const onDisconnect = (io, socket, users) => {
  // Remove user from the users list, return the removed user
  const user = removeUser(users, socket.id);
  if (user) {
    io.to(user.room).emit('message', { name: user.username, message: 'has left the room.' });
    io.to(user.room).emit('opponentLeft');
  }
};

module.exports = { onJoin, onDisconnect };
