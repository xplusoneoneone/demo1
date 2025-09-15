/*
 * @Author: 徐佳德 1404577549@qq.com
 * @Date: 2025-08-23 15:50:32
 * @LastEditors: 徐佳德 1404577549@qq.com
 * @LastEditTime: 2025-09-13 19:37:31
 * @FilePath: \demo1\api\user.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * 用户信息相关接口统一管理
 * @Author: 徐佳德 1404577549@qq.com
 * @Date: 2025-01-27
 * @Description: 用户信息相关API接口（使用uni.request）
 */

// 基础配置
// 开发环境配置
const isDev = process.env.NODE_ENV === 'development';
const DEV_BASE_URL = 'http://localhost:8080';
const PROD_BASE_URL = 'https://your-api-domain.com'; // 请替换为您的生产环境API地址

// 根据环境选择API地址
const BASE_URL = isDev ? DEV_BASE_URL : PROD_BASE_URL;
const FULL_BASE_URL = BASE_URL ;
const TIMEOUT = 10000; // 10秒超时

// 请求封装函数
const request = (options) => {
  return new Promise((resolve, reject) => {
    // 获取存储的token
    const token = uni.getStorageSync('token') || '';
    
    // 构建请求头
    const headers = {
      'Content-Type': 'application/json',
      'Token': token,
      ...options.header
    };
    
    // 添加认证token
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    console.log(headers);
    
    // 构建完整URL
    const url = options.url.startsWith('http') ? options.url : FULL_BASE_URL + options.url;
    
    // 构建请求参数
    const requestOptions = {
      url: url,
      method: options.method || 'GET',
      timeout: TIMEOUT,
      header: headers,
      success: (response) => {
        // 统一处理响应数据
        if (response.statusCode === 200) {
          resolve(response.data);
        } else {
          reject(new Error(`请求失败: ${response.statusCode} - ${response.data?.message || '未知错误'}`));
        }
      },
      fail: (error) => {
        // 统一处理错误
        console.error('API请求错误:', error);
        
        // 特殊处理域名白名单错误
        if (error.errMsg && error.errMsg.includes('url not in domain list')) {
          const errorMsg = {
            ...error,
            message: '域名未在小程序后台配置白名单，请检查 manifest.json 配置或使用真机调试'
          };
          reject(errorMsg);
        } else {
          reject(error);
        }
      }
    };
    
    // 根据请求方法设置数据
    if (options.method === 'GET' && options.params) {
      // GET请求的参数需要拼接到URL上
      const paramPairs = Object.keys(options.params).map(key => 
        `${encodeURIComponent(key)}=${encodeURIComponent(options.params[key])}`
      );
      const params = paramPairs.join('&');
      requestOptions.url += (url.includes('?') ? '&' : '?') + params;
    } else if (options.data && (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE')) {
      // POST/PUT/DELETE请求的数据放在data中
      requestOptions.data = options.data;
    }
    
    // 发起请求
    uni.request(requestOptions);
  });
};

// 用户信息默认值配置
const DEFAULT_USER_INFO = {
  nickname: '未设置昵称',
  account: '',
  avatar: '/static/avator.png',
  gender: 'unknown',
  birthday: '',
  phone: '',
  email: '',
  bio: '这个人很懒，什么都没写~',
  level: 1,
  points: 0,
  vipLevel: 0,
  isVip: false,
  registerTime: '',
  lastLoginTime: '',
  status: 'active'
};

// 验证和设置默认值的工具函数
const validateAndSetDefaults = (userData) => {
  const validatedData = { ...DEFAULT_USER_INFO };
  
  if (userData && typeof userData === 'object') {
    // 遍历用户数据，设置默认值
    Object.keys(DEFAULT_USER_INFO).forEach(key => {
      if (userData[key] !== undefined && userData[key] !== null && userData[key] !== '') {
        validatedData[key] = userData[key];
      }
    });
  }
  
  return validatedData;
};

// 验证用户信息的工具函数
const validateUserInfo = (userData) => {
  const errors = [];
  
  // 验证昵称
  if (userData.nickname && userData.nickname.length > 20) {
    errors.push('昵称长度不能超过20个字符');
  }
  
  // 验证手机号
  if (userData.phone && !/^1[3-9]\d{9}$/.test(userData.phone)) {
    errors.push('手机号格式不正确');
  }
  
  // 验证邮箱
  if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.push('邮箱格式不正确');
  }
  
  // 验证个人简介
  if (userData.bio && userData.bio.length > 200) {
    errors.push('个人简介长度不能超过200个字符');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 检查用户信息是否完整的工具函数
const checkUserInfoCompleteness = (userData) => {
  const requiredFields = ['nickname', 'phone', 'email'];
  const missingFields = [];
  
  requiredFields.forEach(field => {
    if (!userData[field] || userData[field] === '') {
      missingFields.push(field);
    }
  });
  
  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completeness: Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100)
  };
};

