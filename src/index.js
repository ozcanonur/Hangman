const http = require('http');
const express = require('express');
const path = require('path');

const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

module.exports = server;
require('./io');

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is up on port ${port}`);
});
