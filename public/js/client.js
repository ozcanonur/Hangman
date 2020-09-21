/* eslint-disable object-curly-newline */
/* eslint-disable consistent-return */
/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
/* eslint-disable no-alert */
/* eslint-disable no-console */
const socket = io();

document.querySelector('#header-exit').addEventListener('click', () => {
  window.location.href = '/';
});

const messageForm = document.querySelector('#message-form');
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const message = e.target.elements[0].value;
  socket.emit('message', message, (error) => {
    if (error) return console.log(error);
  });
});

const { username, room } = Qs.parse(window.location.search, { ignoreQueryPrefix: true });

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    window.location.href = '/';
  }

  document.querySelector('#player-name').innerHTML = username;
});

socket.on('opponentName', (opponentName) => {
  const title = document.querySelector('#opponent-name');
  if (opponentName) title.innerHTML = opponentName;
  else title.innerHTML = 'No opponent';
});

const createAndShowMessage = (name, message, createdAt) => {
  const messageDiv = document.createElement('div');
  const time = moment(createdAt).format('H:mm:ss');
  messageDiv.innerHTML = `${time} <strong>${name}</strong>: ${message}`;

  const oldMessagesField = document.querySelector('#old-messages');
  oldMessagesField.appendChild(messageDiv);

  const messageInputField = document.querySelector('#message-form-input');
  messageInputField.value = '';
};

socket.on('message', ({ name, message, createdAt }) => {
  createAndShowMessage(name, message, createdAt);
});

// Create the question on screen with empty letters on join
socket.on('setupBoard', (wordLength) => {
  setupBoard(wordLength, 'self');
  setupKeyboardEventListeners(socket, username);
});

socket.on('opponentBoard', (wordLength) => {
  setupBoard(wordLength, 'opponent');
});

const handleWrongLetter = (imgId, guessesLeft) => {
  const hangmanImg = document.querySelector(imgId);
  hangmanImg.src = `../img/hangman${8 - guessesLeft}.png`;
};

const handleCorrectLetter = (liClass, foundIndices, selectedLetter) => {
  const gameLetters = document.getElementsByClassName(liClass);
  foundIndices.forEach((index) => {
    const toBeUpdatedLetter = gameLetters[index];
    toBeUpdatedLetter.textContent = selectedLetter;
  });
};

// Get the feedback if the letter was correct or not
socket.on('chooseLetterFeedback', ({ selectedLetter, foundIndices, guessesLeft, who }) => {
  if (who === 'self') {
    if (foundIndices.length === 0) handleWrongLetter('#player-hangman-img', guessesLeft);
    else handleCorrectLetter('game__player__letters__letter', foundIndices, selectedLetter);
    disableAlreadyChosenLetter(selectedLetter);
  } else if (who === 'opponent') {
    if (foundIndices.length === 0) handleWrongLetter('#opponent-hangman-img', guessesLeft);
    else handleCorrectLetter('game__opponent__letters__letter', foundIndices, selectedLetter);
  }
});

socket.on('gameWon', () => {
  alert('You won the game!');
  window.location.href = '/';
});

socket.on('opponentWon', (word) => {
  alert(`Opponent won the game :(. Your word was ${word}`);
  window.location.href = '/';
});

socket.on('noGuessesLeft', (word) => {
  alert(`You have no guesses left :(. Your word was ${word}`);
  disableAllKeyboardLetters();
});

socket.on('opponentNoGuessesLeft', () => {
  alert('Opponent has no guesses left!');
});

socket.on('bothLost', (word) => {
  alert(`Both sides failed :(. Your word was ${word}`);
});
