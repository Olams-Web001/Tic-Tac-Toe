
// Express + WebSocket server for Tic-Tac-Toe
const express = require('express');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from public/
app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(PORT, () => {
  console.log(`HTTP server running on http://localhost:${PORT}`);
});

// WebSocket server
const wss = new WebSocket.Server({ server });
let waitingPlayer = null;

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // Handle incoming messages if needed
  });

  // Matchmaking logic
  if (!waitingPlayer) {
    waitingPlayer = ws;
    ws.send(JSON.stringify({ type: 'waiting' }));
  } else {
    ws.send(JSON.stringify({ type: 'start', symbol: 'O' }));
    waitingPlayer.send(JSON.stringify({ type: 'start', symbol: 'X' }));

    ws.on('message', (msg) => {
      waitingPlayer.send(msg);
    });
    waitingPlayer.on('message', (msg) => {
      ws.send(msg);
    });

    ws.on('close', () => {
      waitingPlayer.send(JSON.stringify({ type: 'opponent_left' }));
    });
    waitingPlayer.on('close', () => {
      ws.send(JSON.stringify({ type: 'opponent_left' }));
    });

    waitingPlayer = null;
  }
});

console.log(`WebSocket server running on ws://localhost:${PORT}`);
