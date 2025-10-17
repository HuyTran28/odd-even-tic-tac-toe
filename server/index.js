const http = require('http');
const socketIo = require('socket.io');

const httpServer = http.createServer();
const io = socketIo(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

let playerCount = 0;

io.on('connection', (socket) => {
  playerCount++;

  socket.on('join', () => {
    const player = playerCount === 1 ? 'X' : 'O';
    socket.emit('start', { player });
  });

  socket.on('move', (data) => {
    io.emit('display', {
      board: data.board,
      nextPlayer: data.nextPlayer
    });
  });

  socket.on('disconnect', () => {
    playerCount = Math.max(0, playerCount - 1);
  });
});

httpServer.listen(8080, () => {
});