<template>
  <div class="score-board flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
    <!-- Logo和标题 -->
    <div class="flex items-center gap-4">
      <h1 class="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        1024
      </h1>
    </div>

    <!-- 分数显示 -->
    <div class="flex gap-3">
      <div class="score-box card px-6 py-3 min-w-[120px]">
        <div class="text-xs text-apple-gray-600 dark:text-apple-gray-400 uppercase tracking-wider mb-1">
          分数
        </div>
        <div class="text-2xl font-bold score-value" :key="gameStore.score">
          {{ gameStore.score }}
        </div>
      </div>

      <div class="score-box card px-6 py-3 min-w-[120px]">
        <div class="text-xs text-apple-gray-600 dark:text-apple-gray-400 uppercase tracking-wider mb-1">
          最高分
        </div>
        <div class="text-2xl font-bold score-value" :key="gameStore.bestScore">
          {{ gameStore.bestScore }}
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex gap-3">
      <button
        @click="handleUndo"
        :disabled="!gameStore.canUndo"
        class="btn-secondary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        title="撤销 (最多10步)"
      >
        ↶ 撤销
      </button>

      <button
        @click="handleRestart"
        class="btn-primary px-4 py-2 text-sm"
      >
        🔄 重新开始
      </button>
    </div>
  </div>

  <!-- 游戏信息 -->
  <div class="game-info flex gap-6 text-sm text-apple-gray-600 dark:text-apple-gray-400 mb-6 justify-center">
    <div>
      移动: <span class="font-semibold">{{ gameStore.moves }}</span>
    </div>
    <div>
      最大方块: <span class="font-semibold">{{ gameStore.maxTile }}</span>
    </div>
    <div>
      用时: <span class="font-semibold">{{ formattedPlayTime }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../../stores/game'

const gameStore = useGameStore()

// 格式化游戏时间
const formattedPlayTime = computed(() => {
  const seconds = gameStore.playTime
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
})

// 定时器更新游戏时间
const timer = ref(null)
onMounted(() => {
  timer.value = setInterval(() => {
    // 触发playTime的重新计算
    gameStore.$patch({})
  }, 1000)
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})

const handleUndo = () => {
  gameStore.undo()
}

const handleRestart = () => {
  if (confirm('确定要重新开始吗？当前进度将丢失。')) {
    gameStore.restart()
  }
}
</script>

<style scoped>
.score-box {
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.score-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.score-value {
  display: inline-block;
  animation: scoreChange 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scoreChange {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
