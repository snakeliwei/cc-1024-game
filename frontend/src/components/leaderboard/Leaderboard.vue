<template>
  <Modal :model-value="true" title="🏆 排行榜" @close="emit('close')">
    <div class="space-y-4">
      <!-- 时间周期选择 -->
      <div class="flex gap-2 mb-4">
        <button
          v-for="period in periods"
          :key="period.value"
          @click="currentPeriod = period.value"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            currentPeriod === period.value
              ? 'bg-blue-600 text-white'
              : 'bg-apple-gray-100 dark:bg-apple-gray-800 hover:bg-apple-gray-200 dark:hover:bg-apple-gray-700'
          ]"
        >
          {{ period.label }}
        </button>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- 排行榜列表 -->
      <div v-else-if="rankings.length > 0" class="space-y-2">
        <div
          v-for="(rank, index) in rankings"
          :key="rank.id"
          class="flex items-center gap-4 p-3 rounded-xl bg-apple-gray-100 dark:bg-apple-gray-800/50 hover:bg-apple-gray-200 dark:hover:bg-apple-gray-700/50 transition-colors"
        >
          <!-- 排名 -->
          <div class="flex-shrink-0 w-8 text-center font-bold">
            <span
              v-if="index < 3"
              class="text-2xl"
            >
              {{ ['🥇', '🥈', '🥉'][index] }}
            </span>
            <span v-else class="text-apple-gray-600 dark:text-apple-gray-400">
              {{ index + 1 }}
            </span>
          </div>

          <!-- 用户信息 -->
          <div class="flex-1 min-w-0">
            <div class="font-semibold truncate">{{ rank.nickname }}</div>
            <div class="text-sm text-apple-gray-600 dark:text-apple-gray-400">
              最大方块: {{ rank.maxTile }}
            </div>
          </div>

          <!-- 分数 -->
          <div class="text-right">
            <div class="text-lg font-bold">{{ rank.score.toLocaleString() }}</div>
            <div class="text-xs text-apple-gray-600 dark:text-apple-gray-400">
              {{ formatDate(rank.createdAt) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-8 text-apple-gray-500">
        暂无排行榜数据
      </div>

      <!-- 我的排名 -->
      <div v-if="myRank" class="mt-6 pt-4 border-t border-apple-gray-200 dark:border-apple-gray-700">
        <div class="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
          <div class="text-sm text-apple-gray-600 dark:text-apple-gray-400 mb-1">我的最佳成绩</div>
          <div class="flex justify-between items-center">
            <span class="font-semibold">排名: #{{ myRank.rank }}</span>
            <span class="font-bold text-lg">{{ myRank.score.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'
import Modal from '../common/Modal.vue'

const emit = defineEmits(['close'])

const periods = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '全部', value: 'all' }
]

const currentPeriod = ref('all')
const loading = ref(false)
const rankings = ref([])
const myRank = ref(null)

const fetchLeaderboard = async () => {
  try {
    loading.value = true
    const { data } = await api.get('/leaderboard', {
      params: {
        period: currentPeriod.value,
        limit: 100
      }
    })

    rankings.value = data.rankings || []
    myRank.value = data.myRank || null
  } catch (error) {
    console.error('获取排行榜失败:', error)
    // 模拟数据用于测试
    rankings.value = []
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now - d

  if (diff < 86400000) { // 24小时内
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return '刚刚'
    return `${hours}小时前`
  } else {
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
}

onMounted(() => {
  fetchLeaderboard()
})
</script>
