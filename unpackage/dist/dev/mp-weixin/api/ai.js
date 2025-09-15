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
        console.error("AI API请求错误:", error);
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
const aiApi = {
  /**
   * 发送消息给AI并获取回复
   * @param {string} message - 用户发送的消息
   * @returns {Promise} 返回AI的回复
   */
  sendMessage(message) {
    if (!message || typeof message !== "string" || message.trim() === "") {
      return Promise.reject(new Error("消息内容不能为空"));
    }
    const params = message.trim();
    return request({
      url: "/chatai?msg=" + params,
      method: "GET"
    }).then((response) => {
      let aiResponse = "";
      if (typeof response === "string") {
        aiResponse = response;
      } else if (response && response.message) {
        aiResponse = response.message;
      } else if (response && response.response) {
        aiResponse = response.response;
      } else if (response && response.data) {
        aiResponse = response.data;
      } else {
        aiResponse = JSON.stringify(response);
      }
      return {
        success: true,
        message: aiResponse,
        timestamp: (/* @__PURE__ */ new Date()).getTime()
      };
    }).catch((error) => {
      console.error("AI聊天请求失败:", error);
      return {
        success: false,
        message: error.message || "网络连接出现问题，请检查网络后重试。",
        timestamp: (/* @__PURE__ */ new Date()).getTime(),
        error
      };
    });
  },
  /**
   * 获取AI聊天历史记录
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.limit - 每页数量
   * @param {string} params.startDate - 开始日期
   * @param {string} params.endDate - 结束日期
   * @returns {Promise} 返回聊天历史记录
   */
  getChatHistory(params = {}) {
    return request({
      url: "/ai/chat/history",
      method: "GET",
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
        startDate: params.startDate || "",
        endDate: params.endDate || ""
      }
    });
  },
  /**
   * 保存聊天记录
   * @param {Object} chatData - 聊天数据
   * @param {string} chatData.userMessage - 用户消息
   * @param {string} chatData.aiResponse - AI回复
   * @param {string} chatData.sessionId - 会话ID
   * @returns {Promise} 返回保存结果
   */
  saveChatRecord(chatData) {
    if (!chatData || !chatData.userMessage || !chatData.aiResponse) {
      return Promise.reject(new Error("聊天数据不完整"));
    }
    return request({
      url: "/ai/chat/save",
      method: "POST",
      data: {
        userMessage: chatData.userMessage,
        aiResponse: chatData.aiResponse,
        sessionId: chatData.sessionId || "",
        timestamp: (/* @__PURE__ */ new Date()).getTime()
      }
    });
  },
  /**
   * 删除聊天记录
   * @param {string} recordId - 记录ID
   * @returns {Promise} 返回删除结果
   */
  deleteChatRecord(recordId) {
    if (!recordId) {
      return Promise.reject(new Error("记录ID不能为空"));
    }
    return request({
      url: `/ai/chat/delete/${recordId}`,
      method: "DELETE"
    });
  },
  /**
   * 清空聊天历史
   * @param {string} sessionId - 会话ID（可选）
   * @returns {Promise} 返回清空结果
   */
  clearChatHistory(sessionId = "") {
    return request({
      url: "/ai/chat/clear",
      method: "POST",
      data: {
        sessionId
      }
    });
  },
  /**
   * 获取AI状态信息
   * @returns {Promise} 返回AI状态
   */
  getAiStatus() {
    return request({
      url: "/ai/status",
      method: "GET"
    });
  },
  /**
   * 检查AI服务是否可用
   * @returns {Promise} 返回服务状态
   */
  checkAiService() {
    return request({
      url: "/ai/health",
      method: "GET"
    }).then((response) => {
      return {
        success: true,
        status: "online",
        message: "AI服务正常"
      };
    }).catch((error) => {
      return {
        success: false,
        status: "offline",
        message: "AI服务不可用",
        error
      };
    });
  },
  /**
   * 获取AI配置信息
   * @returns {Promise} 返回AI配置
   */
  getAiConfig() {
    return request({
      url: "/ai/config",
      method: "GET"
    });
  },
  /**
   * 更新AI配置
   * @param {Object} config - 配置数据
   * @returns {Promise} 返回更新结果
   */
  updateAiConfig(config) {
    if (!config || typeof config !== "object") {
      return Promise.reject(new Error("配置数据格式不正确"));
    }
    return request({
      url: "/ai/config",
      method: "PUT",
      data: config
    });
  }
};
exports.aiApi = aiApi;
