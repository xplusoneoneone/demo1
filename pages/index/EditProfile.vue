<!--
 * @Author: 徐佳德 1404577549@qq.com
 * @Date: 2025-01-27 00:00:00
 * @LastEditors: 徐佳德 1404577549@qq.com
 * @LastEditTime: 2025-09-17 20:13:45
 * @FilePath: \demo1\pages\index\EditProfile.vue
 * @Description: 个人信息编辑页面
-->
<template>
  <view class="edit-profile-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-left" @click="goBack">
        <image
        class="back-icon"
          src="/static/arrow-left (1).png"
          mode="scaleToFill"
        />
      </view>
      <text class="header-title">编辑个人信息</text>
      
    </view>
    
    <!-- 编辑表单 -->
    <view class="form-container">
      <!-- 基本信息 -->
      <view class="form-section">
        <view class="section-title">基本信息</view>
        
        <!-- 头像 -->
        <view class="form-item">
          <text class="item-label">头像</text>
          <view class="avatar-section" @click="changeAvatar">
            <image class="profile-avatar" :src="formData.avatar" mode="aspectFill"></image>
            <image
            class="arrow-icon"
              src="/static/arrow-right (1).png"
              mode="scaleToFill"
            />
            
          </view>
        </view>
        
        <!-- 昵称 -->
        <view class="form-item">
          <text class="item-label">昵称</text>
          <input 
            class="item-input" 
            v-model="formData.nickname" 
            placeholder="请输入昵称"
            maxlength="20"
          />
        </view>
        
        <!-- 性别 -->
        <view class="form-item">
          <text class="item-label">性别</text>
          <view class="gender-selector">
            <view 
              class="gender-option" 
              :class="{ active: formData.sex === '男' }"
              @click="selectGender('male')"
            >
              <text class="gender-text">男</text>
            </view>
            <view 
              class="gender-option" 
              :class="{ active: formData.sex === '女' }"
              @click="selectGender('female')"
            >
              <text class="gender-text">女</text>
            </view>
          </view>
        </view>
        
        <!-- 手机号 -->
        <view class="form-item">
          <text class="item-label">手机号</text>
          <input 
            class="item-input" 
            v-model="formData.phone" 
            placeholder="请输入手机号"
            type="number"
            maxlength="11"
          />
        </view>
        
        <!-- 生日 -->
        <view class="form-item">
          <text class="item-label">生日</text>
          <picker 
            mode="date" 
            :value="formData.birthday" 
            @change="onBirthdayChange"
            :end="currentDate"
          >
            <view class="date-picker">
              <text class="date-text" :class="{ placeholder: !formData.birthday }">
                {{ formData.birthday || '请选择生日' }}
              </text>
              <image
              class="arrow-icon"
                src="/static/arrow-right (1).png"
                mode="scaleToFill"
              />
            </view>
          </picker>
        </view>
        
        <!-- 个人签名 -->
        <view class="form-item">
          <text class="item-label">个人签名</text>
          <textarea 
            class="item-textarea" 
            v-model="formData.signature" 
            placeholder="请输入个人签名"
            maxlength="100"
            auto-height
          />
        </view>
      </view>
    </view>
    
    <!-- 底部操作按钮 -->
    <view class="bottom-actions">
      <view class="action-button cancel-button" @click="goBack">
        <text class="button-text">取消</text>
      </view>
      <view class="action-button save-button" @click="saveProfile">
        <text class="button-text">保存</text>
      </view>
    </view>
  </view>
</template>

<script>
import userApi from '../../api/user.js'

