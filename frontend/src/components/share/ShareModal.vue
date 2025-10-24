<template>
  <Modal :model-value="true" title="📤 分享成绩" @close="emit('close')">
    <div class="space-y-6">
      <!-- 成绩卡片预览 -->
      <div
        ref="shareCard"
        class="p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white"
      >
        <h3 class="text-2xl font-bold mb-4">我的1024游戏成绩</h3>
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span>得分</span>
            <span class="text-3xl font-bold">{{ gameStore.score }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span>最大方块</span>
            <span class="text-2xl font-bold">{{ gameStore.maxTile }}</span>
          </div>
          <div class="flex justify-between items-center text-sm opacity-90">
            <span>移动次数</span>
            <span>{{ gameStore.moves }}</span>
          </div>
        </div>
        <div class="mt-4 pt-4 border-t border-white/20 text-sm opacity-75">
          来挑战我吧！🎮
        </div>
      </div>

      <!-- 分享文本 -->
      <div>
        <label class="block text-sm font-medium mb-2">分享文本</label>
        <textarea
          v-model="shareText"
          readonly
          class="input font-mono text-sm"
          rows="4"
        ></textarea>
      </div>

      <!-- 分享按钮 -->
      <div class="grid grid-cols-2 gap-3">
        <button
          @click="copyText"
          class="btn-secondary"
        >
          {{ copied ? '✓ 已复制' : '📋 复制文本' }}
        </button>
        <button
          @click="downloadImage"
          class="btn-primary"
          :disabled="downloading"
        >
          {{ downloading ? '生成中...' : '💾 保存图片' }}
        </button>
      </div>

      <!-- 提示 -->
      <p class="text-xs text-center text-apple-gray-500">
        保存图片后可分享到微信、微博等社交平台
      </p>
    </div>
  </Modal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../../stores/game'
import Modal from '../common/Modal.vue'
import html2canvas from 'html2canvas'

const emit = defineEmits(['close'])

const gameStore = useGameStore()

const shareCard = ref(null)
const copied = ref(false)
const downloading = ref(false)

const shareText = computed(() => {
  return `我在1024游戏中获得了 ${gameStore.score} 分！
最大方块：${gameStore.maxTile}
移动次数：${gameStore.moves}

来挑战我吧！🎮`
})

const copyText = async () => {
  try {
    await navigator.clipboard.writeText(shareText.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('复制失败:', error)
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = shareText.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

const downloadImage = async () => {
  try {
    downloading.value = true

    const canvas = await html2canvas(shareCard.value, {
      backgroundColor: null,
      scale: 2
    })

    const link = document.createElement('a')
    link.download = `1024-game-score-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (error) {
    console.error('生成图片失败:', error)
    alert('生成图片失败，请稍后重试')
  } finally {
    downloading.value = false
  }
}
</script>
