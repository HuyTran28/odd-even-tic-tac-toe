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

let roomCounter = 1;
const rooms = {};
const lockedRooms = new Set();

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
    if (data.room) {
      io.to(data.room).emit('display', {
        value: data.value + 1,
        index: data.index
      });
    }
  });

  socket.on('reset', (room) => {
    if (room) {
      io.to(room).emit('reset');
      lockedRooms.delete(room);
    }
  });

  socket.on('disconnect', () => {
    for (const [room, players] of Object.entries(rooms)) {
      const index = players.indexOf(socket.id);
      if (index !== -1) {
        players.splice(index, 1);
        
        if (players.length === 0) {
          delete rooms[room];
          lockedRooms.delete(room);
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