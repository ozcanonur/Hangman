/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
const isFullyCorrectAnswer = (gameLetters) => {
  for (let i = 0; i < gameLetters.length; i += 1) {
    if (gameLetters[i].textContent === '') return false;
  }
  return true;
};

const setupQuestionScreen = (wordLength) => {
  const gameLetterList = document.querySelector('#game-letters');
  for (let i = 0; i < wordLength; i += 1) {
    const gameLetter = document.createElement('li');
    gameLetter.className += 'game__letters__letter';
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
  const hangmanImg = document.querySelector('#hangman-img');
  hangmanImg.src = `../img/hangman${8 - guessesLeft}.png`;
};

const handleCorrectFeedback = (letter, foundIndices) => {
  const gameLetters = document.getElementsByClassName('game__letters__letter');
  foundIndices.forEach((index) => {
    const toBeUpdatedLetter = gameLetters[index];
    toBeUpdatedLetter.textContent = letter;
  });
};
