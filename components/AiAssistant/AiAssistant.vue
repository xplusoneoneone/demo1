<template>
  <view class="ai-assistant" 
        :style="{ left: position.x + 'px', top: position.y + 'px' }"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @click="handleClick">
    <view class="ai-icon" :class="{ 'breathing': !isDragging }">
      <image src="/static/ai-assistant/ai-chat.png" class="icon-image" />
    </view>
    <view class="click-hint" :class="{ 'show': showHint }">
      点击开始AI对话
    </view>
  </view>
</template>

<script>
export default {
  name: 'AiAssistant',
  data() {
    return {
      position: {
        x: 0,
        y: 0
      },
      isDragging: false,
      startPosition: { x: 0, y: 0 },
      startTouch: { x: 0, y: 0 },
      showHint: false,
      hintTimer: null
    }
  },
  mounted() {
    this.initPosition()
    this.showClickHint()
  },
  beforeUnmount() {
    if (this.hintTimer) {
      clearTimeout(this.hintTimer)
    }
  },
  methods: {
    initPosition() {
      // 获取屏幕尺寸
      const systemInfo = uni.getSystemInfoSync()
      const screenWidth = systemInfo.windowWidth
      const screenHeight = systemInfo.windowHeight
      
      // 从本地存储获取保存的位置，如果没有则使用默认位置
      const savedPosition = uni.getStorageSync('aiAssistantPosition')
      if (savedPosition) {
        this.position = savedPosition
      } else {
        // 默认位置：屏幕右侧中央
        this.position = {
          x: screenWidth - 80,
          y: screenHeight / 2 - 40
        }
      }
      
      // 确保位置在屏幕范围内
      this.constrainPosition()
    },
    
    constrainPosition() {
      const systemInfo = uni.getSystemInfoSync()
      const screenWidth = systemInfo.windowWidth
      const screenHeight = systemInfo.windowHeight
      
      this.position.x = Math.max(0, Math.min(this.position.x, screenWidth - 80))
      this.position.y = Math.max(0, Math.min(this.position.y, screenHeight - 80))
    },
    
    handleTouchStart(e) {
      this.isDragging = true
      this.startPosition = { ...this.position }
      this.startTouch = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      }
      
      // 隐藏提示
      this.showHint = false
      if (this.hintTimer) {
        clearTimeout(this.hintTimer)
      }
    },
    
    handleTouchMove(e) {
      if (!this.isDragging) return
      
      const deltaX = e.touches[0].clientX - this.startTouch.x
      const deltaY = e.touches[0].clientY - this.startTouch.y
      
      this.position.x = this.startPosition.x + deltaX
      this.position.y = this.startPosition.y + deltaY
      
      this.constrainPosition()
    },
    
    handleTouchEnd() {
      if (this.isDragging) {
        this.isDragging = false
        // 保存位置到本地存储
        uni.setStorageSync('aiAssistantPosition', this.position)
      }
    },
    
    handleClick() {
      if (this.isDragging) return
      
      // 跳转到AI聊天页面
      uni.navigateTo({
        url: '/pages/ai-chat/ai-chat'
      })
    },
    
    showClickHint() {
      // 延迟显示提示
      this.hintTimer = setTimeout(() => {
        this.showHint = true
        // 3秒后隐藏提示
        setTimeout(() => {
          this.showHint = false
        }, 3000)
      }, 2000)
    }
  }
}
</script>

<style scoped>
.ai-assistant {
  position: fixed;
  width: 80rpx;
  height: 80rpx;
  z-index: 9999;
  pointer-events: auto;
}

.ai-icon {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
  position: relative;
  overflow: hidden;
}

.ai-icon::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: rotate(45deg);
  animation: shine 3s infinite;
}

.ai-icon.breathing {
  animation: breathing 2s ease-in-out infinite;
}

.icon-image {
  width: 50rpx;
  height: 50rpx;
  z-index: 1;
}

.click-hint {
  position: absolute;
  top: -60rpx;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.click-hint.show {
  opacity: 1;
}

.click-hint::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border: 8rpx solid transparent;
  border-top-color: rgba(0, 0, 0, 0.8);
}

@keyframes breathing {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 12rpx 32rpx rgba(102, 126, 234, 0.6);
  }
}

@keyframes shine {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

/* 响应式适配 */
@media screen and (max-width: 750rpx) {
  .ai-assistant {
    width: 60rpx;
    height: 60rpx;
  }
  
  .icon-image {
    width: 40rpx;
    height: 40rpx;
  }
  
  .click-hint {
    font-size: 20rpx;
    padding: 6rpx 12rpx;
  }
}
</style>
