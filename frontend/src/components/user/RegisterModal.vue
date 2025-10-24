<template>
  <Modal :model-value="true" title="升级账号" @close="emit('close')">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <p class="text-sm text-apple-gray-600 dark:text-apple-gray-400 mb-4">
        注册账号后，您的游戏数据将被保存，并可以在多个设备上登录。
      </p>

      <div>
        <label class="block text-sm font-medium mb-2">邮箱</label>
        <input
          v-model="form.email"
          type="email"
          required
          class="input"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">昵称</label>
        <input
          v-model="form.nickname"
          type="text"
          required
          minlength="2"
          maxlength="20"
          class="input"
          placeholder="输入昵称"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">密码</label>
        <input
          v-model="form.password"
          type="password"
          required
          minlength="6"
          class="input"
          placeholder="至少6个字符"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">确认密码</label>
        <input
          v-model="form.confirmPassword"
          type="password"
          required
          class="input"
          placeholder="再次输入密码"
        />
      </div>

      <div v-if="error" class="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
        {{ error }}
      </div>

      <div v-if="success" class="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm">
        {{ success }}
      </div>

      <div class="flex gap-3 pt-4">
        <button
          type="button"
          @click="emit('close')"
          class="btn-secondary flex-1"
          :disabled="loading"
        >
          取消
        </button>
        <button
          type="submit"
          class="btn-primary flex-1"
          :disabled="loading"
        >
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </div>

      <p class="text-xs text-center text-apple-gray-500 dark:text-apple-gray-500">
        已有账号？
        <button
          type="button"
          @click="showLogin"
          class="text-blue-600 dark:text-blue-400 hover:underline"
        >
          立即登录
        </button>
      </p>
    </form>
  </Modal>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import Modal from '../common/Modal.vue'

const emit = defineEmits(['close', 'show-login'])

const authStore = useAuthStore()

const form = ref({
  email: '',
  nickname: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')
const success = ref('')

const handleSubmit = async () => {
  error.value = ''
  success.value = ''

  // 验证
  if (form.value.password !== form.value.confirmPassword) {
    error.value = '两次输入的密码不一致'
    return
  }

  if (form.value.password.length < 6) {
    error.value = '密码至少需要6个字符'
    return
  }

  try {
    loading.value = true
    await authStore.register(
      form.value.email,
      form.value.nickname,
      form.value.password
    )

    success.value = '注册成功！请查收验证邮件。'

    setTimeout(() => {
      emit('close')
    }, 2000)
  } catch (err) {
    error.value = err.response?.data?.message || err.message || '注册失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const showLogin = () => {
  emit('close')
  emit('show-login')
}
</script>