export default {
  data() {
    return {
      formData: {
        avatar: '/static/avator.png',
        realName: '',
        nickname: '',
        sex: '',
        age: '',
        phone: '',
        birthday: '',
        signature: '',
        email: '',
        username: '',
        name: '',
        idCartNumber: '',
        idCartType: '',
        userType: '',
        createTime: null
      },
      originalData: {}, // 保存原始数据
      currentDate: '', // 当前日期
      loading: false
    }
  },
  onLoad() {
    this.initData();
  },
  methods: {
    // 初始化数据
    initData() {
      // 设置当前日期
      const now = new Date();
      this.currentDate = now.getFullYear() + '-' + 
        String(now.getMonth() + 1).padStart(2, '0') + '-' + 
        String(now.getDate()).padStart(2, '0');
      
      // 获取用户信息
      this.getUserInfo();
    },
    
    // 获取用户信息
    async getUserInfo() {
      try {
        const result = await userApi.getUserInfo();
        if (result.code === 200) {
          this.formData = {
            avatar: result.data.avatar || '/static/avator.png',
            realName: result.data.realName || '',
            nickname: result.data.nickname || '',
            sex: result.data.sex || '',
            age: result.data.age || '',
            phone: result.data.phone || '',
            birthday: result.data.birthday || '',
            signature: result.data.signature || '',
            email: result.data.email || '',
            username: result.data.username || '',
            name: result.data.name || '',
            idCartNumber: result.data.idCartNumber || '',
            idCartType: result.data.idCartType || '',
            userType: result.data.userType || '',
            createTime: result.data.createTime || null
          };
          
          // 保存原始数据
          this.originalData = { ...this.formData };
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        uni.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        });
      }
    },
    
    // 选择性别
    selectGender(gender) {
      this.formData.sex = gender === 'male' ? '男' : '女';
    },
    
    // 生日选择
    onBirthdayChange(e) {
      this.formData.birthday = e.detail.value;
    },
    
    // 更换头像
    async changeAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];
          
          try {
            uni.showLoading({
              title: '上传中...'
            });
            
            const result = await userApi.uploadAvatar(tempFilePath);
            
            if (result.code === 200) {
              this.formData.avatar = result.data.avatarUrl;
              uni.showToast({
                title: '头像上传成功',
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
    
    // 保存个人信息
    async saveProfile() {
      // 验证表单
      if (!this.validateForm()) {
        return;
      }
      
      try {
        this.loading = true;
        uni.showLoading({
          title: '保存中...'
        });
        
        // 准备保存的数据
        const saveData = {};
        const changedFields = [];
        
        // 检查哪些字段发生了变化
        Object.keys(this.formData).forEach(key => {
          if (this.formData[key] !== this.originalData[key]) {
            saveData[key] = this.formData[key];
            changedFields.push(key);
          }
        });
        
        if (changedFields.length === 0) {
          uni.hideLoading();
          uni.showToast({
            title: '没有修改内容',
            icon: 'none'
          });
          return;
        }
        
        // 调用API保存
        const result = await userApi.updateUserInfo(saveData);
        
        if (result.code === 200) {
          uni.hideLoading();
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          });
          
          // 刷新全局用户信息
          const app = getApp();
          if (app && app.globalData && app.refreshUserInfo) {
            try {
              // 使用App的refreshUserInfo方法获取最新的用户信息
              await app.refreshUserInfo();
            } catch (error) {
              console.warn('刷新全局用户信息失败，使用本地更新:', error);
              // 如果刷新失败，使用本地更新
              app.globalData.userInfo = { ...app.globalData.userInfo, ...saveData };
              uni.setStorageSync('userInfo', app.globalData.userInfo);
            }
          }
          
          // 延迟返回上一页
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } else {
          throw new Error(result.message || '保存失败');
        }
      } catch (error) {
        console.error('保存个人信息失败:', error);
        uni.hideLoading();
        uni.showToast({
          title: error.message || '保存失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    // 验证表单
    validateForm() {
      const { realName, nickname, phone, age } = this.formData;
      
      // 验证姓名
      if (realName && realName.trim().length < 2) {
        uni.showToast({
          title: '姓名至少2个字符',
          icon: 'none'
        });
        return false;
      }
      
      // 验证昵称
      if (nickname && nickname.trim().length < 2) {
        uni.showToast({
          title: '昵称至少2个字符',
          icon: 'none'
        });
        return false;
      }
      
      // 验证手机号
      if (phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
          uni.showToast({
            title: '请输入正确的手机号',
            icon: 'none'
          });
          return false;
        }
      }
      
      // 验证年龄
      if (age) {
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
          uni.showToast({
            title: '请输入正确的年龄',
            icon: 'none'
          });
          return false;
        }
      }
      
      return true;
    },
    
    // 返回上一页
    goBack() {
      // 检查是否有未保存的修改
      const hasChanges = Object.keys(this.formData).some(key => 
        this.formData[key] !== this.originalData[key]
      );
      
      if (hasChanges) {
        uni.showModal({
          title: '提示',
          content: '您有未保存的修改，确定要离开吗？',
          success: (res) => {
            if (res.confirm) {
              uni.navigateBack();
            }
          }
        });
      } else {
        uni.navigateBack();
      }
    }
  }
}
</script>

<style scoped>
.edit-profile-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 页面头部 */
.page-header {
  padding: 60rpx 40rpx 30rpx 20rpx;
  padding-top:60px;
  padding-bottom: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  top: 0;
  z-index: 100;
}

.header-left{
  position: absolute;
  left: 50rpx;
  width: 120rpx;
  display: flex;
  align-items: center;
}

.header-right {
  justify-content: flex-end;
}
.back-icon {
  width: 20px;
  height: 20px;
  margin-top: auto;
  margin-bottom: auto;
}

.save-text {
  font-size: 32rpx;
  font-weight: bold;
}

.header-title {
  font-size: 36rpx;
  text-align: center;
  color:black;
  font-weight: bold;

}

/* 表单容器 */
.form-container {
  padding: 40rpx;
}

.form-section {
  background-color: white;
  border-radius: 16rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

/* 头像编辑 */
.avatar-section {
  display: flex;
  justify-content: space-between;
  position: relative;
  flex: 1;
}

.profile-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  border: 2rpx solid #e0e0e0;
}

.avatar-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24rpx;
  height: 24rpx;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  color: white;
  font-size: 16rpx;
  text-align: center;
  line-height: 1;
  font-weight: 500;
}

/* 表单项 */
.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.item-label {
  width: 160rpx;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  flex-shrink: 0;
}

.item-input {
  flex: 1;
  height: 60rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.item-input:focus {
  border-color: #667eea;
  background-color: white;
}

.item-textarea {
  flex: 1;
  min-height: 120rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: #333;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
  line-height: 1.5;
}

.item-textarea:focus {
  border-color: #667eea;
  background-color: white;
}

/* 性别选择器 */
.gender-selector {
  display: flex;
  gap: 20rpx;
  flex: 1;
}

.gender-option {
  flex: 1;
  height: 60rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}
.arrow-icon{
  width: 15px;
  height: 15px;
  margin-top: auto;
  margin-bottom: auto;
}
.gender-option.active {
  background-color: #667eea;
  border-color: #667eea;
}

.gender-text {
  font-size: 28rpx;
  color: #333;
}

.gender-option.active .gender-text {
  color: white;
}

/* 日期选择器 */
.date-picker {
  flex: 1;
  height: 60rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.date-picker:active {
  border-color: #667eea;
  background-color: white;
}

.date-text {
  font-size: 28rpx;
  color: #333;
}

.date-text.placeholder {
  color: #999;
}

.picker-icon {
  font-size: 24rpx;
  color: #999;
}

/* 底部操作按钮 */
.bottom-actions {
  padding: 40rpx;
  display: flex;
  gap: 20rpx;
  position: sticky;
  bottom: 0;
  background-color: #f5f5f5;
}

.action-button {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.cancel-button {
  background-color: white;
  border: 2rpx solid #e0e0e0;
}

.cancel-button:active {
  background-color: #f0f0f0;
}

.save-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.save-button:active {
  transform: scale(0.98);
}

.button-text {
  font-size: 28rpx;
  font-weight: bold;
}

.cancel-button .button-text {
  color: #666;
}

.save-button .button-text {
  color: white;
}
</style>
