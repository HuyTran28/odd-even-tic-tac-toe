// Import required modules
const path = require('path');
const express = require('express');
const { FIRST_PLAYER, SECOND_PLAYER } = require('../shared/gameConstants');
const { calculateWinner } = require('../shared/gameLogic');

const http = require('http');
const { Server } = require('socket.io');

const app = express();

// Serve static files from React client build
const clientBuildPath = path.resolve(__dirname, '..', 'client', 'build');
app.use(express.static(clientBuildPath));

// Fallback to index.html for any route (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Create HTTP server and attach Socket.IO
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Room management variables
let roomCounter = 1;
const rooms = {}; // roomName -> [playerSocketIds]
const lockedRooms = new Set(); // rooms locked after a player leaves
const roomBoards = {}; // roomName -> board state

// Handle socket connections
io.on('connection', (socket) => {
  let assignedRoom = null;

  // Handle player joining a room
  socket.on('join', () => {
    assignedRoom = null;
    // Find available room or create new one
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

    // Assign player type
    const player = rooms[assignedRoom].length === 1 ? FIRST_PLAYER : SECOND_PLAYER;
    socket.emit('assign', { player, room: assignedRoom });

    // Start game when two players have joined
    if (rooms[assignedRoom].length === 2) {
      io.to(assignedRoom).emit('start');
    }
  });

  // Handle incrementing a cell value
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

      // Check for winner after move
      const { winner, combination } = calculateWinner(roomBoards[room]);
      if (winner !== null) {
        io.to(room).emit('win', { winner, combination });
      }
   }
  });

  // Handle game reset
  socket.on('reset', (room) => {
    if (room) {
      io.to(room).emit('reset');
      lockedRooms.delete(room);
      roomBoards[room] = Array(9).fill(0);
    }
  });

  // Handle player disconnect
  socket.on('disconnect', () => {
    for (const [room, players] of Object.entries(rooms)) {
      const idx = players.indexOf(socket.id);
      if (idx !== -1) {
        players.splice(idx, 1);
        if (players.length === 0) {
          // Remove empty room
          delete rooms[room];
          lockedRooms.delete(room);
          delete roomBoards[room];
        } else {
          // Notify remaining player and lock room
          io.to(room).emit('playerLeft');
          lockedRooms.add(room);
        }
        break;
      }
    }
  });
});

// Start server
const PORT = process.env.PORT || 8080;

httpServer.listen(PORT, () => {
});