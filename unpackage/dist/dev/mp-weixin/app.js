"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const api_user = require("./api/user.js");
const common_assets = require("./common/assets.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/index/Page1.js";
  "./pages/index/Page2.js";
  "./pages/index/User.js";
  "./pages/login/EmailLogin.js";
  "./pages/ai-chat/ai-chat.js";
}
const _sfc_main$1 = {
  name: "AiAssistant",
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
    };
  },
  mounted() {
    this.initPosition();
    this.showClickHint();
  },
  beforeUnmount() {
    if (this.hintTimer) {
      clearTimeout(this.hintTimer);
    }
  },
  methods: {
    initPosition() {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      const screenWidth = systemInfo.windowWidth;
      const screenHeight = systemInfo.windowHeight;
      const savedPosition = common_vendor.index.getStorageSync("aiAssistantPosition");
      if (savedPosition) {
        this.position = savedPosition;
      } else {
        this.position = {
          x: screenWidth - 80,
          y: screenHeight / 2 - 40
        };
      }
      this.constrainPosition();
    },
    constrainPosition() {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      const screenWidth = systemInfo.windowWidth;
      const screenHeight = systemInfo.windowHeight;
      this.position.x = Math.max(0, Math.min(this.position.x, screenWidth - 80));
      this.position.y = Math.max(0, Math.min(this.position.y, screenHeight - 80));
    },
    handleTouchStart(e) {
      this.isDragging = true;
      this.startPosition = { ...this.position };
      this.startTouch = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
      this.showHint = false;
      if (this.hintTimer) {
        clearTimeout(this.hintTimer);
      }
    },
    handleTouchMove(e) {
      if (!this.isDragging)
        return;
      const deltaX = e.touches[0].clientX - this.startTouch.x;
      const deltaY = e.touches[0].clientY - this.startTouch.y;
      this.position.x = this.startPosition.x + deltaX;
      this.position.y = this.startPosition.y + deltaY;
      this.constrainPosition();
    },
    handleTouchEnd() {
      if (this.isDragging) {
        this.isDragging = false;
        common_vendor.index.setStorageSync("aiAssistantPosition", this.position);
      }
    },
    handleClick() {
      if (this.isDragging)
        return;
      common_vendor.index.navigateTo({
        url: "/pages/ai-chat/ai-chat"
      });
    },
    showClickHint() {
      this.hintTimer = setTimeout(() => {
        this.showHint = true;
        setTimeout(() => {
          this.showHint = false;
        }, 3e3);
      }, 2e3);
    }
  }
};
function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0,
    b: !$data.isDragging ? 1 : "",
    c: $data.showHint ? 1 : "",
    d: $data.position.x + "px",
    e: $data.position.y + "px",
    f: common_vendor.o((...args) => $options.handleTouchStart && $options.handleTouchStart(...args)),
    g: common_vendor.o((...args) => $options.handleTouchMove && $options.handleTouchMove(...args)),
    h: common_vendor.o((...args) => $options.handleTouchEnd && $options.handleTouchEnd(...args)),
    i: common_vendor.o((...args) => $options.handleClick && $options.handleClick(...args))
  };
}
const _easycom_AiAssistant = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main$1, [["render", _sfc_render$1], ["__scopeId", "data-v-30ad0b5f"]]);
const _sfc_main = {
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
if (!Array) {
  const _easycom_AiAssistant2 = common_vendor.resolveComponent("AiAssistant");
  _easycom_AiAssistant2();
}
if (!Math) {
  _easycom_AiAssistant();
}
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
