"use strict";
const common_vendor = require("../common/vendor.js");
const DEV_BASE_URL = "http://localhost:8080";
const BASE_URL = DEV_BASE_URL;
const FULL_BASE_URL = BASE_URL;
const TIMEOUT = 1e4;
const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = common_vendor.index.getStorageSync("token") || "";
    const headers = {
      "Content-Type": "application/json",
      "Token": token,
      ...options.header
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    console.log(headers);
    const url = options.url.startsWith("http") ? options.url : FULL_BASE_URL + options.url;
    const requestOptions = {
      url,
      method: options.method || "GET",
      timeout: TIMEOUT,
      header: headers,
      success: (response) => {
        var _a;
        if (response.statusCode === 200) {
          resolve(response.data);
        } else {
          reject(new Error(`请求失败: ${response.statusCode} - ${((_a = response.data) == null ? void 0 : _a.message) || "未知错误"}`));
        }
      },
      fail: (error) => {
        console.error("API请求错误:", error);
        if (error.errMsg && error.errMsg.includes("url not in domain list")) {
          const errorMsg = {
            ...error,
            message: "域名未在小程序后台配置白名单，请检查 manifest.json 配置或使用真机调试"
          };
          reject(errorMsg);
        } else {
          reject(error);
        }
      }
    };
    if (options.method === "GET" && options.params) {
      const params = new URLSearchParams(options.params).toString();
      requestOptions.url += (url.includes("?") ? "&" : "?") + params;
    } else if (options.data && (options.method === "POST" || options.method === "PUT" || options.method === "DELETE")) {
      requestOptions.data = options.data;
    }
    common_vendor.index.request(requestOptions);
  });
};
const DEFAULT_USER_INFO = {
  nickname: "未设置昵称",
  account: "",
  avatar: "/static/avator.png",
  gender: "unknown",
  birthday: "",
  phone: "",
  email: "",
  bio: "这个人很懒，什么都没写~",
  level: 1,
  points: 0,
  vipLevel: 0,
  isVip: false,
  registerTime: "",
  lastLoginTime: "",
  status: "active"
};
const validateAndSetDefaults = (userData) => {
  const validatedData = { ...DEFAULT_USER_INFO };
  if (userData && typeof userData === "object") {
    Object.keys(DEFAULT_USER_INFO).forEach((key) => {
      if (userData[key] !== void 0 && userData[key] !== null && userData[key] !== "") {
        validatedData[key] = userData[key];
      }
    });
  }
  return validatedData;
};
const validateUserInfo = (userData) => {
  const errors = [];
  if (userData.nickname && userData.nickname.length > 20) {
    errors.push("昵称长度不能超过20个字符");
  }
  if (userData.phone && !/^1[3-9]\d{9}$/.test(userData.phone)) {
    errors.push("手机号格式不正确");
  }
  if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.push("邮箱格式不正确");
  }
  if (userData.bio && userData.bio.length > 200) {
    errors.push("个人简介长度不能超过200个字符");
  }
  return {
    isValid: errors.length === 0,
    errors
  };
};
const checkUserInfoCompleteness = (userData) => {
  const requiredFields = ["nickname", "phone", "email"];
  const missingFields = [];
  requiredFields.forEach((field) => {
    if (!userData[field] || userData[field] === "") {
      missingFields.push(field);
    }
  });
  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completeness: Math.round((requiredFields.length - missingFields.length) / requiredFields.length * 100)
  };
};
const userApi = {
  getUserInfo(userId = "") {
    const url = "/user/user/getUserInfo";
    return request({
      url,
      method: "GET"
    }).then((result) => {
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
    const validatedData = {};
    const allowedFields = ["nickname", "gender", "birthday", "phone", "email", "bio"];
    allowedFields.forEach((field) => {
      if (userData[field] !== void 0 && userData[field] !== null && userData[field] !== "") {
        validatedData[field] = userData[field];
      }
    });
    if (Object.keys(validatedData).length === 0) {
      return Promise.reject(new Error("没有有效的用户信息需要更新"));
    }
    return request({
      url: "/user/update",
      method: "PUT",
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
      const token = common_vendor.index.getStorageSync("token") || "";
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      common_vendor.index.uploadFile({
        url: FULL_BASE_URL + "/user/avatar",
        filePath,
        name: "avatar",
        header: headers,
        success: (response) => {
          try {
            const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
            if (response.statusCode === 200) {
              resolve(data);
            } else {
              reject(new Error(`上传失败: ${response.statusCode} - ${(data == null ? void 0 : data.message) || "未知错误"}`));
            }
          } catch (error) {
            reject(new Error("解析响应数据失败"));
          }
        },
        fail: (error) => {
          console.error("头像上传失败:", error);
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
      url: "/user/favorites",
      method: "GET",
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
      url: "/user/favorites",
      method: "POST",
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
      method: "DELETE"
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
      url: "/user/history",
      method: "GET",
      data: params
    });
  },
  /**
   * 清除浏览历史
   * @param {string} type - 清除类型（可选，不传则清除全部）
   * @returns {Promise}
   */
  clearHistory(type = "") {
    const url = type ? `/user/history/clear?type=${type}` : "/user/history/clear";
    return request({
      url,
      method: "DELETE"
    });
  },
  /**
   * 获取用户设置
   * @returns {Promise}
   */
  getUserSettings() {
    return request({
      url: "/user/settings",
      method: "GET"
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
      url: "/user/settings",
      method: "PUT",
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
      url: "/user/password",
      method: "PUT",
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
      url: "/user/bind/phone",
      method: "POST",
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
      url: "/user/bind/email",
      method: "POST",
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
      url: "/user/verification-code",
      method: "POST",
      data
    });
  },
  /**
   * 获取用户统计数据
   * @returns {Promise}
   */
  getUserStats() {
    return request({
      url: "/user/stats",
      method: "GET"
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
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Promise.reject(new Error("请输入正确的邮箱地址"));
    }
    return request({
      url: `/user/email/sendEmail?email=${encodeURIComponent(email)}`,
      method: "POST"
    });
  },
  /**
   * 邮箱验证码登录
   * @param {string} email - 邮箱地址
   * @param {string} code - 验证码
   * @returns {Promise}
   */
  loginByEmailCode(email, code) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Promise.reject(new Error("请输入正确的邮箱地址"));
    }
    if (!code || code.length < 4) {
      return Promise.reject(new Error("请输入正确的验证码"));
    }
    return request({
      url: `/user/email/loginByCode?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}&userType=1`,
      method: "POST"
    });
  },
  /**
   * 用户登出
   * @returns {Promise}
   */
  logout() {
    return new Promise(async (resolve, reject) => {
      try {
        try {
          await request({
            url: "/user/logout",
            method: "POST"
          });
        } catch (error) {
          console.warn("后端登出失败，继续执行本地登出:", error);
        }
        common_vendor.index.removeStorageSync("token");
        common_vendor.index.removeStorageSync("userInfo");
        common_vendor.index.removeStorageSync("isLogin");
        const app = getApp();
        if (app && app.globalData) {
          app.globalData.isLogin = false;
          app.globalData.userInfo = null;
          app.globalData.token = null;
        }
        resolve({
          code: 200,
          message: "登出成功"
        });
      } catch (error) {
        console.error("登出过程中发生错误:", error);
        reject(error);
      }
    });
  },
  /**
   * 检查登录状态
   * @returns {boolean}
   */
  checkLoginStatus() {
    const token = common_vendor.index.getStorageSync("token");
    const isLogin = common_vendor.index.getStorageSync("isLogin");
    return !!(token && isLogin);
  },
  /**
   * 获取本地存储的用户信息
   * @returns {Object|null}
   */
  getLocalUserInfo() {
    return common_vendor.index.getStorageSync("userInfo") || null;
  },
  /**
   * 保存用户登录信息到本地存储
   * @param {string} token - 登录token
   * @param {Object} userInfo - 用户信息
   */
  saveLoginInfo(token, userInfo) {
    common_vendor.index.setStorageSync("token", token);
    common_vendor.index.setStorageSync("userInfo", userInfo);
    common_vendor.index.setStorageSync("isLogin", true);
  }
};
exports.userApi = userApi;
