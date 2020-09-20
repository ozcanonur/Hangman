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
socket.on('join', (wordLength) => {
  setupQuestionScreen(wordLength);
  setupKeyboardEventListeners(socket);
});

// Get the feedback if the letter was correct or not
socket.on('feedback', ({ letter, foundIndices, guessesLeft }) => {
  if (foundIndices.length === 0) {
    const hangmanImg = document.querySelector('#player-hangman-img');
    hangmanImg.src = `../img/hangman${8 - guessesLeft}.png`;
  } else handleCorrectFeedback(letter, foundIndices);

  const gameLetters = document.getElementsByClassName('game__player__letters__letter');
  if (isFullyCorrectAnswer(gameLetters)) return alert('Game won');

  return disableAlreadyChosenLetter(letter);
});

socket.on('gameOver', (hangmanCurrentWord) => {
  const hangmanImg = document.querySelector('#player-hangman-img');
  hangmanImg.src = '../img/hangman8.png';
  return alert(`Failed. The correct word was ${hangmanCurrentWord}`);
});
