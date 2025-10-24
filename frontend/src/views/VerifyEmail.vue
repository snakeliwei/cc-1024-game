<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="card max-w-md w-full text-center">
      <div v-if="loading" class="py-8">
        <div class="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-apple-gray-600 dark:text-apple-gray-400">验证邮箱中...</p>
      </div>

      <div v-else-if="success" class="py-8">
        <div class="text-6xl mb-4">✓</div>
        <h2 class="text-2xl font-bold mb-2">邮箱验证成功！</h2>
        <p class="text-apple-gray-600 dark:text-apple-gray-400 mb-6">
          您的账号已激活，现在可以开始游戏了
        </p>
        <button @click="goHome" class="btn-primary">
          开始游戏
        </button>
      </div>

      <div v-else class="py-8">
        <div class="text-6xl mb-4">✗</div>
        <h2 class="text-2xl font-bold mb-2">验证失败</h2>
        <p class="text-apple-gray-600 dark:text-apple-gray-400 mb-6">
          {{ error || '验证链接无效或已过期' }}
        </p>
        <button @click="goHome" class="btn-secondary">
          返回首页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const success = ref(false)
const error = ref('')

onMounted(async () => {
  const token = route.params.token

  try {
    await api.get(`/auth/verify-email/${token}`)
    success.value = true
  } catch (err) {
    error.value = err.response?.data?.message || err.message
  } finally {
    loading.value = false
  }
})

const goHome = () => {
  router.push('/')
}
</script>
