/* eslint-disable curly */
/* eslint-disable nonblock-statement-body-position */
/* eslint-disable object-curly-newline */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
const { getRandomWord } = require('./hangman');
const words = require('./words');

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
  if (username.toLowerCase() !== username)
    return { error: 'Username can only contain lowercase letters' };

  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  const isNotValidated = validateUser(users, username, room);
  if (isNotValidated) return isNotValidated;

  const isRoomFull = validateRoom(users, room);
  if (isRoomFull) return isRoomFull;

  // Store user
  const word = getRandomWord(words, 50);
  const lettersLeftToGuess = word.split('');
  const guessesLeft = 7;
  const user = { id, username, room, word, lettersLeftToGuess, guessesLeft };
  users.push(user);
  return { user };
};

const getUser = (users, id) => users.find((user) => user.id === id);

const removeUser = (users, id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) return users.splice(index, 1)[0];
};

module.exports = { addUser, getUser, removeUser };
