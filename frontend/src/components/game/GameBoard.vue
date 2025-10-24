<template>
  <div class="game-board-container">
    <!-- 游戏面板背景 -->
    <div class="game-board card w-full aspect-square max-w-[500px] mx-auto p-4" style="position: relative;">
      <!-- 网格背景 -->
      <div class="grid grid-cols-4 gap-4 w-full h-full">
        <div
          v-for="i in 16"
          :key="i"
          class="rounded-xl bg-apple-gray-200 dark:bg-apple-gray-700/50"
        ></div>
      </div>

      <!-- 方块层 -->
      <div class="absolute top-4 left-4 right-4 bottom-4">
        <Tile
          v-for="(tile, index) in tiles"
          :key="tile.id"
          :value="tile.value"
          :row="tile.row"
          :col="tile.col"
          :is-new="tile.isNew"
          :is-merged="tile.isMerged"
        />
      </div>
    </div>

    <!-- 游戏结束遮罩 -->
    <Transition name="fade">
      <div
        v-if="gameStore.gameOver || gameStore.gameWon"
        class="absolute inset-0 flex items-center justify-center glass rounded-2xl"
      >
        <div class="text-center p-8 animate-slide-up">
          <h2 class="text-4xl font-bold mb-4">
            {{ gameStore.gameWon ? '🎉 恭喜你赢了!' : '游戏结束' }}
          </h2>
          <p class="text-2xl mb-2">得分: {{ gameStore.score }}</p>
          <p class="text-lg text-apple-gray-600 dark:text-apple-gray-400 mb-6">
            最大方块: {{ gameStore.maxTile }}
          </p>
          <div class="flex gap-4 justify-center">
            <button
              v-if="gameStore.gameWon"
              @click="gameStore.continueGame"
              class="btn-secondary"
            >
              继续游戏
            </button>
            <button @click="handleRestart" class="btn-primary">
              重新开始
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../../stores/game'
import Tile from './Tile.vue'

const gameStore = useGameStore()

// 将棋盘数据转换为方块数组
const tiles = computed(() => {
  const result = []
  let id = 0

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const value = gameStore.board[row][col]
      if (value !== 0) {
        result.push({
          id: `${row}-${col}-${id++}`,
          value,
          row,
          col,
          isNew: false, // 可以添加逻辑判断是否是新方块
          isMerged: false
        })
      }
    }
  }

  return result
})

// 键盘事件处理
const handleKeyDown = (e) => {
  const keyMap = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    w: 'up',
    s: 'down',
    a: 'left',
    d: 'right'
  }

  const direction = keyMap[e.key]
  if (direction) {
    e.preventDefault()
    gameStore.makeMove(direction)
  }
}

// 触摸事件处理
let touchStartX = 0
let touchStartY = 0

const handleTouchStart = (e) => {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

const handleTouchEnd = (e) => {
  if (!touchStartX || !touchStartY) return

  const touchEndX = e.changedTouches[0].clientX
  const touchEndY = e.changedTouches[0].clientY

  const diffX = touchStartX - touchEndX
  const diffY = touchStartY - touchEndY

  const minSwipeDistance = 30

  if (Math.abs(diffX) > Math.abs(diffY)) {
    // 水平滑动
    if (Math.abs(diffX) > minSwipeDistance) {
      gameStore.makeMove(diffX > 0 ? 'left' : 'right')
    }
  } else {
    // 垂直滑动
    if (Math.abs(diffY) > minSwipeDistance) {
      gameStore.makeMove(diffY > 0 ? 'up' : 'down')
    }
  }

  touchStartX = 0
  touchStartY = 0
}

const handleRestart = () => {
  gameStore.restart()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  document.addEventListener('touchstart', handleTouchStart)
  document.addEventListener('touchend', handleTouchEnd)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('touchstart', handleTouchStart)
  document.removeEventListener('touchend', handleTouchEnd)
})
</script>

<style scoped>
.game-board-container {
  position: relative;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
