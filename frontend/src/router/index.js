import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/verify-email/:token',
    name: 'VerifyEmail',
    component: () => import('../views/VerifyEmail.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
