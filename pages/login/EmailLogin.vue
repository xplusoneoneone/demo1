<!--
 * @Author: 徐佳德 1404577549@qq.com
 * @Date: 2025-09-13 11:40:56
 * @LastEditors: 徐佳德 1404577549@qq.com
 * @LastEditTime: 2025-09-17 10:41:31
 * @FilePath: \demo1\pages\login\EmailLogin.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <view class="email-login-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="nav-bar">
        <view class="nav-back" @click="goBack">
        <image src="/static/icon/返回.png" mode="aspectFit" class="back-icon"></image>
        <text class="back-text">返回</text>
        </view>
        <text class="nav-title">邮箱登录</text>
        <view class="nav-placeholder"></view>
      </view>
      <view class="header-subtitle">使用邮箱验证码登录</view>
    </view>

    <!-- 登录表单 -->
    <view class="login-form">
      <!-- 邮箱输入框 -->
      <view class="input-group">
        <view class="input-label">邮箱地址</view>
        <view class="input-wrapper">
          <input 
            v-model="email" 
            type="text" 
            placeholder="请输入邮箱地址"
            class="input-field"
            @input="onEmailInput"
            @blur="validateEmail"
          />
        </view>
        <view v-if="emailError" class="error-text">{{ emailError }}</view>
      </view>

      <!-- 验证码输入框 -->
      <view class="input-group">
        <view class="input-label">验证码</view>
        <view class="input-wrapper">
          <input 
            v-model="code" 
            type="number" 
            placeholder="请输入验证码"
            class="input-field"
            maxlength="6"
            @input="onCodeInput"
          />
          <view class="code-btn" :class="{ disabled: !canSendCode || countdown > 0 }" @click="sendCode">
            {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
          </view>
        </view>
        <view v-if="codeError" class="error-text">{{ codeError }}</view>
      </view>

      <!-- 登录按钮 -->
      <button 
        class="login-btn"
        @click="handleLogin"
        :disabled="loading"
      >
        {{ loading ? '登录中...' : '登录' }}
      </button>

      <!-- 其他登录方式 -->
      <view class="other-login">
        <view class="divider">
          <view class="divider-line"></view>
          <view class="divider-text">其他登录方式</view>
          <view class="divider-line"></view>
        </view>
        
        <view class="login-options">
          <button class="option-btn" @click="goToWxLogin">
            <view class="option-icon">🔗</view>
            <view class="option-text">微信授权登录</view>
          </button>
        </view>
      </view>
    </view>

    <!-- 用户协议勾选 -->
    <view class="agreement-section">
      <view class="agreement-checkbox" @click="toggleAgreement">
        <view class="checkbox" :class="{ checked: agreeToTerms }">
          <text v-if="agreeToTerms" class="checkmark">✓</text>
        </view>
        <view class="agreement-text">
          我已阅读并同意
          <text class="link-text" @click.stop="showTerms">《用户协议》</text>
          和
          <text class="link-text" @click.stop="showPrivacy">《隐私政策》</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { userApi } from '@/api/user.js'

export default {
  name: 'EmailLogin',
  data() {
    return {
      email: '',
      code: '',
      emailError: '',
      codeError: '',
      loading: false,
      countdown: 0,
      timer: null,
      agreeToTerms: false  // 是否同意用户协议和隐私政策
    }
  },
  computed: {
    // 邮箱格式验证
    isValidEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(this.email)
    },
    
    // 是否可以发送验证码
    canSendCode() {
      return this.isValidEmail && this.countdown === 0
    },
    
  },
  onLoad() {
    // 页面加载时的初始化
    this.initPage()
  },
  onUnload() {
    // 页面卸载时清除定时器
    this.clearTimer()
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack({
        delta: 1
      });
    },
    
    // 切换协议勾选状态
    toggleAgreement() {
      this.agreeToTerms = !this.agreeToTerms
    },
    
    // 初始化页面
    initPage() {
      // 检查是否已经登录
      if (userApi.checkLoginStatus()) {
        uni.showToast({
          title: '您已登录',
          icon: 'none'
        })
        this.goBack()
        return
      }
    },

    // 邮箱输入处理
    onEmailInput(e) {
      this.email = e.detail.value.trim()
      this.emailError = ''
    },

    // 验证码输入处理
    onCodeInput(e) {
      this.code = e.detail.value.trim()
      this.codeError = ''
    },

    // 验证邮箱格式
    validateEmail() {
      if (this.email && !this.isValidEmail) {
        this.emailError = '请输入正确的邮箱格式'
      } else {
        this.emailError = ''
      }
    },

    // 发送验证码
    async sendCode() {
      if (!this.canSendCode) {
        if (!this.isValidEmail) {
          this.emailError = '请输入正确的邮箱格式'
        }
        return
      }

      try {
        uni.showLoading({
          title: '发送中...'
        })

        const result = await userApi.sendEmailCode(this.email)
        
        uni.hideLoading()
        
        if (result.code === 200) {
          uni.showToast({
            title: '验证码已发送',
            icon: 'success'
          })
          this.startCountdown()
        } else {
          uni.showToast({
            title: result.message || '发送失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.message || '发送失败，请重试',
          icon: 'none'
        })
        console.error('发送验证码失败:', error)
      }
    },

    // 开始倒计时
    startCountdown() {
      this.countdown = 30
      this.timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          this.clearTimer()
        }
      }, 1000)
    },

    // 清除定时器
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
        this.countdown = 0
      }
    },

    // 处理登录
    async handleLogin() {
      if (this.loading) {
        return
      }
      
      // 检查邮箱是否为空
      if (!this.email.trim()) {
        uni.showToast({
          title: '请输入邮箱地址',
          icon: 'none'
        })
        return
      }
      
      // 检查邮箱格式
      if (!this.isValidEmail) {
        uni.showToast({
          title: '请输入正确的邮箱格式',
          icon: 'none'
        })
        return
      }
      
      // 检查验证码是否为空
      if (!this.code.trim()) {
        uni.showToast({
          title: '请输入验证码',
          icon: 'none'
        })
        return
      }
      
      // 检查是否同意用户协议
      if (!this.agreeToTerms) {
        uni.showToast({
          title: '请先同意用户协议和隐私政策',
          icon: 'none'
        })
        return
      }

      this.loading = true
      
      try {
        const result = await userApi.loginByEmailCode(this.email, this.code)
        
        if (result.code === 200 && result.data) {
          // 保存登录信息
          const { token } = result.data
          
          // 先保存token，然后获取用户信息
          uni.setStorageSync('token', token)
          
          try {
            // 获取用户信息
            const userInfoResult = await userApi.getUserInfo()
            
            if (userInfoResult.code === 200 && userInfoResult.data) {
              const userInfo = userInfoResult.data
              
              // 保存完整的登录信息
              userApi.saveLoginInfo(token, userInfo)
              
              // 更新全局登录状态
              getApp().setUserLoginInfo(token, userInfo)
              
              console.log('登录成功，用户信息:', userInfo)
            } else {
              throw new Error(userInfoResult.message || '获取用户信息失败')
            }
          } catch (userInfoError) {
            console.error('获取用户信息失败:', userInfoError)
            
            // 即使获取用户信息失败，也要保存token，用户可以稍后手动刷新
            userApi.saveLoginInfo(token, null)
            getApp().setUserLoginInfo(token, null)
            
            uni.showToast({
              title: '登录成功，但获取用户信息失败',
              icon: 'none'
            })
          }
          
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          })
          
          // 延迟跳转，让用户看到成功提示
          setTimeout(() => {
            this.handleLoginSuccess()
          }, 1000)
        } else {
          uni.showToast({
            title: result.message || '登录失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.showToast({
          title: error.message || '登录失败，请重试',
          icon: 'none'
        })
        console.error('登录失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 跳转到微信登录
    goToWxLogin() {
      // 这里可以跳转到微信授权登录页面
      uni.showToast({
        title: '微信登录功能开发中',
        icon: 'none'
      })
    },

    // 显示隐私政策
    showPrivacy() {
      uni.showModal({
        title: '隐私政策',
        content: '这里是隐私政策内容...',
        showCancel: false
      })
    },

    // 显示用户协议
    showTerms() {
      uni.showModal({
        title: '用户协议',
        content: '这里是用户协议内容...',
        showCancel: false
      })
    },

    // 处理登录成功后的跳转
    handleLoginSuccess() {
      // 检查是否有重定向URL
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const options = currentPage.options || {}
      const redirectUrl = options.redirect
      
      if (redirectUrl) {
        // 跳转到重定向页面
        try {
          const decodedUrl = decodeURIComponent(redirectUrl)
          if (decodedUrl.startsWith('/')) {
            uni.redirectTo({
              url: decodedUrl,
              fail: () => {
                // 如果重定向失败，返回首页
                this.goBack()
              }
            })
          } else {
            this.goBack()
          }
        } catch (error) {
          console.error('重定向URL解析失败:', error)
          this.goBack()
        }
      } else {
        this.goBack()
      }
    },

    // 返回上一页
    goBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.reLaunch({
          url: '/pages/index/index'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.email-login-container {
  min-height: 100vh;
  padding: 0 40rpx;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 120rpx 0 80rpx;
  text-align: center;
  
  .nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40rpx;
    margin-bottom: 20rpx;
    
    .nav-back {
      display: flex;
      align-items: center;
      color: #ffffff;
      font-size: 32rpx;
      
      .back-icon {
        width: 12px;
        height: 12px;
        margin-right: 10rpx;
        display: block;
        flex-shrink: 0;
      }
      
      .back-text {
        font-size: 28rpx;
      }
    }
    
    .nav-title {
      font-size: 48rpx;
      font-weight: bold;
      color:black;
      flex: 1;
      text-align: center;
    }
    
    .nav-placeholder {
      width: 120rpx; /* 占位，保持标题居中 */
    }
  }
  
  .header-subtitle {
    font-size: 28rpx;
    color: black;
  }
}

.login-form {
  flex: 1;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.1);
}

.input-group {
  margin-bottom: 40rpx;
  
  .input-label {
    font-size: 28rpx;
    color: #333333;
    margin-bottom: 20rpx;
    font-weight: 500;
  }
  
  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: #f8f9fa;
    border-radius: 12rpx;
    border: 2rpx solid #e9ecef;
    transition: border-color 0.3s;
    
    &:focus-within {
      border-color: #667eea;
    }
    
    .input-field {
      flex: 1;
      padding: 24rpx 20rpx;
      font-size: 32rpx;
      color: #333333;
      background: transparent;
      border: none;
      outline: none;
      
      &::placeholder {
        color: #999999;
      }
    }
    
    .input-icon {
      padding: 0 20rpx;
      font-size: 32rpx;
      color: #999999;
    }
    
    .code-btn {
      padding: 16rpx 24rpx;
      background: #667eea;
      color: #ffffff;
      font-size: 24rpx;
      border-radius: 8rpx;
      margin-right: 20rpx;
      white-space: nowrap;
      transition: background-color 0.3s;
      
      &:active {
        background: #5a6fd8;
      }
    }
  }
  
  .error-text {
    font-size: 24rpx;
    color: #ff4757;
    margin-top: 10rpx;
    margin-left: 10rpx;
  }
}

.login-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 12rpx;
  border: none;
  margin-top: 40rpx;
  transition: all 0.3s;
  
  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 8rpx 20rpx rgba(102, 126, 234, 0.3);
  }
}

