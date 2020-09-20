/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
const isFullyCorrectAnswer = (gameLetters) => {
  for (let i = 0; i < gameLetters.length; i += 1) {
    if (gameLetters[i].textContent === '') return false;
  }
  return true;
};

const setupBoard = (wordLength, player) => {
  // eslint-disable-next-line operator-linebreak
  const gameLetterList =
    player === 'self'
      ? document.querySelector('#game-player-letters')
      : document.querySelector('#game-opponent-letters');

  gameLetterList.innerHTML = '';
  for (let i = 0; i < wordLength; i += 1) {
    const gameLetter = document.createElement('li');
    gameLetter.className += 'game__player__letters__letter';
    gameLetterList.appendChild(gameLetter);
  }
};

const setupKeyboardEventListeners = (socket) => {
  // Setup keyboard letter event listeners
  const letters = document.getElementsByClassName('bottom-panel__keyboard__list__letter');
  Array.prototype.forEach.call(letters, (letter) => {
    letter.addEventListener('click', (e) => {
      const selectedLetter = e.target.textContent;
      socket.emit('select', selectedLetter);
    });
  });
};

const disableAlreadyChosenLetter = (chosenLetter) => {
  const letters = document.getElementsByClassName('bottom-panel__keyboard__list__letter');
  Array.prototype.forEach.call(letters, (letter) => {
    if (letter.textContent === chosenLetter) {
      letter.style.backgroundColor = '#777';
      letter.style.color = '#fff';
      letter.style.pointerEvents = 'none';
    }
  });
};

const handleWrongFeedback = (guessesLeft) => {
  const hangmanImg = document.querySelector('#player-hangman-img');
  hangmanImg.src = `../img/hangman${8 - guessesLeft}.png`;
};

const handleCorrectFeedback = (letter, foundIndices) => {
  const gameLetters = document.getElementsByClassName('game__player__letters__letter');
  foundIndices.forEach((index) => {
    const toBeUpdatedLetter = gameLetters[index];
    toBeUpdatedLetter.textContent = letter;
  });
};
