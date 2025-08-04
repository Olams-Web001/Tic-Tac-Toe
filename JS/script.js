//
// File: script.js
// Purpose: Handles all game logic, UI updates, and form toggling for the Tic-Tac-Toe app.
//
// Key Functions & Logic:
// - toggleForm(): Switches between login and sign-up UI by changing text content.
// - resetGame(): Resets the board, clears cell text, sets current player to X, enables the game, and updates the status message.
// - Board and status selection: Selects the game board cells and the status message element.
// - Game state variables: currentPlayer, gameActive, board.
// - winningCombos: All possible winning line combinations for Tic-Tac-Toe.
// - gameMode: Reads from localStorage to determine if playing against a bot or versus (random online).
// - Event listeners: Adds a click event to each cell to handle moves.
// - handleMove(cell): Handles a player's move, updates the board and UI, checks for win/draw, switches player, and triggers bot move if needed.
// - checkWin(): Checks if the current player has a winning combination.
// - botMove(), getBestMove(), minimax(): Implements a minimax algorithm for the bot to play optimally.
// - evaluateWinner(): Checks for a winner or draw and returns the result.
//
// The file is well-commented, explaining the purpose of each function and variable.

// Adds toggle for login/signup form
function toggleForm() {
  // Get form title, button, and link
  const title = document.getElementById("formTitle");
  const button = document.querySelector("button");
  const link = document.querySelector("a[onclick]");

  // Toggle between Login and Sign Up
  if (title.textContent === "Login") {
    title.textContent = "Sign Up";
    button.textContent = "Create Account";
    link.textContent = "Back to Login";
  } else {
    title.textContent = "Login";
    button.textContent = "Login";
    link.textContent = "Sign Up";
  }
}

// Resets the game board and UI
function resetGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  cells.forEach(cell => (cell.textContent = ""));
  currentPlayer = "X";
  gameActive = true;
  statusText.textContent = `Player ${currentPlayer}'s turn`;
  lastWinningCombo = null;
  const oldStroke = document.getElementById('winning-stroke');
  if (oldStroke) oldStroke.remove();
}

// Selects all board cells and status text
const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
let currentPlayer = "X"; // Tracks current player
let gameActive = true;    // Is the game ongoing?
let board = ["", "", "", "", "", "", "", "", ""]; // Board state

// All possible winning combinations
const winningCombos = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

// Game mode: 'bot' or 'versus' (from localStorage)
const gameMode = localStorage.getItem("gameMode") || "bot";

// Online matchmaking placeholder
if (gameMode === "versus") {
  // Show searching animation (handled in HTML)
  // Simulate matchmaking delay
  setTimeout(() => {
    const searchingDiv = document.getElementById('searchingAnimation');
    if (searchingDiv) searchingDiv.remove();
    // TODO: Connect to backend for real matchmaking
    // For now, just start the game after delay
    document.getElementById("status").textContent = "Opponent found! Player X's turn";
    // You can add more logic here to handle real-time moves
  }, 3000);
}

// Add click event to each cell
cells.forEach(cell => {
  cell.addEventListener("click", () => handleMove(cell));
});

// Add this global variable to keep track of the winning combination
let lastWinningCombo = null;

// Update checkWin to store the winning combo
function checkWin() {
  for (const combo of winningCombos) {
    if (combo.every(index => board[index] === currentPlayer)) {
      lastWinningCombo = combo; // Store the winning combo
      return true;
    }
  }
  lastWinningCombo = null;
  return false;
}

// Add this function to draw a stroke over the winning line
function drawWinningStroke(combo) {
  // Remove any existing stroke
  const oldStroke = document.getElementById('winning-stroke');
  if (oldStroke) oldStroke.remove();

  // Get the board's position and the winning cells
  const boardDiv = document.getElementById('board');
  const cells = Array.from(document.querySelectorAll('.cell'));
  const rects = combo.map(i => cells[i].getBoundingClientRect());
  const boardRect = boardDiv.getBoundingClientRect();

  // Calculate start and end points (center of first and last cell in combo)
  const start = {
    x: rects[0].left + rects[0].width / 2 - boardRect.left,
    y: rects[0].top + rects[0].height / 2 - boardRect.top
  };
  const end = {
    x: rects[2].left + rects[2].width / 2 - boardRect.left,
    y: rects[2].top + rects[2].height / 2 - boardRect.top
  };

  // Create SVG line
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('id', 'winning-stroke');
  svg.style.position = 'absolute';
  svg.style.left = 0;
  svg.style.top = 0;
  svg.style.width = boardDiv.offsetWidth + 'px';
  svg.style.height = boardDiv.offsetHeight + 'px';
  svg.style.pointerEvents = 'none';
  svg.style.zIndex = 10;

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', start.x);
  line.setAttribute('y1', start.y);
  line.setAttribute('x2', end.x);
  line.setAttribute('y2', end.y);
  line.setAttribute('stroke', '#f87171'); // Tailwind red-400
  line.setAttribute('stroke-width', 8);
  line.setAttribute('stroke-linecap', 'round');

  svg.appendChild(line);
  boardDiv.style.position = 'relative';
  boardDiv.appendChild(svg);
}

