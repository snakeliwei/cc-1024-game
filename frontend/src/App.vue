<template>
  <RouterView />
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // 检查并应用暗色模式
  const darkMode = localStorage.getItem('darkMode')
  if (darkMode === 'dark' || (!darkMode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
  }
})
</script>

<style>
/* 全局样式已在 main.css 中定义 */
</style>
