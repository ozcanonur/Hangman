/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
/* eslint-disable no-alert */
/* eslint-disable no-console */
const socket = io();
// Open the socket to join the server
socket.emit('join');

// Create the question on screen with empty letters on join
socket.on('join', (wordLength) => {
  setupQuestionScreen(wordLength);
  setupKeyboardEventListeners(socket);
});

// Get the feedback if the letter was correct or not
socket.on('feedback', ({ letter, foundIndices, guessesLeft }) => {
  if (foundIndices.length === 0) handleWrongFeedback(guessesLeft);
  else handleCorrectFeedback(letter, foundIndices);

  const gameLetters = document.getElementsByClassName('game__letters__letter');
  if (isFullyCorrectAnswer(gameLetters)) return alert('Game won');

  return disableAlreadyChosenLetter(letter);
});

socket.on('gameOver', (hangmanCurrentWord) => {
  const hangmanImg = document.querySelector('#hangman-img');
  hangmanImg.src = '../img/hangman8.png';
  return alert(`Failed. The correct word was ${hangmanCurrentWord}`);
});
