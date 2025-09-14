<!--
 * @Author: 徐佳德 1404577549@qq.com
 * @Date: 2025-07-06 18:18:32
 * @LastEditors: 徐佳德 1404577549@qq.com
 * @LastEditTime: 2025-09-13 14:09:46
 * @FilePath: \demo1\pages\index\User.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<!--
 * @Author: 徐佳德 1404577549@qq.com
 * @Date: 2025-07-06 18:18:32
 * @LastEditors: 徐佳德 1404577549@qq.com
 * @LastEditTime: 2025-07-28 15:46:43
 * @FilePath: \demo1\pages\index\User.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <view class="user-page">
    <!-- 用户信息头部 -->
    <view class="user-header">
      <!-- 退出登录按钮 - 仅在登录时显示 -->
      <view class="logout-button" v-if="isLogin" @click="logout">
        <image
        class="logout-icon"
          src="/static/icon/退出登录.png"
          mode="scaleToFill"
        />
      </view>
      
      <view class="user-info">
        <image class="user-avatar" :src="userInfo.avatar" mode="aspectFill" @click="changeAvatar"></image>
        <view class="user-details">
          <text class="user-nickname">{{userInfo.nickname}}</text>
          <text class="user-account">{{userInfo.account}}</text>
          <view class="user-completeness" v-if="userInfoCompleteness < 100 && isLogin">
            <text class="completeness-text">信息完整度: {{userInfoCompleteness}}%</text>
            <view class="completeness-bar">
              <view class="completeness-progress" :style="{width: userInfoCompleteness + '%'}"></view>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 功能按钮区域 - 仅在登录时显示 -->
    <view class="function-section" v-if="isLogin">
      <view class="function-grid">
        <view class="function-item" @click="goToPage('favorites')">
          <view class="function-icon">
            <text class="icon-text">❤</text>
          </view>
          <text class="function-title">我的收藏</text>
        </view>
        
        <view class="function-item" @click="goToPage('history')">
          <view class="function-icon">
            <text class="icon-text">📖</text>
          </view>
          <text class="function-title">历史浏览</text>
        </view>
        
        <view class="function-item" @click="goToPage('settings')">
          <view class="function-icon">
            <text class="icon-text">⚙</text>
          </view>
          <text class="function-title">设置</text>
        </view>
        
        <view class="function-item" @click="goToPage('page')">
          <view class="function-icon">
            <text class="icon-text">📄</text>
          </view>
          <text class="function-title">Page</text>
        </view>
      </view>
    </view>
    
    <!-- 未登录时的提示区域 -->
    <view class="login-prompt-section" v-if="!isLogin">
      <view class="login-prompt">
        <text class="prompt-title">请先登录</text>
        <text class="prompt-subtitle">登录后可享受更多功能</text>
        <view class="login-button" @click="goToLogin">
          <text class="login-button-text">立即登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import userApi from '../../api/user.js'

