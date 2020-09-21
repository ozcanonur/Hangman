const { findIndicesOfLetterInWord } = require('../utils/hangman');

const onChooseLetter = (io, socket, users, username, selectedLetter) => {
  const user = users.find((e) => e.username === username);
  // Find indices where this letter appears
  const foundIndices = findIndicesOfLetterInWord(user.word, selectedLetter);
  // -1 guess left is no found
  if (foundIndices.length === 0) user.guessesLeft -= 1;

  // If both side loses
  const isBothLost = !users.some((e) => e.guessesLeft > 0);
  if (isBothLost) {
    // Emit to SELF that both lost and your word was
    socket.emit('bothLost', user.word);
    const opponent = users.find((e) => e.room === user.room && e.username !== username);
    if (opponent) io.to(user.room).emit('bothLost', opponent.word);
  }

  // One player loses
  if (user.guessesLeft === 0) {
    // Emit to SELF that you have no guesses left
    socket.emit('noGuessesLeft', user.word);
    // Emit to chat that player has no guesses left
    io.to(user.room).emit('message', {
      name: user.username,
      message: 'I have no guesses left',
      createdAt: new Date().getTime(),
    });
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
    if (opponent) return socket.broadcast.to(user.room).emit('opponentWon', opponent.word);
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
};

module.exports = { onChooseLetter };
