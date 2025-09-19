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
      const paramPairs = Object.keys(options.params).map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(options.params[key])}`
      );
      const params = paramPairs.join("&");
      requestOptions.url += (url.includes("?") ? "&" : "?") + params;
    } else if (options.data && (options.method === "POST" || options.method === "PUT" || options.method === "DELETE")) {
      requestOptions.data = options.data;
    }
    common_vendor.index.request(requestOptions);
  });
};
const DEFAULT_USER_INFO = {
  nickname: "淬月",
  username: "",
  avatar: "/static/avator.png",
  sex: "unknown",
  birthday: "",
  phone: "",
  email: "",
  signature: "",
  realName: "",
  age: "",
  name: "",
  idCartNumber: "",
  idCartType: "",
  userType: "",
  createTime: null,
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
    console.log(validatedData);
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
    }).then(async (result) => {
      if (result.code === 200 && result.data) {
        result.data = validateAndSetDefaults(result.data);
        try {
          const [signatureResult, avatarResult] = await Promise.all([
            this.getSignature(),
            this.getAvatar()
          ]);
          if (signatureResult.code === 200 && signatureResult.data) {
            result.data.signature = signatureResult.data;
          }
          if (avatarResult.code === 200 && avatarResult.data) {
            result.data.avatar = avatarResult.data;
          }
        } catch (error) {
          console.log("获取用户签名或头像失败:", error);
        }
      }
      return result;
    });
  },
  /**
   * 更新用户信息
   * @param {Object} userData - 用户信息数据
   * @param {string} userData.username - 用户名
   * @param {string} userData.nickname - 昵称
   * @param {string} userData.sex - 性别
   * @param {string} userData.birthday - 生日
   * @param {string} userData.phone - 手机号
   * @param {string} userData.email - 邮箱
   * @param {string} userData.signature - 个人签名
   * @param {string} userData.avatar - 头像
   * @returns {Promise}
   */
  updateUserInfo(userData) {
    return new Promise(async (resolve, reject) => {
      try {
        const promises = [];
        if (userData.signature !== void 0 && userData.signature !== null && userData.signature !== "") {
          promises.push(this.updateSignature(userData.signature));
        }
        if (userData.avatar !== void 0 && userData.avatar !== null && userData.avatar !== "") {
          promises.push(this.updateAvatar(userData.avatar));
        }
        const otherFields = ["username", "nickname", "sex", "birthday", "phone", "email", "realName", "age", "name", "idCartNumber", "idCartType", "userType"];
        const otherData = {};
        otherFields.forEach((field) => {
          if (userData[field] !== void 0 && userData[field] !== null && userData[field] !== "") {
            otherData[field] = userData[field];
          }
        });
        if (Object.keys(otherData).length > 0) {
          promises.push(request({
            url: "/user/user/modifyUserInfo",
            method: "POST",
            data: otherData
          }));
        }
        if (promises.length === 0) {
          return reject(new Error("没有有效的用户信息需要更新"));
        }
        const results = await Promise.all(promises);
        const allSuccess = results.every((result) => result && result.code === 200);
        if (allSuccess) {
          resolve({
            code: 200,
            message: "更新成功",
            data: results
          });
        } else {
          const failedResult = results.find((result) => !result || result.code !== 200);
          resolve({
            code: failedResult ? failedResult.code : 500,
            message: failedResult ? failedResult.message : "部分更新失败",
            data: results
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  },
  /**
   * 更新用户签名
   * @param {string} signature - 新的签名
   * @returns {Promise}
   */
  updateSignature(signature) {
    return request({
      url: `/user/user/modifySignature?signature=${encodeURIComponent(signature)}`,
      method: "POST"
    });
  },
  /**
   * 更新用户头像
   * @param {string} avatar - 新的头像URL
   * @returns {Promise}
   */
  updateAvatar(avatar) {
    return request({
      url: "/user/user/modifyAvatar",
      method: "POST",
      data: { avatar }
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
        headers.Token = `${token}`;
      }
      common_vendor.index.uploadFile({
        url: FULL_BASE_URL + "/user/user/uploadAvatar",
        filePath,
        name: "file",
        header: headers,
        success: (response) => {
          try {
            if (response.statusCode !== 200) {
              reject(new Error(`上传失败: HTTP ${response.statusCode}`));
              return;
            }
            const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
            if (data.code === 200) {
              resolve(data);
            } else {
              reject(new Error(data.message || "上传失败"));
            }
          } catch (error) {
            console.error("JSON解析错误:", error);
            console.error("原始响应数据:", response.data);
            reject(new Error("服务器响应格式错误，请稍后重试"));
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
   * 获取用户头像
   * @returns {Promise}
   */
  getAvatar() {
    return request({
      url: "/user/user/getAvatar",
      method: "GET"
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
   * 获取用户签名
   * @returns {Promise}
   */
  getSignature() {
    return request({
      url: "/user/user/getSignature",
      method: "GET"
    });
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