// Add this function to show a win announcement modal
function showWinAnnouncement(winner) {
  // Remove any existing modal
  const oldModal = document.getElementById('win-announcement-modal');
  if (oldModal) oldModal.remove();

  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.id = 'win-announcement-modal';
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(60, 7, 83, 0.45)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = 1000;

  // Create modal content
  const modal = document.createElement('div');
  modal.className = 'bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center animate-bounceIn';
  modal.innerHTML = `
    <div class="text-6xl mb-4">🎉</div>
    <h2 class="text-3xl font-extrabold text-purple-700 mb-2">Congratulations!</h2>
    <p class="text-lg text-gray-700 mb-4">Player <span class="font-bold text-blue-600">${winner}</span> wins the game!</p>
    <button id="closeWinModal" class="mt-2 bg-purple-500 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-purple-600 transition">Close</button>
  `;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Close modal on button click
  document.getElementById('closeWinModal').onclick = function() {
    overlay.remove();
  };
}

// Handles a player's move
function handleMove(cell) {
  const index = cell.dataset.index;
  if (board[index] !== "" || !gameActive) return;

  board[index] = currentPlayer;
  cell.textContent = currentPlayer;

  if (checkWin()) {
    statusText.textContent = `Player ${currentPlayer} Wins!`;
    gameActive = false;
    if (lastWinningCombo) drawWinningStroke(lastWinningCombo);
    showWinAnnouncement(currentPlayer); // Show announcement
    return;
  } else if (board.every(c => c !== "")) {
    statusText.textContent = "It's a Draw!";
    gameActive = false;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `Player ${currentPlayer}'s turn`;

  if (gameMode === "bot" && currentPlayer === "O" && gameActive) {
    setTimeout(botMove, 300);
  }
}

// Bot makes a move using minimax or random for easier difficulty
function botMove() {
  // 40% chance to make a random move, 60% to play optimally
  if (Math.random() < 0.4) {
    // Find all empty cells
    const emptyCells = [];
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") emptyCells.push(i);
    }
    if (emptyCells.length > 0) {
      const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const cell = document.querySelector(`.cell[data-index="${randomIndex}"]`);
      handleMove(cell);
      return;
    }
  }
  // Otherwise, play optimally
  const bestMove = getBestMove();
  if (bestMove !== null) {
    const cell = document.querySelector(`.cell[data-index="${bestMove}"]`);
    handleMove(cell);
  }
}

// Finds the best move for the bot
function getBestMove() {
  let bestScore = -Infinity;
  let move = null;

  for (let i = 0; i < board.length; i++) {
    if (board[i] === "") {
      board[i] = "O";
      const score = minimax(board, 0, false);
      board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

// Minimax algorithm for bot AI
function minimax(newBoard, depth, isMaximizing) {
  const winner = evaluateWinner();
  if (winner !== null) {
    if (winner === "O") return 10 - depth;
    else if (winner === "X") return depth - 10;
    else return 0;
  }

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] === "") {
        newBoard[i] = "O";
        let score = minimax(newBoard, depth + 1, false);
        newBoard[i] = "";
        best = Math.max(score, best);
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] === "") {
        newBoard[i] = "X";
        let score = minimax(newBoard, depth + 1, true);
        newBoard[i] = "";
        best = Math.min(score, best);
      }
    }
    return best;
  }
}

// Evaluates if there's a winner or draw
function evaluateWinner() {
  // Loop through all possible winning combinations
  for (const combo of winningCombos) {
    const [a, b, c] = combo; // Destructure indices for the combo
    // If all three cells in the combo are the same and not empty, return the winner ("X" or "O")
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  // If all cells are filled and no winner, it's a draw
  if (board.every(cell => cell !== "")) {
    return "draw";
  }

  // If no winner and board is not full, return null (game continues)
  return null;
}
