import { defineStore } from 'pinia'
import {
  initBoard,
  move,
  addRandomTile,
  canMove,
  checkWin,
  getMaxTile,
  cloneBoard
} from '../utils/gameLogic'

export const useGameStore = defineStore('game', {
  state: () => ({
    board: initBoard(),
    score: 0,
    bestScore: parseInt(localStorage.getItem('bestScore')) || 0,
    gameOver: false,
    gameWon: false,
    moves: 0,
    startTime: Date.now(),
    history: [], // 用于撤销功能
    maxHistorySize: 10
  }),

  getters: {
    maxTile: (state) => getMaxTile(state.board),

    playTime: (state) => {
      return Math.floor((Date.now() - state.startTime) / 1000)
    },

    canUndo: (state) => state.history.length > 0,

    gameState: (state) => ({
      board: state.board,
      score: state.score,
      moves: state.moves,
      maxTile: getMaxTile(state.board),
      playTime: Math.floor((Date.now() - state.startTime) / 1000)
    })
  },

  actions: {
    // 移动方块
    makeMove(direction) {
      if (this.gameOver || this.gameWon) return false

      // 保存历史状态
      this.saveHistory()

      const result = move(this.board, direction)

      if (!result.moved) {
        // 没有移动，移除刚保存的历史
        this.history.pop()
        return false
      }

      // 更新状态
      this.board = result.board
      this.score += result.score
      this.moves++

      // 更新最高分
      if (this.score > this.bestScore) {
        this.bestScore = this.score
        localStorage.setItem('bestScore', this.bestScore)
      }

      // 添加新方块
      this.board = addRandomTile(this.board)

      // 检查游戏状态
      if (checkWin(this.board)) {
        this.gameWon = true
      } else if (!canMove(this.board)) {
        this.gameOver = true
      }

      return true
    },

    // 保存历史状态
    saveHistory() {
      this.history.push({
        board: cloneBoard(this.board),
        score: this.score,
        moves: this.moves
      })

      // 限制历史记录大小
      if (this.history.length > this.maxHistorySize) {
        this.history.shift()
      }
    },

    // 撤销
    undo() {
      if (this.history.length === 0) return

      const lastState = this.history.pop()
      this.board = lastState.board
      this.score = lastState.score
      this.moves = lastState.moves
      this.gameOver = false
      this.gameWon = false
    },

    // 重新开始
    restart() {
      this.board = initBoard()
      this.score = 0
      this.gameOver = false
      this.gameWon = false
      this.moves = 0
      this.startTime = Date.now()
      this.history = []
    },

    // 继续游戏（赢了之后）
    continueGame() {
      this.gameWon = false
    },

    // 重置最高分
    resetBestScore() {
      this.bestScore = 0
      localStorage.setItem('bestScore', 0)
    }
  }
})
