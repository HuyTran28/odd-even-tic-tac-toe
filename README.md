# Setup instructions

1. Clone this repository:
    ```bash
    git clone https://github.com/HuyTran28/odd-even-tic-tac-toe.git
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Launch the development server:
    ```bash
    npm run server
    ```

4. Open multiple client instances (use separate terminal windows for each):
    ```bash
    npm run client
    ```
If prompted, confirm to open on a new port.

5. In your browser, go to `http://localhost:{port}` (each client will use a different port).

# How to play

- The game takes place on a 5x5 board, with all squares starting at 0.
- When a player clicks a square, its value increases by 1.
- Both players can select any square at any time; there are no turns.
- Player 1 wins by forming a row, column, or diagonal of 5 odd numbers, while Player 2 wins with 5 even numbers in a line.

# Real-time Communication with Socket.IO

- Socket.IO is used to synchronize the game state across all clients in real time.
- Whenever a player clicks a square, the client sends the updated board to the server using Socket.IO.
- The server then relays the new board state to every connected client, so all players see the same board immediately.

## Example: Emitting and Receiving Board Updates

**Client-side (React):**
```javascript
// Send updated board to server
socket.emit('move', updatedBoard);

// Listen for board updates from server
socket.on('board', (board) => {
  setBoard(board);
});
```

**Server-side (Node.js):**
```javascript
// Receive move from client and broadcast to all clients
socket.on('move', (board) => {
  io.emit('board', board);
});
```

# How to test race conditions

- Use several browser windows or tabs to represent different players.
- Activate chaos mode by selecting the "Enable Chaos Mode" option.
- In chaos mode, you can quickly click on multiple squares to check how the game manages simultaneous updates.
- The pending board square will display as yellow while awaiting server confirmation.
- Watch how the game board synchronizes instantly across all clients, verifying accuracy and consistency.

