const cells = document.querySelectorAll(".cell");
const statusText = document.querySelector("#statusText");
const restartBtn = document.querySelector("#restartBtn");
const difficultySelect = document.querySelector("#difficulty");
const modeSelect = document.querySelector("#mode");

let firstMoveSelect = document.createElement("select");
firstMoveSelect.id = "firstMove";
firstMoveSelect.innerHTML = `
  <option value="player" selected>Người chơi đi trước</option>
  <option value="ai">Máy đi trước</option>
`;
document.querySelector(".controls").appendChild(document.createTextNode(" Ai đi trước: "));
document.querySelector(".controls").appendChild(firstMoveSelect);

const winConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

let options = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let running = false;
let difficulty = "hard";
let mode = "ai";
let firstMove = "player";

initializeGame();

function initializeGame() {
  cells.forEach(cell => cell.addEventListener("click", cellClicked));
  restartBtn.addEventListener("click", restartGame);
  difficultySelect.addEventListener("change", (e) => difficulty = e.target.value);
  modeSelect.addEventListener("change", (e) => {
    mode = e.target.value;
    restartGame();
    difficultySelect.disabled = (mode === "pvp");
  });
  firstMoveSelect.addEventListener("change", (e) => {
    firstMove = e.target.value;
    restartGame();
  });

  restartGame();
}

function cellClicked() {
  const cellIndex = this.getAttribute("cellIndex");
  if (options[cellIndex] !== "" || !running) return;

  updateCell(this, cellIndex);
  checkWinner();

  if (mode === "ai" && running) {
    currentPlayer = "O";
    statusText.textContent = `AI (${difficulty}) is thinking...`;
    setTimeout(aiMove, 500);
  } else if (mode === "pvp" && running) {
    currentPlayer = (currentPlayer === "X") ? "O" : "X";
    statusText.textContent = `${currentPlayer}'s turn`;
  }
}

function updateCell(cell, index) {
  options[index] = currentPlayer;
  cell.textContent = currentPlayer;
}

function highlightWinnerLine(line) {
  line.forEach(i => cells[i].classList.add("winner"));
}

function getWinner(board, shouldHighlight = true) {
  for (let condition of winConditions) {
    const [a, b, c] = condition;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      if (shouldHighlight) highlightWinnerLine(condition);
      return board[a];
    }
  }
  return null;
}

function checkWinner() {
  let winner = getWinner(options, true);
  if (winner) {
    statusText.textContent = `${winner} wins!`;
    running = false;
  } else if (!options.includes("")) {
    statusText.textContent = "Draw!";
    running = false;
  }
}

function restartGame() {
  currentPlayer = "X";
  options = ["", "", "", "", "", "", "", "", ""];
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("winner");
  });
  running = true;

  if (mode === "ai" && firstMove === "ai") {
    currentPlayer = "O";
    statusText.textContent = `AI (${difficulty}) starts...`;
    setTimeout(aiMove, 500);
  } else {
    statusText.textContent = `${currentPlayer}'s turn`;
  }
}

function aiMove() {
  let move;
  if (difficulty === "easy") {
    move = getRandomMove();
  } else if (difficulty === "medium") {
    move = getSmartMove();
  } else {
    move = getBestMove();
  }

  updateCell(cells[move], move);
  checkWinner();

  if (running) {
    currentPlayer = "X";
    statusText.textContent = `${currentPlayer}'s turn`;
  }
}

function getRandomMove() {
  let empty = options.map((v, i) => (v === "" ? i : null)).filter(v => v !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function getSmartMove() {
  for (let condition of winConditions) {
    const [a, b, c] = condition;
    if (options[a] === "O" && options[b] === "O" && options[c] === "") return c;
    if (options[a] === "O" && options[c] === "O" && options[b] === "") return b;
    if (options[b] === "O" && options[c] === "O" && options[a] === "") return a;
  }

  for (let condition of winConditions) {
    const [a, b, c] = condition;
    if (options[a] === "X" && options[b] === "X" && options[c] === "") return c;
    if (options[a] === "X" && options[c] === "X" && options[b] === "") return b;
    if (options[b] === "X" && options[c] === "X" && options[a] === "") return a;
  }

  return getRandomMove();
}

function getBestMove() {
  let bestScore = -Infinity;
  let move;

  for (let i = 0; i < options.length; i++) {
    if (options[i] === "") {
      options[i] = "O";
      let score = minimax(options, 0, false);
      options[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(board, depth, isMaximizing) {
  let winner = getWinner(board, false);
  if (winner === "O") return 10 - depth;
  if (winner === "X") return depth - 10;
  if (!board.includes("")) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = "O";
        let score = minimax(board, depth + 1, false);
        board[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = "X";
        let score = minimax(board, depth + 1, true);
        board[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}