export default {
  components: {},
  data() {
    return {
      userInfo: {
        nickname: '张三',
        account: 'zhangsan123',
        avatar: '/static/avator.png'
      },
      loading: false,
      userInfoCompleteness: 0, // 用户信息完整度
      missingFields: [], // 缺失的字段
      isLogin: false // 登录状态
    }
  },
  computed: {},
  methods: {
    // 检查登录状态并加载数据
    checkLoginAndLoadData() {
      const app = getApp();
      this.isLogin = app.globalData.isLogin;
      
      if (app.globalData.isLogin) {
        // 已登录，获取用户信息
        this.getUserInfo();
      } else {
        // 未登录，显示默认信息
        this.userInfo = {
          nickname: '点击登录',
          account: '未登录',
          avatar: '/static/default-avatar.png',
          level: 0,
          points: 0,
          balance: 0
        };
      }
    },
    
    // 检查登录状态
    checkLoginStatus() {
      const app = getApp();
      this.isLogin = app.globalData.isLogin;
      
      if (app.globalData.isLogin && app.globalData.userInfo) {
        // 更新用户信息
        this.userInfo = { ...this.userInfo, ...app.globalData.userInfo };
        this.checkUserInfoCompleteness();
      }
    },
    
    // 跳转到登录页面
    goToLogin() {
      const currentPage = getCurrentPages()[getCurrentPages().length - 1];
      const redirectUrl = currentPage.route;
      
      uni.navigateTo({
        url: `/pages/login/EmailLogin?redirect=/${redirectUrl}`,
        fail: (error) => {
          console.error('跳转登录页面失败:', error);
        }
      });
    },
    
    // 用户登出
    async logout() {
      uni.showModal({
        title: '确认登出',
        content: '确定要退出登录吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              // 显示加载提示
              uni.showLoading({
                title: '退出中...'
              });
              
              // 清除本地存储（前端退出）
              uni.removeStorageSync('token');
              uni.removeStorageSync('userInfo');
              uni.removeStorageSync('isLogin');
              
              // 清除全局数据
              const app = getApp();
              if (app && app.globalData) {
                app.globalData.isLogin = false;
                app.globalData.userInfo = null;
                app.globalData.token = null;
              }
              
              // 更新页面状态
              this.isLogin = false;
              this.userInfo = {
                nickname: '点击登录',
                account: '未登录',
                avatar: '/static/default-avatar.png',
                level: 0,
                points: 0,
                balance: 0
              };
              
              uni.hideLoading();
              uni.showToast({
                title: '已退出登录',
                icon: 'success'
              });
              
              // 跳转到登录页面
              setTimeout(() => {
                this.goToLogin();
              }, 1500);
              
            } catch (error) {
              console.error('退出登录失败:', error);
              uni.hideLoading();
              
              uni.showToast({
                title: '退出登录成功',
                icon: 'success'
              });
              
              setTimeout(() => {
                this.goToLogin();
              }, 1500);
            }
          }
        }
      });
    },

    // 获取用户信息
    async getUserInfo() {
      try {
        this.loading = true;
        const result = await userApi.getUserInfo();
        if (result.code === 200) {
          this.userInfo = { ...this.userInfo, ...result.data };
          
          // 检查用户信息完整性
          this.checkUserInfoCompleteness();
          
          // 验证用户信息
          this.validateUserInfo();
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        uni.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },

    // 检查用户信息完整性
    checkUserInfoCompleteness() {
      const completeness = userApi.checkUserInfoCompleteness(this.userInfo);
      this.userInfoCompleteness = completeness.completeness;
      this.missingFields = completeness.missingFields;
      
      // 如果信息不完整，显示提示
      if (!completeness.isComplete) {
        console.log('用户信息不完整，缺失字段:', completeness.missingFields);
        console.log('完整度:', completeness.completeness + '%');
      }
    },

    // 验证用户信息
    validateUserInfo() {
      const validation = userApi.validateUserInfo(this.userInfo);
      if (!validation.isValid) {
        console.warn('用户信息验证失败:', validation.errors);
        // 可以选择显示错误提示
        uni.showToast({
          title: '用户信息格式有误',
          icon: 'none'
        });
      }
    },

    // 更换头像方法
    async changeAvatar() {
      // 如果未登录，跳转到登录页面
      if (!this.isLogin) {
        this.goToLogin();
        return;
      }
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          // 获取选择的图片路径
          const tempFilePath = res.tempFilePaths[0];
          
          try {
            // 显示上传中提示
            uni.showLoading({
              title: '上传中...'
            });
            
            // 上传头像到服务器
            const result = await userApi.uploadAvatar(tempFilePath);
            
            if (result.code === 200) {
              // 更新头像
              this.userInfo.avatar = result.data.avatarUrl;
              
              // 显示成功提示
              uni.showToast({
                title: '头像更换成功',
                icon: 'success'
              });
            } else {
              throw new Error(result.message || '上传失败');
            }
          } catch (error) {
            console.error('上传头像失败:', error);
            uni.showToast({
              title: '上传头像失败',
              icon: 'none'
            });
          } finally {
            uni.hideLoading();
          }
        },
        fail: (err) => {
          console.log('选择图片失败', err);
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          });
        }
      });
    },
    
    // 页面跳转方法
    async goToPage(page) {
      // 检查登录状态
      if (!this.isLogin) {
        this.goToLogin();
        return;
      }
      
      switch(page) {
        case 'favorites':
          try {
            // 获取收藏列表
            const result = await userApi.getFavorites();
            if (result.code === 200) {
              uni.showToast({
                title: `收藏数量: ${result.data.total}`,
                icon: 'none'
              });
            }
          } catch (error) {
            console.error('获取收藏失败:', error);
            uni.showToast({
              title: '获取收藏失败',
              icon: 'none'
            });
          }
          break;
        case 'history':
          try {
            // 获取浏览历史
            const result = await userApi.getHistory();
            if (result.code === 200) {
              uni.showToast({
                title: `历史记录: ${result.data.total}条`,
                icon: 'none'
              });
            }
          } catch (error) {
            console.error('获取历史失败:', error);
            uni.showToast({
              title: '获取历史失败',
              icon: 'none'
            });
          }
          break;
        case 'settings':
          try {
            // 获取用户设置
            const result = await userApi.getUserSettings();
            if (result.code === 200) {
              uni.showToast({
                title: '设置获取成功',
                icon: 'success'
              });
            }
          } catch (error) {
            console.error('获取设置失败:', error);
            uni.showToast({
              title: '获取设置失败',
              icon: 'none'
            });
          }
          break;
        case 'page':
          uni.showToast({
            title: '跳转到Page',
            icon: 'none'
          });
          break;
      }
    }
  },
  watch: {},
  onLoad() {
    // 页面加载时检查登录状态并获取用户信息
    this.checkLoginAndLoadData();
  },
  onReady() {},
  onShow() {
    // 页面显示时检查登录状态
    this.checkLoginStatus();
  },
  onHide() {},
  onUnload() {},
}
</script>

