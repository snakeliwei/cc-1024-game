import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || localStorage.getItem('guestToken') || null,
    isGuest: !localStorage.getItem('token'),
    loading: false,
    initialized: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isRegistered: (state) => !state.isGuest && !!state.user?.email,
    displayName: (state) => state.user?.nickname || '游客'
  },

  actions: {
    // 初始化认证状态
    async init() {
      if (this.initialized) return

      try {
        // 如果有token，尝试获取用户信息
        if (this.token) {
          await this.fetchUserProfile()
        } else {
          // 创建游客账号
          await this.initGuest()
        }
      } catch (error) {
        console.error('初始化认证失败:', error)
        // 如果获取用户信息失败，创建新游客
        await this.initGuest()
      } finally {
        this.initialized = true
      }
    },

    // 创建游客账号
    async initGuest() {
      try {
        this.loading = true
        const { data } = await api.post('/auth/guest')

        this.user = {
          uuid: data.uuid,
          nickname: data.nickname,
          isGuest: true
        }
        this.token = data.token
        this.isGuest = true

        localStorage.setItem('guestToken', data.token)
      } catch (error) {
        console.error('创建游客账号失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 获取用户信息
    async fetchUserProfile() {
      try {
        const { data } = await api.get('/user/profile')
        this.user = data.user
        this.isGuest = data.user.isGuest
      } catch (error) {
        console.error('获取用户信息失败:', error)
        // 清除无效token
        this.logout()
        throw error
      }
    },

    // 游客升级为正式用户
    async register(email, nickname, password) {
      try {
        this.loading = true
        const { data } = await api.post('/auth/register', {
          email,
          nickname,
          password
        })

        return data
      } catch (error) {
        console.error('注册失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 登录
    async login(email, password) {
      try {
        this.loading = true
        const { data } = await api.post('/auth/login', {
          email,
          password
        })

        this.user = data.user
        this.token = data.token
        this.isGuest = false

        // 切换到正式用户token
        localStorage.removeItem('guestToken')
        localStorage.setItem('token', data.token)

        return data
      } catch (error) {
        console.error('登录失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 登出
    logout() {
      this.user = null
      this.token = null
      this.isGuest = true

      localStorage.removeItem('token')
      localStorage.removeItem('guestToken')

      // 重新创建游客账号
      this.initGuest()
    },

    // 更新用户信息
    async updateProfile(data) {
      try {
        this.loading = true
        const response = await api.put('/user/profile', data)
        this.user = { ...this.user, ...response.data.user }
        return response.data
      } catch (error) {
        console.error('更新用户信息失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
