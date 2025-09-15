/*
 * @Author: 徐佳德 1404577549@qq.com
 * @Date: 2025-01-27
 * @LastEditors: 徐佳德 1404577549@qq.com
 * @LastEditTime: 2025-09-15 22:15:56
 * @FilePath: \demo1\api\ai.js
 * @Description: AI聊天相关接口统一管理
 */

/**
 * AI聊天相关接口统一管理
 * @Author: 徐佳德 1404577549@qq.com
 * @Date: 2025-01-27
 * @Description: AI聊天相关API接口（使用uni.request）
 */

// 基础配置
// 开发环境配置
const isDev = process.env.NODE_ENV === 'development';
const DEV_BASE_URL = 'http://localhost:8080';
const PROD_BASE_URL = 'https://your-api-domain.com'; // 请替换为您的生产环境API地址

// 根据环境选择API地址
const BASE_URL = isDev ? DEV_BASE_URL : PROD_BASE_URL;
const FULL_BASE_URL = BASE_URL;
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
        console.error('AI API请求错误:', error);
        
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
      const params = new URLSearchParams(options.params).toString();
      requestOptions.url += (url.includes('?') ? '&' : '?') + params;
    } else if (options.data && (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE')) {
      // POST/PUT/DELETE请求的数据放在data中
      requestOptions.data = options.data;
    }
    
    // 发起请求
    uni.request(requestOptions);
  });
};

// AI聊天API对象
const aiApi = {
  /**
   * 发送消息给AI并获取回复
   * @param {string} message - 用户发送的消息
   * @returns {Promise} 返回AI的回复
   */
  sendMessage(message) {
    // 验证输入参数
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return Promise.reject(new Error('消息内容不能为空'));
    }
    
    // 构建请求参数
    const params = 
      message.trim();
    
    
    return request({
      url: '/chatai?msg=' + params,
      method: 'GET',
    }).then(response => {
      // 处理AI响应数据
      let aiResponse = '';
      
      if (typeof response === 'string') {
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
        timestamp: new Date().getTime()
      };
    }).catch(error => {
      console.error('AI聊天请求失败:', error);
      
      // 返回统一的错误格式
      return {
        success: false,
        message: error.message || '网络连接出现问题，请检查网络后重试。',
        timestamp: new Date().getTime(),
        error: error
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
      url: '/ai/chat/history',
      method: 'GET',
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
        startDate: params.startDate || '',
        endDate: params.endDate || ''
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
    // 验证输入参数
    if (!chatData || !chatData.userMessage || !chatData.aiResponse) {
      return Promise.reject(new Error('聊天数据不完整'));
    }
    
    return request({
      url: '/ai/chat/save',
      method: 'POST',
      data: {
        userMessage: chatData.userMessage,
        aiResponse: chatData.aiResponse,
        sessionId: chatData.sessionId || '',
        timestamp: new Date().getTime()
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
      return Promise.reject(new Error('记录ID不能为空'));
    }
    
    return request({
      url: `/ai/chat/delete/${recordId}`,
      method: 'DELETE'
    });
  },

  /**
   * 清空聊天历史
   * @param {string} sessionId - 会话ID（可选）
   * @returns {Promise} 返回清空结果
   */
  clearChatHistory(sessionId = '') {
    return request({
      url: '/ai/chat/clear',
      method: 'POST',
      data: {
        sessionId: sessionId
      }
    });
  },

  /**
   * 获取AI状态信息
   * @returns {Promise} 返回AI状态
   */
  getAiStatus() {
    return request({
      url: '/ai/status',
      method: 'GET'
    });
  },

  /**
   * 检查AI服务是否可用
   * @returns {Promise} 返回服务状态
   */
  checkAiService() {
    return request({
      url: '/ai/health',
      method: 'GET'
    }).then(response => {
      return {
        success: true,
        status: 'online',
        message: 'AI服务正常'
      };
    }).catch(error => {
      return {
        success: false,
        status: 'offline',
        message: 'AI服务不可用',
        error: error
      };
    });
  },

  /**
   * 获取AI配置信息
   * @returns {Promise} 返回AI配置
   */
  getAiConfig() {
    return request({
      url: '/ai/config',
      method: 'GET'
    });
  },

  /**
   * 更新AI配置
   * @param {Object} config - 配置数据
   * @returns {Promise} 返回更新结果
   */
  updateAiConfig(config) {
    if (!config || typeof config !== 'object') {
      return Promise.reject(new Error('配置数据格式不正确'));
    }
    
    return request({
      url: '/ai/config',
      method: 'PUT',
      data: config
    });
  }
};

// 导出默认接口对象
export default aiApi;
