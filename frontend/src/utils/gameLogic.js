// 1024游戏核心逻辑

const GRID_SIZE = 4;

/**
 * 创建空棋盘
 */
export function createEmptyBoard() {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
}

/**
 * 复制棋盘
 */
export function cloneBoard(board) {
  return board.map(row => [...row]);
}

/**
 * 获取空位置
 */
export function getEmptyCells(board) {
  const emptyCells = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] === 0) {
        emptyCells.push({ row, col });
      }
    }
  }
  return emptyCells;
}

/**
 * 添加随机方块（90%概率为2，10%概率为4）
 */
export function addRandomTile(board) {
  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0) return board;

  const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = Math.random() < 0.9 ? 2 : 4;

  const newBoard = cloneBoard(board);
  newBoard[row][col] = value;
  return newBoard;
}

/**
 * 初始化游戏（添加两个方块）
 */
export function initBoard() {
  let board = createEmptyBoard();
  board = addRandomTile(board);
  board = addRandomTile(board);
  return board;
}

/**
 * 向左移动和合并
 */
function moveRowLeft(row) {
  // 移除0
  let newRow = row.filter(val => val !== 0);
  let score = 0;

  // 合并相同的数字
  for (let i = 0; i < newRow.length - 1; i++) {
    if (newRow[i] === newRow[i + 1]) {
      newRow[i] *= 2;
      score += newRow[i];
      newRow[i + 1] = 0;
    }
  }

  // 再次移除0
  newRow = newRow.filter(val => val !== 0);

  // 补齐到4位
  while (newRow.length < GRID_SIZE) {
    newRow.push(0);
  }

  return { row: newRow, score };
}

/**
 * 旋转棋盘（用于实现上下右移动）
 */
function rotateBoard(board) {
  const newBoard = createEmptyBoard();
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      newBoard[col][GRID_SIZE - 1 - row] = board[row][col];
    }
  }
  return newBoard;
}

/**
 * 移动棋盘
 * @param {Array} board - 当前棋盘
 * @param {string} direction - 方向: 'left', 'right', 'up', 'down'
 * @returns {Object} { board, score, moved }
 */
export function move(board, direction) {
  let workBoard = cloneBoard(board);
  let rotations = 0;

  // 通过旋转将所有方向转换为左移
  switch (direction) {
    case 'left':
      rotations = 0;
      break;
    case 'up':
      rotations = 1;
      workBoard = rotateBoard(workBoard);
      break;
    case 'right':
      rotations = 2;
      workBoard = rotateBoard(rotateBoard(workBoard));
      break;
    case 'down':
      rotations = 3;
      workBoard = rotateBoard(rotateBoard(rotateBoard(workBoard)));
      break;
  }

  let totalScore = 0;
  const newBoard = workBoard.map(row => {
    const { row: newRow, score } = moveRowLeft(row);
    totalScore += score;
    return newRow;
  });

  // 旋转回原方向
  let finalBoard = newBoard;
  for (let i = 0; i < (4 - rotations) % 4; i++) {
    finalBoard = rotateBoard(finalBoard);
  }

  // 检查是否有移动
  const moved = !boardsEqual(board, finalBoard);

  return {
    board: finalBoard,
    score: totalScore,
    moved
  };
}

/**
 * 比较两个棋盘是否相等
 */
function boardsEqual(board1, board2) {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board1[row][col] !== board2[row][col]) {
        return false;
      }
    }
  }
  return true;
}

/**
 * 检查是否还能移动
 */
export function canMove(board) {
  // 有空格就能移动
  if (getEmptyCells(board).length > 0) {
    return true;
  }

  // 检查是否有相邻相同的数字
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const current = board[row][col];

      // 检查右边
      if (col < GRID_SIZE - 1 && board[row][col + 1] === current) {
        return true;
      }

      // 检查下边
      if (row < GRID_SIZE - 1 && board[row + 1][col] === current) {
        return true;
      }
    }
  }

  return false;
}

/**
 * 检查是否获胜（达到1024或2048）
 */
export function checkWin(board, target = 1024) {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] >= target) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 获取最大方块值
 */
export function getMaxTile(board) {
  let max = 0;
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] > max) {
        max = board[row][col];
      }
    }
  }
  return max;
}

/**
 * 计算分数（基于棋盘状态）
 */
export function calculateBoardScore(board) {
  let score = 0;
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] > 0) {
        score += board[row][col];
      }
    }
  }
  return score;
}
