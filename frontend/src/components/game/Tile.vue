<template>
  <div
    class="tile flex items-center justify-center rounded-xl font-bold"
    :class="[tileClass, animationClass]"
    :style="tileStyle"
  >
    <span class="tile-number">{{ displayValue }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    required: true
  },
  row: {
    type: Number,
    required: true
  },
  col: {
    type: Number,
    required: true
  },
  isNew: {
    type: Boolean,
    default: false
  },
  isMerged: {
    type: Boolean,
    default: false
  }
})

const displayValue = computed(() => props.value || '')

// 方块颜色和样式
const tileClass = computed(() => {
  if (props.value === 0) return 'invisible'

  const fontSize = props.value >= 1000 ? 'text-3xl' : props.value >= 100 ? 'text-4xl' : 'text-5xl'
  const textColor = props.value <= 4 ? 'text-apple-gray-700' : 'text-white'

  return `${fontSize} ${textColor} shadow-lg`
})

// 背景颜色
const backgroundColor = computed(() => {
  const colors = {
    2: '#eee4da',
    4: '#ede0c8',
    8: '#f2b179',
    16: '#f59563',
    32: '#f67c5f',
    64: '#f65e3b',
    128: '#edcf72',
    256: '#edcc61',
    512: '#edc850',
    1024: '#edc53f',
    2048: '#edc22e'
  }
  return colors[props.value] || '#3c3a32'
})

// 位置样式
const tileStyle = computed(() => {
  // 4x4网格，间隙1rem
  const gap = 1 // rem

  // 每个格子的大小：(100% - 3个间隙) / 4
  const cellSize = `calc((100% - ${3 * gap}rem) / 4)`

  // 位置 = 索引 * (格子大小 + 间隙)
  const left = props.col === 0 ? '0' : `calc(${props.col} * (${cellSize} + ${gap}rem))`
  const top = props.row === 0 ? '0' : `calc(${props.row} * (${cellSize} + ${gap}rem))`

  return {
    width: cellSize,
    height: cellSize,
    left: left,
    top: top,
    backgroundColor: backgroundColor.value,
    position: 'absolute'
  }
})

// 动画类
const animationClass = computed(() => {
  if (props.isNew) return 'animate-tile-appear'
  if (props.isMerged) return 'animate-tile-merge'
  return ''
})
</script>

<style scoped>
.tile {
  user-select: none;
  -webkit-user-select: none;
  z-index: 10;
  /* 平滑的位置和尺寸过渡 */
  transition:
    left 200ms cubic-bezier(0.4, 0.0, 0.2, 1),
    top 200ms cubic-bezier(0.4, 0.0, 0.2, 1),
    transform 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
  /* 添加轻微的阴影提升层次感 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tile-number {
  /* 数字也有过渡效果 */
  transition: transform 150ms ease-out;
}

/* 悬停效果（桌面端） */
@media (hover: hover) {
  .tile:hover .tile-number {
    transform: scale(1.05);
  }
}
</style>