<style scoped>
.user-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 用户信息头部 */
.user-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx 40rpx;
  color: white;
  position: relative;
}

/* 退出登录按钮 */
.logout-button {
  position: absolute;
  top: 60rpx;
  right: 40rpx;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10rpx);
  transition: all 0.3s ease;
  z-index: 10;
}

.logout-button:active {
  transform: scale(0.9);
  background-color: rgba(255, 255, 255, 0.3);
}

.logout-icon {
  width: 20px;
  height: 20px;
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  margin-right: 30rpx;
  cursor: pointer;
  transition: transform 0.2s;
}

.user-avatar:active {
  transform: scale(0.95);
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-nickname {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.user-account {
  font-size: 28rpx;
  opacity: 0.8;
  margin-bottom: 10rpx;
}

.user-completeness {
  margin-top: 10rpx;
}

.completeness-text {
  font-size: 24rpx;
  opacity: 0.9;
  margin-bottom: 8rpx;
  display: block;
}

.completeness-bar {
  width: 100%;
  height: 6rpx;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3rpx;
  overflow: hidden;
}

.completeness-progress {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  border-radius: 3rpx;
  transition: width 0.3s ease;
}

/* 功能按钮区域 */
.function-section {
  background-color: white;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 40rpx 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.function-grid {
  display: flex;
  justify-content: space-around;
  flex-direction: row;
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  padding: 20rpx 10rpx;
  transition: transform 0.2s;
}

.function-item:active {
  transform: scale(0.95);
}

.function-icon {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15rpx;
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.icon-text {
  font-size: 32rpx;
  color: white;
}

.function-title {
  font-size: 24rpx;
  color: #333;
  text-align: center;
  line-height: 1.2;
}

/* 未登录时的提示区域 */
.login-prompt-section {
  background-color: white;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
  text-align: center;
}

.login-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.prompt-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.prompt-subtitle {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 40rpx;
  line-height: 1.5;
}

.login-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50rpx;
  padding: 20rpx 60rpx;
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
  transition: transform 0.2s;
}

.login-button:active {
  transform: scale(0.95);
}

.login-button-text {
  color: white;
  font-size: 28rpx;
  font-weight: bold;
}
</style>