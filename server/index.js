const { FIRST_PLAYER, SECOND_PLAYER } = require('../client/src/constants/gameConstants')

const http = require('http');
const { Server } = require('socket.io');

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

let playerCount = 0;

io.on('connection', (socket) => {
  playerCount++;

  socket.on('join', () => {
    const player = playerCount === 1 ? FIRST_PLAYER : SECOND_PLAYER;
    socket.emit('start', { player });
  });

  socket.on('increment', (data) => {
    io.emit('display', {
      value: data.value + 1,
      index: data.index
    });
  });

  socket.on('disconnect', () => {
    playerCount = Math.max(0, playerCount - 1);
  });

  socket.on('reset', () => {
    io.emit('reset');
  });
});

httpServer.listen(8080, () => {
});