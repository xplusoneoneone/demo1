"use strict";
const common_vendor = require("../../common/vendor.js");
const api_ai = require("../../api/ai.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      inputMessage: "",
      messageList: [
        {
          type: "ai",
          content: "您好！我是AI智能助手，很高兴为您服务！有什么可以帮助您的吗？",
          time: this.getCurrentTime()
        }
      ],
      scrollTop: 0,
      isAiTyping: false,
      aiStatus: "online",
      userAvatar: "/static/avator.png",
      showLoginModal: false,
      isLoggedIn: false
    };
  },
  computed: {
    statusText() {
      switch (this.aiStatus) {
        case "online":
          return "在线";
        case "typing":
          return "输入中";
        case "offline":
          return "离线";
        default:
          return "在线";
      }
    }
  },
  onLoad() {
    this.checkLoginStatus();
  },
  onShow() {
    this.checkLoginStatus();
  },
  methods: {
    // 返回上一页
    goBack() {
      common_vendor.index.navigateBack({
        delta: 1
      });
    },
    // 发送消息
    sendMessage() {
      if (!this.inputMessage.trim() || this.isAiTyping)
        return;
      if (!this.isLoggedIn) {
        this.showLoginModal = true;
        return;
      }
      const userMessage = {
        type: "user",
        content: this.inputMessage.trim(),
        time: this.getCurrentTime()
      };
      this.messageList.push(userMessage);
      this.inputMessage = "";
      this.scrollToBottom();
      this.callAiApi(userMessage.content);
    },
    // 调用AI API
    async callAiApi(userInput) {
      this.isAiTyping = true;
      this.aiStatus = "typing";
      try {
        const result = await api_ai.aiApi.sendMessage(userInput);
        if (result.success) {
          const aiMessage = {
            type: "ai",
            content: result.message,
            time: this.getCurrentTime()
          };
          this.messageList.push(aiMessage);
          this.aiStatus = "online";
        } else {
          const aiMessage = {
            type: "ai",
            content: result.message || "抱歉，服务暂时不可用，请稍后再试。",
            time: this.getCurrentTime()
          };
          this.messageList.push(aiMessage);
          this.aiStatus = "offline";
        }
      } catch (error) {
        console.error("AI API请求失败:", error);
        const aiMessage = {
          type: "ai",
          content: "抱歉，网络连接出现问题，请检查网络后重试。",
          time: this.getCurrentTime()
        };
        this.messageList.push(aiMessage);
        this.aiStatus = "offline";
      } finally {
        this.isAiTyping = false;
        this.scrollToBottom();
      }
    },
    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollTop = 99999;
      });
    },
    // 获取当前时间
    getCurrentTime() {
      const now = /* @__PURE__ */ new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    },
    // 检查登录状态
    checkLoginStatus() {
      const app = getApp();
      this.isLoggedIn = app.globalData.isLogin;
      if (!this.isLoggedIn && this.messageList.length === 1) {
        this.messageList[0] = {
          type: "ai",
          content: "您好！我是AI智能助手，很高兴为您服务！请先登录账号以使用完整功能。",
          time: this.getCurrentTime()
        };
      }
    },
    // 隐藏登录弹窗
    hideLoginModal() {
      this.showLoginModal = false;
    },
    // 跳转到登录页面
    goToLogin() {
      this.hideLoginModal();
      const currentPage = "/pages/ai-chat/ai-chat";
      common_vendor.index.navigateTo({
        url: `/pages/login/EmailLogin?redirect=${encodeURIComponent(currentPage)}`,
        fail: (error) => {
          console.error("跳转登录页面失败:", error);
          common_vendor.index.showToast({
            title: "跳转失败",
            icon: "none"
          });
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$2,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_vendor.t($options.statusText),
    d: common_vendor.n($data.aiStatus),
    e: common_vendor.f($data.messageList, (message, index, i0) => {
      return common_vendor.e({
        a: message.type === "user"
      }, message.type === "user" ? {
        b: $data.userAvatar
      } : {
        c: common_assets._imports_1$1
      }, {
        d: common_vendor.t(message.content),
        e: common_vendor.n(message.type),
        f: common_vendor.t(message.time),
        g: index,
        h: common_vendor.n(message.type)
      });
    }),
    f: $data.isAiTyping
  }, $data.isAiTyping ? {
    g: common_assets._imports_2$1
  } : {}, {
    h: $data.scrollTop,
    i: $data.showLoginModal
  }, $data.showLoginModal ? {
    j: common_vendor.o((...args) => $options.hideLoginModal && $options.hideLoginModal(...args)),
    k: common_vendor.o((...args) => $options.hideLoginModal && $options.hideLoginModal(...args)),
    l: common_vendor.o((...args) => $options.goToLogin && $options.goToLogin(...args)),
    m: common_vendor.o(() => {
    }),
    n: common_vendor.o((...args) => $options.hideLoginModal && $options.hideLoginModal(...args))
  } : {}, {
    o: $data.isAiTyping,
    p: common_vendor.o((...args) => $options.sendMessage && $options.sendMessage(...args)),
    q: $data.inputMessage,
    r: common_vendor.o(($event) => $data.inputMessage = $event.detail.value),
    s: !$data.inputMessage.trim() || $data.isAiTyping ? 1 : "",
    t: common_vendor.o((...args) => $options.sendMessage && $options.sendMessage(...args)),
    v: !$data.inputMessage.trim() || $data.isAiTyping
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
