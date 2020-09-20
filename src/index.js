const http = require('http');
const express = require('express');
const path = require('path');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

const hangmanWords = ['Onur', 'Rachel'];
const hangmanCurrentWord = hangmanWords[0];

io.on('connection', (socket) => {
  // When a client emits join
  socket.on('join', () => {
    socket.join();
  });

  socket.on('letterSelected', (letter) => {
    if (hangmanCurrentWord.includes(letter)) io.emit('letterFeedback', 'Correct letter');
    else io.emit('letterFeedback', 'Wrong letter');
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
