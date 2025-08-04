// Simple WebSocket matchmaking server for Tic-Tac-Toe
const WebSocket = require('ws');
const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

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
    // Pair the two players
    ws.send(JSON.stringify({ type: 'start', symbol: 'O' }));
    waitingPlayer.send(JSON.stringify({ type: 'start', symbol: 'X' }));

    // Setup relaying moves between players
    ws.on('message', (msg) => {
      waitingPlayer.send(msg);
    });
    waitingPlayer.on('message', (msg) => {
      ws.send(msg);
    });

    // Clean up on disconnect
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
