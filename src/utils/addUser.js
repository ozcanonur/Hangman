/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
const validateUser = (users, username, room) => {
  if (!username || !room) return { error: 'Username and room are required' };

  const existingUser = users.find((user) => user.room === room && user.username === username);
  if (existingUser) return { error: 'Username is in use' };
};

const validateRoom = (users, room) => {
  // Only let in two people
  let roomSize = 0;
  users.forEach((user) => {
    if (user.room === room) roomSize += 1;
  });
  if (roomSize === 2) return { error: 'Room is full' };
};

const addUser = (users, id, username, room) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  const isNotValidated = validateUser(users, username, room);
  if (isNotValidated) return isNotValidated;

  const isRoomFull = validateRoom(users, room);
  if (isRoomFull) return isRoomFull;

  // Store user, this is questionable? why do we keep user list on client side
  const user = { id, username, room };
  users.push(user);
  return { user };
};

module.exports = addUser;