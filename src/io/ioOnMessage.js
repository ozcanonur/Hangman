const { getUser } = require('../utils/users');

const onMessage = (io, socket, users, message, callback) => {
  // Get the user who sent the message and emit the message to everyone in room
  const user = getUser(users, socket.id);
  io.to(user.room).emit('message', {
    name: user.username,
    message,
    createdAt: new Date().getTime(),
  });
  callback();
};

module.exports = { onMessage };
