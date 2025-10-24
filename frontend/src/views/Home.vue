<template>
  <div class="home-page min-h-screen p-4 sm:p-8">
    <div class="max-w-2xl mx-auto">
      <!-- 顶部用户信息 -->
      <div class="flex justify-between items-center mb-8">
        <div class="text-sm text-apple-gray-600 dark:text-apple-gray-400">
          欢迎, <span class="font-semibold">{{ authStore.displayName }}</span>
        </div>
        <div class="flex gap-2">
          <button
            v-if="authStore.isGuest"
            @click="showRegisterModal = true"
            class="text-sm btn-secondary px-4 py-2"
          >
            注册账号
          </button>
          <button
            v-else
            @click="showLeaderboard = true"
            class="text-sm btn-secondary px-4 py-2"
          >
            📊 排行榜
          </button>
          <button
            @click="toggleDarkMode"
            class="text-sm btn-secondary px-4 py-2"
          >
            {{ isDark ? '☀️' : '🌙' }}
          </button>
        </div>
      </div>

      <!-- 分数面板 -->
      <ScoreBoard />

      <!-- 游戏面板 -->
      <GameBoard />

      <!-- 操作提示 -->
      <div class="mt-6 text-center text-sm text-apple-gray-600 dark:text-apple-gray-400">
        <p class="mb-2">使用方向键或 WASD 移动方块</p>
        <p>在触摸设备上滑动屏幕</p>
      </div>

      <!-- 分享按钮 -->
      <div class="mt-6 flex justify-center gap-4">
        <button
          @click="handleShare"
          class="btn-primary"
        >
          📤 分享成绩
        </button>
        <button
          @click="showLeaderboard = true"
          class="btn-secondary"
        >
          🏆 查看排行榜
        </button>
      </div>
    </div>

    <!-- 注册弹窗 -->
    <RegisterModal
      v-if="showRegisterModal"
      @close="showRegisterModal = false"
    />

    <!-- 排行榜弹窗 -->
    <Leaderboard
      v-if="showLeaderboard"
      @close="showLeaderboard = false"
    />

    <!-- 分享弹窗 -->
    <ShareModal
      v-if="showShareModal"
      @close="showShareModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useGameStore } from '../stores/game'
import GameBoard from '../components/game/GameBoard.vue'
import ScoreBoard from '../components/game/ScoreBoard.vue'
import RegisterModal from '../components/user/RegisterModal.vue'
import Leaderboard from '../components/leaderboard/Leaderboard.vue'
import ShareModal from '../components/share/ShareModal.vue'

const authStore = useAuthStore()
const gameStore = useGameStore()

const showRegisterModal = ref(false)
const showLeaderboard = ref(false)
const showShareModal = ref(false)
const isDark = ref(false)

onMounted(async () => {
  // 初始化认证
  await authStore.init()

  // 检查暗色模式
  isDark.value = document.documentElement.classList.contains('dark')
})

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark')
  localStorage.setItem('darkMode', isDark.value ? 'dark' : 'light')
}

const handleShare = () => {
  showShareModal.value = true
}
</script>

<style scoped>
.home-page {
  animation: fadeIn 0.5s ease-out;
}
</style>
