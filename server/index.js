const { FIRST_PLAYER, SECOND_PLAYER } = require('../shared/gameConstants');
const { calculateWinner } = require('../shared/gameLogic');

const http = require('http');
const { Server } = require('socket.io');

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});


let roomCounter = 1;
const rooms = {}; 
const lockedRooms = new Set();
const roomBoards = {}; 

io.on('connection', (socket) => {
  let assignedRoom = null;

  socket.on('join', () => {
    assignedRoom = null;
    for (const [room, players] of Object.entries(rooms)) {
      if (players.length < 2 && !lockedRooms.has(room)) {
        assignedRoom = room;
        break;
      }
    }

    if (!assignedRoom) {
      assignedRoom = `room${roomCounter++}`;
      rooms[assignedRoom] = [];
      roomBoards[assignedRoom] = Array(9).fill(0);
    }

    rooms[assignedRoom].push(socket.id);
    socket.join(assignedRoom);

    const player = rooms[assignedRoom].length === 1 ? FIRST_PLAYER : SECOND_PLAYER;
    socket.emit('assign', { player, room: assignedRoom });

    if (rooms[assignedRoom].length === 2) {
      io.to(assignedRoom).emit('start');
    }
  });

  socket.on('increment', (data) => {
    const { room, index } = data;
    if (room && typeof index === 'number') {
      if (!roomBoards[room]) {
        roomBoards[room] = Array(9).fill(0);
      }

      roomBoards[room][index] = (roomBoards[room][index] | 0) + 1;
      io.to(room).emit('display', {
        value: roomBoards[room][index],
        index
      });

      const { winner, combination } = calculateWinner(roomBoards[room]);
      if (winner !== null) {
        io.to(room).emit('win', { winner, combination });
      }
   }
  });

  socket.on('reset', (room) => {
    if (room) {
      io.to(room).emit('reset');
      lockedRooms.delete(room);
      roomBoards[room] = Array(9).fill(0);
    }
  });

  socket.on('disconnect', () => {
    for (const [room, players] of Object.entries(rooms)) {
      const idx = players.indexOf(socket.id);
      if (idx !== -1) {
        players.splice(idx, 1);
        if (players.length === 0) {
          delete rooms[room];
          lockedRooms.delete(room);
          delete roomBoards[room];
        } else {
          io.to(room).emit('playerLeft');
          lockedRooms.add(room);
        }
        break;
      }
    }
  });
});

httpServer.listen(8080, () => {
});