.other-login {
  margin-top: 60rpx;
  
  .divider {
    display: flex;
    align-items: center;
    margin-bottom: 40rpx;
    
    .divider-line {
      flex: 1;
      height: 2rpx;
      background: #e9ecef;
    }
    
    .divider-text {
      padding: 0 20rpx;
      font-size: 24rpx;
      color: #999999;
    }
  }
  
  .login-options {
    display: flex;
    justify-content: center;
    
    .option-btn {
      display: flex;
      align-items: center;
      padding: 20rpx 40rpx;
      background: #ffffff;
      border: 2rpx solid #e9ecef;
      border-radius: 12rpx;
      font-size: 28rpx;
      color: #333333;
      transition: all 0.3s;
      
      &:active {
        background: #f8f9fa;
        border-color: #667eea;
      }
      
      .option-icon {
        margin-right: 12rpx;
        font-size: 32rpx;
      }
      
      .option-text {
        font-weight: 500;
      }
    }
  }
}

.agreement-section {
  padding: 40rpx 60rpx 60rpx;
  
  .agreement-checkbox {
    display: flex;
    align-items: flex-start;
    cursor: pointer;
    
    .checkbox {
      width: 32rpx;
      height: 32rpx;
      border: 2rpx solid #007AFF;
      border-radius: 50%;
      margin-right: 20rpx;
      margin-top: 4rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.3s ease;
      
      &.checked {
        background-color: #007AFF;
        border-color: #007AFF;
      }
      
      .checkmark {
        color: #ffffff;
        font-size: 20rpx;
        font-weight: bold;
      }
    }
    
    .agreement-text {
      font-size: 24rpx;
      color: rgba(0, 0, 0, 0.8);
      line-height: 1.6;
      flex: 1;
      
      .link-text {
        color: #007AFF;
        text-decoration: underline;
      }
    }
  }
}

// 响应式适配
@media screen and (max-width: 750rpx) {
  .email-login-container {
    padding: 0 30rpx;
  }
  
  .login-form {
    padding: 40rpx 30rpx;
  }
  
  .header {
    padding: 100rpx 0 60rpx;
    
    .header-title {
      font-size: 42rpx;
    }
  }
}
</style>
