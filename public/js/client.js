// eslint-disable-next-line no-undef
const socket = io();

const letters = document.getElementsByClassName('bottom-panel__keyboard__list__letter');

Array.prototype.forEach.call(letters, (letter) => {
  letter.addEventListener('click', (e) => {
    socket.emit('letterSelected', e.target.textContent);
  });
});

socket.on('letterFeedback', (feedback) => {
  console.log(feedback);
});

socket.emit('join', (error) => {
  if (error) {
    // eslint-disable-next-line no-alert
    alert(error);
  }
});
