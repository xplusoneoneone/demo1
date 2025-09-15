"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const api_user = require("./api/user.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/index/Page1.js";
  "./pages/index/Page2.js";
  "./pages/index/User.js";
  "./pages/login/EmailLogin.js";
  "./pages/ai-chat/ai-chat.js";
}
const _sfc_main = {
  name: "app",
  globalData: {
    // 全局用户信息
    userInfo: null,
    // 登录状态
    isLogin: false,
    // 登录token
    token: null
  },
  onLaunch: function() {
    console.log("App Launch");
    this.initUserLoginStatus();
  },
  onShow: function() {
    console.log("App Show");
    this.checkLoginStatus();
  },
  onHide: function() {
    console.log("App Hide");
  },
  methods: {
    /**
     * 初始化用户登录状态
     */
    initUserLoginStatus() {
      try {
        const userInfo = api_user.userApi.getLocalUserInfo();
        const token = common_vendor.index.getStorageSync("token");
        const isLogin = common_vendor.index.getStorageSync("isLogin");
        if (userInfo && token && isLogin) {
          this.globalData.userInfo = userInfo;
          this.globalData.token = token;
          this.globalData.isLogin = true;
          console.log("用户已登录:", userInfo);
        } else {
          this.clearLoginData();
        }
      } catch (error) {
        console.error("初始化用户登录状态失败:", error);
        this.clearLoginData();
      }
    },
    /**
     * 检查登录状态
     */
    checkLoginStatus() {
      const isLogin = api_user.userApi.checkLoginStatus();
      if (!isLogin && this.globalData.isLogin) {
        this.clearLoginData();
        console.log("用户登录状态已失效");
      }
    },
    /**
     * 清除登录数据
     */
    clearLoginData() {
      this.globalData.userInfo = null;
      this.globalData.token = null;
      this.globalData.isLogin = false;
    },
    /**
     * 设置用户登录信息
     * @param {string} token - 登录token
     * @param {Object} userInfo - 用户信息
     */
    setUserLoginInfo(token, userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      this.globalData.isLogin = true;
    },
    /**
     * 用户登出
     */
    userLogout() {
      this.clearLoginData();
      api_user.userApi.logout();
      console.log("用户已登出");
    },
    /**
     * 检查是否需要登录
     * @param {string} pagePath - 页面路径
     * @returns {boolean} 是否需要登录
     */
    needLogin(pagePath) {
      const publicPages = [
        "/pages/index/index",
        "/pages/login/EmailLogin"
      ];
      return !publicPages.includes(pagePath);
    },
    /**
     * 跳转到登录页面
     * @param {string} redirectUrl - 登录后跳转的页面
     */
    goToLogin(redirectUrl = "") {
      let url = "/pages/login/EmailLogin";
      if (redirectUrl) {
        url += `?redirect=${encodeURIComponent(redirectUrl)}`;
      }
      common_vendor.index.navigateTo({
        url,
        fail: (error) => {
          console.error("跳转登录页面失败:", error);
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {};
}
const App = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
function createApp() {
  const app = common_vendor.createSSRApp(App);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
