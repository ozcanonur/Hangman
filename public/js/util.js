/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
const setupBoard = (wordLength, player) => {
  const ulId = player === 'self' ? '#game-player-letters' : '#game-opponent-letters';
  // eslint-disable-next-line operator-linebreak
  const liClassName =
    player === 'self' ? 'game__player__letters__letter' : 'game__opponent__letters__letter';

  // eslint-disable-next-line operator-linebreak
  const gameLetterList = document.querySelector(ulId);

  gameLetterList.innerHTML = '';
  for (let i = 0; i < wordLength; i += 1) {
    const gameLetter = document.createElement('li');
    gameLetter.className += liClassName;
    gameLetterList.appendChild(gameLetter);
  }
};

const setupKeyboardEventListeners = (socket, username) => {
  // Setup keyboard letter event listeners
  const letters = document.getElementsByClassName('bottom-panel__keyboard__list__letter');
  Array.prototype.forEach.call(letters, (letter) => {
    letter.addEventListener('click', (e) => {
      const selectedLetter = e.target.textContent;
      socket.emit('chooseLetter', { selectedLetter, username });
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

const disableAllKeyboardLetters = () => {
  const letters = document.getElementsByClassName('bottom-panel__keyboard__list__letter');
  Array.prototype.forEach.call(letters, (letter) => {
    letter.style.backgroundColor = '#777';
    letter.style.color = '#fff';
    letter.style.pointerEvents = 'none';
  });
};