// 用户信息相关接口
export const userApi = {
  getUserInfo(userId = '') {
    const url = "/user/user/getUserInfo";
    return request({
      url,
      method: 'GET'
    }).then(result => {
      // 对返回的用户信息进行验证和默认值设置
      if (result.code === 200 && result.data) {
        result.data = validateAndSetDefaults(result.data);
      }
      return result;
    });
  },

  /**
   * 更新用户信息
   * @param {Object} userData - 用户信息数据
   * @param {string} userData.nickname - 昵称
   * @param {string} userData.gender - 性别
   * @param {string} userData.birthday - 生日
   * @param {string} userData.phone - 手机号
   * @param {string} userData.email - 邮箱
   * @param {string} userData.bio - 个人简介
   * @returns {Promise}
   */
  updateUserInfo(userData) {
    // 验证和过滤用户数据
    const validatedData = {};
    const allowedFields = ['nickname', 'gender', 'birthday', 'phone', 'email', 'bio'];
    
    allowedFields.forEach(field => {
      if (userData[field] !== undefined && userData[field] !== null && userData[field] !== '') {
        validatedData[field] = userData[field];
      }
    });
    
    // 如果没有有效数据，返回错误
    if (Object.keys(validatedData).length === 0) {
      return Promise.reject(new Error('没有有效的用户信息需要更新'));
    }
    
    return request({
      url: '/user/update',
      method: 'PUT',
      data: validatedData
    });
  },

  /**
   * 上传用户头像
   * @param {string} filePath - 图片文件路径
   * @returns {Promise}
   */
  uploadAvatar(filePath) {
    return new Promise((resolve, reject) => {
      // 获取token
      const token = uni.getStorageSync('token') || '';
      
      // 构建请求头
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      // 使用uni.uploadFile上传文件
      uni.uploadFile({
        url: FULL_BASE_URL + '/user/avatar',
        filePath: filePath,
        name: 'avatar',
        header: headers,
        success: (response) => {
          try {
            const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
            if (response.statusCode === 200) {
              resolve(data);
            } else {
              reject(new Error(`上传失败: ${response.statusCode} - ${data?.message || '未知错误'}`));
            }
          } catch (error) {
            reject(new Error('解析响应数据失败'));
          }
        },
        fail: (error) => {
          console.error('头像上传失败:', error);
          reject(error);
        }
      });
    });
  },

  /**
   * 获取用户收藏列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @param {string} params.type - 收藏类型（可选）
   * @returns {Promise}
   */
  getFavorites(params = {}) {
    return request({
      url: '/user/favorites',
      method: 'GET',
      data: params
    });
  },

  /**
   * 添加收藏
   * @param {Object} data - 收藏数据
   * @param {string} data.targetId - 收藏目标ID
   * @param {string} data.targetType - 收藏目标类型
   * @returns {Promise}
   */
  addFavorite(data) {
    return request({
      url: '/user/favorites',
      method: 'POST',
      data
    });
  },

  /**
   * 取消收藏
   * @param {string} favoriteId - 收藏ID
   * @returns {Promise}
   */
  removeFavorite(favoriteId) {
    return request({
      url: `/user/favorites/${favoriteId}`,
      method: 'DELETE'
    });
  },

  /**
   * 获取用户浏览历史
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @param {string} params.type - 浏览类型（可选）
   * @returns {Promise}
   */
  getHistory(params = {}) {
    return request({
      url: '/user/history',
      method: 'GET',
      data: params
    });
  },

  /**
   * 清除浏览历史
   * @param {string} type - 清除类型（可选，不传则清除全部）
   * @returns {Promise}
   */
  clearHistory(type = '') {
    const url = type ? `/user/history/clear?type=${type}` : '/user/history/clear';
    return request({
      url,
      method: 'DELETE'
    });
  },

  /**
   * 获取用户设置
   * @returns {Promise}
   */
  getUserSettings() {
    return request({
      url: '/user/settings',
      method: 'GET'
    });
  },

  /**
   * 更新用户设置
   * @param {Object} settings - 设置数据
   * @param {boolean} settings.notification - 通知开关
   * @param {boolean} settings.privacy - 隐私设置
   * @param {string} settings.language - 语言设置
   * @param {string} settings.theme - 主题设置
   * @returns {Promise}
   */
  updateUserSettings(settings) {
    return request({
      url: '/user/settings',
      method: 'PUT',
      data: settings
    });
  },

  /**
   * 修改密码
   * @param {Object} data - 密码数据
   * @param {string} data.oldPassword - 旧密码
   * @param {string} data.newPassword - 新密码
   * @returns {Promise}
   */
  changePassword(data) {
    return request({
      url: '/user/password',
      method: 'PUT',
      data
    });
  },

  /**
   * 绑定手机号
   * @param {Object} data - 绑定数据
   * @param {string} data.phone - 手机号
   * @param {string} data.code - 验证码
   * @returns {Promise}
   */
  bindPhone(data) {
    return request({
      url: '/user/bind/phone',
      method: 'POST',
      data
    });
  },

  /**
   * 绑定邮箱
   * @param {Object} data - 绑定数据
   * @param {string} data.email - 邮箱
   * @param {string} data.code - 验证码
   * @returns {Promise}
   */
  bindEmail(data) {
    return request({
      url: '/user/bind/email',
      method: 'POST',
      data
    });
  },

  /**
   * 发送验证码
   * @param {Object} data - 验证码数据
   * @param {string} data.target - 目标（手机号或邮箱）
   * @param {string} data.type - 类型（phone/email）
   * @param {string} data.purpose - 用途（bind/forgot/update）
   * @returns {Promise}
   */
  sendVerificationCode(data) {
    return request({
      url: '/user/verification-code',
      method: 'POST',
      data
    });
  },

  /**
   * 获取用户统计数据
   * @returns {Promise}
   */
  getUserStats() {
    return request({
      url: '/user/stats',
      method: 'GET'
    });
  },

  /**
   * 验证用户信息
   * @param {Object} userData - 用户信息数据
   * @returns {Object} 验证结果
   */
  validateUserInfo(userData) {
    return validateUserInfo(userData);
  },

  /**
   * 检查用户信息完整性
   * @param {Object} userData - 用户信息数据
   * @returns {Object} 完整性检查结果
   */
  checkUserInfoCompleteness(userData) {
    return checkUserInfoCompleteness(userData);
  },

  /**
   * 获取用户信息默认值
   * @returns {Object} 默认用户信息
   */
  getDefaultUserInfo() {
    return { ...DEFAULT_USER_INFO };
  },

  /**
   * 初始化用户信息（设置默认值）
   * @param {Object} userData - 原始用户数据
   * @returns {Object} 初始化后的用户信息
   */
  initializeUserInfo(userData) {
    return validateAndSetDefaults(userData);
  },

  /**
   * 发送邮箱验证码
   * @param {string} email - 邮箱地址
   * @returns {Promise}
   */
  sendEmailCode(email) {
    // 验证邮箱格式
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Promise.reject(new Error('请输入正确的邮箱地址'));
    }

    return request({
      url: `/user/email/sendEmail?email=${encodeURIComponent(email)}`,
      method: 'POST'
    });
  },

  /**
   * 邮箱验证码登录
   * @param {string} email - 邮箱地址
   * @param {string} code - 验证码
   * @returns {Promise}
   */
  loginByEmailCode(email, code) {
    // 验证邮箱格式
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Promise.reject(new Error('请输入正确的邮箱地址'));
    }

    // 验证验证码格式
    if (!code || code.length < 4) {
      return Promise.reject(new Error('请输入正确的验证码'));
    }

    return request({
      url: `/user/email/loginByCode?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}&userType=1`,
      method: 'POST'
    });
  },

  /**
   * 用户登出
   * @returns {Promise}
   */
  logout() {
    return new Promise(async (resolve, reject) => {
      try {
        // 先调用后端登出接口
        try {
          await request({
            url: '/user/logout',
            method: 'POST'
          });
        } catch (error) {
          console.warn('后端登出失败，继续执行本地登出:', error);
        }
        
        // 清除本地存储的用户信息
        uni.removeStorageSync('token');
        uni.removeStorageSync('userInfo');
        uni.removeStorageSync('isLogin');
        
        // 清除全局登录状态
        const app = getApp();
        if (app && app.globalData) {
          app.globalData.isLogin = false;
          app.globalData.userInfo = null;
          app.globalData.token = null;
        }
        
        resolve({
          code: 200,
          message: '登出成功'
        });
      } catch (error) {
        console.error('登出过程中发生错误:', error);
        reject(error);
      }
    });
  },

  /**
   * 检查登录状态
   * @returns {boolean}
   */
  checkLoginStatus() {
    const token = uni.getStorageSync('token');
    const isLogin = uni.getStorageSync('isLogin');
    return !!(token && isLogin);
  },

  /**
   * 获取本地存储的用户信息
   * @returns {Object|null}
   */
  getLocalUserInfo() {
    return uni.getStorageSync('userInfo') || null;
  },

  /**
   * 保存用户登录信息到本地存储
   * @param {string} token - 登录token
   * @param {Object} userInfo - 用户信息
   */
  saveLoginInfo(token, userInfo) {
    uni.setStorageSync('token', token);
    uni.setStorageSync('userInfo', userInfo);
    uni.setStorageSync('isLogin', true);
  }
};

// 导出默认接口对象
export default userApi;
