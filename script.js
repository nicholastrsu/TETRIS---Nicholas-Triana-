const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');

// Game settings
const BLOCK_SIZE = 30;
const ROWS = 20;
const COLS = 10;
let score = 0;
let gameLoop;
let isGameActive = false;

// Tetromino shapes and colors
const SHAPES = {
  I: { 
    shape: [[1, 1, 1, 1]], 
    color: '#00ffff' // Cyan
  },
  O: { 
    shape: [[1, 1], [1, 1]], 
    color: '#ffd700' // Gold
  },
  T: { 
    shape: [[0, 1, 0], [1, 1, 1]], 
    color: '#ff69b4' // Pink
  },
  S: { 
    shape: [[0, 1, 1], [1, 1, 0]], 
    color: '#7cfc00' // Green
  },
  Z: { 
    shape: [[1, 1, 0], [0, 1, 1]], 
    color: '#ff4500' // Orange
  },
  J: { 
    shape: [[1, 0, 0], [1, 1, 1]], 
    color: '#9370db' // Purple
  },
  L: { 
    shape: [[0, 0, 1], [1, 1, 1]], 
    color: '#4169e1' // Royal Blue
  }
};

let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
let currentPiece = null;
let currentPiecePosition = { x: 0, y: 0 };

// Initialize the game
function startGame() {
  // Reset game state
  board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
  score = 0;
  isGameActive = true;
  gameOverScreen.style.display = 'none';
  scoreElement.textContent = '0';

  // Start game loop
  if (gameLoop) clearInterval(gameLoop);
  spawnNewPiece();
  gameLoop = setInterval(() => update(), 1000); // Update every 1 second
  draw(); // Draw immediately
}

// Spawn a new piece
function spawnNewPiece() {
  const shapes = Object.keys(SHAPES);
  const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
  currentPiece = SHAPES[randomShape];
  currentPiecePosition = {
    x: Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2),
    y: 0
  };

  // Check for immediate collision (game over)
  if (checkCollision(currentPiecePosition.x, currentPiecePosition.y, currentPiece.shape)) {
    isGameActive = false;
    clearInterval(gameLoop);
    gameOverScreen.style.display = 'block';
    finalScoreElement.textContent = score;
  }
}

// Check for collisions
function checkCollision(x, y, shape) {
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const newX = x + col;
        const newY = y + row;
        if (newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && board[newY][newX])) {
          return true;
        }
      }
    }
  }
  return false;
}

// Merge piece to board
function mergePiece() {
  for (let row = 0; row < currentPiece.shape.length; row++) {
    for (let col = 0; col < currentPiece.shape[row].length; col++) {
      if (currentPiece.shape[row][col]) {
        board[currentPiecePosition.y + row][currentPiecePosition.x + col] = currentPiece.color;
      }
    }
  }
  clearLines();
  spawnNewPiece();
}

// Clear completed lines
function clearLines() {
  let linesCleared = 0;
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row].every(cell => cell !== 0)) {
      board.splice(row, 1);
      board.unshift(Array(COLS).fill(0));
      linesCleared++;
      row++;
    }
  }
  if (linesCleared > 0) {
    score += linesCleared * 100;
    scoreElement.textContent = score;
  }
}

// Update game state
function update() {
  if (!isGameActive) return;
  moveDown();
}

// Movement functions
function moveDown() {
  if (!checkCollision(currentPiecePosition.x, currentPiecePosition.y + 1, currentPiece.shape)) {
    currentPiecePosition.y++;
  } else {
    mergePiece();
  }
  draw();
}

function moveLeft() {
  if (!checkCollision(currentPiecePosition.x - 1, currentPiecePosition.y, currentPiece.shape)) {
    currentPiecePosition.x--;
    draw();
  }
}

function moveRight() {
  if (!checkCollision(currentPiecePosition.x + 1, currentPiecePosition.y, currentPiece.shape)) {
    currentPiecePosition.x++;
    draw();
  }
}

function rotate() {
  const rotated = currentPiece.shape[0].map((_, i) =>
    currentPiece.shape.map(row => row[i]).reverse()
  );
  if (!checkCollision(currentPiecePosition.x, currentPiecePosition.y, rotated)) {
    currentPiece.shape = rotated;
    draw();
  }
}

// Draw the game (FIXED SCALING)
function draw() {
  // Clear the canvas
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Draw the board
  board.forEach((row, y) => {
    row.forEach((color, x) => {
      if (color) {
        context.fillStyle = color;
        context.fillRect(
          x * BLOCK_SIZE, // No scaling conflict here
          y * BLOCK_SIZE,
          BLOCK_SIZE - 1,
          BLOCK_SIZE - 1
        );
      }
    });
  });

  // Draw the current piece
  if (currentPiece) {
    context.fillStyle = currentPiece.color;
    currentPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          context.fillRect(
            (currentPiecePosition.x + x) * BLOCK_SIZE, // Fixed scaling
            (currentPiecePosition.y + y) * BLOCK_SIZE,
            BLOCK_SIZE - 1,
            BLOCK_SIZE - 1
          );
        }
      });
    });
  }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
  if (!isGameActive) return;
  switch (e.key) {
    case 'ArrowLeft': moveLeft(); break;
    case 'ArrowRight': moveRight(); break;
    case 'ArrowDown': moveDown(); break;
    case 'ArrowUp': rotate(); break;
  }
});

// Remove context.scale() to fix rendering
// Initialize canvas size properly
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;