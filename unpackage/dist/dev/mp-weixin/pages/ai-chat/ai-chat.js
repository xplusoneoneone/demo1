"use strict";
const common_vendor = require("../../common/vendor.js");
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
      userAvatar: "/static/avator.png"
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
      const userMessage = {
        type: "user",
        content: this.inputMessage.trim(),
        time: this.getCurrentTime()
      };
      this.messageList.push(userMessage);
      this.inputMessage = "";
      this.scrollToBottom();
      this.simulateAiResponse(userMessage.content);
    },
    // 模拟AI回复
    simulateAiResponse(userInput) {
      this.isAiTyping = true;
      this.aiStatus = "typing";
      setTimeout(() => {
        const aiResponse = this.generateAiResponse(userInput);
        const aiMessage = {
          type: "ai",
          content: aiResponse,
          time: this.getCurrentTime()
        };
        this.messageList.push(aiMessage);
        this.isAiTyping = false;
        this.aiStatus = "online";
        this.scrollToBottom();
      }, 1500 + Math.random() * 1e3);
    },
    // 生成AI回复
    generateAiResponse(input) {
      const responses = [
        "这是一个很有趣的问题！让我来为您详细解答。",
        "我理解您的需求，根据我的分析，建议您可以考虑以下几个方面...",
        "感谢您的提问！这个问题涉及到多个方面，我来为您逐一分析。",
        "您提到的这个观点很有见地，我完全同意您的看法。",
        "这是一个很好的问题！让我从专业角度为您分析一下。",
        "根据您提供的信息，我认为最佳的解决方案是...",
        "您的问题很有代表性，很多用户都遇到过类似情况。",
        "让我为您提供一个详细的解决方案，希望对您有帮助。"
      ];
      if (input.includes("你好") || input.includes("您好")) {
        return "您好！很高兴与您交流，有什么可以帮助您的吗？";
      } else if (input.includes("帮助") || input.includes("问题")) {
        return "我很乐意为您提供帮助！请详细描述您遇到的问题，我会尽力为您解答。";
      } else if (input.includes("功能") || input.includes("使用")) {
        return "我可以帮助您解答各种问题，包括技术咨询、生活建议、学习指导等。您有什么具体需求吗？";
      } else if (input.includes("谢谢") || input.includes("感谢")) {
        return "不客气！能帮助到您我很开心。如果还有其他问题，随时可以问我哦！";
      } else {
        return responses[Math.floor(Math.random() * responses.length)];
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
        c: common_assets._imports_2
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
    g: common_assets._imports_2
  } : {}, {
    h: $data.scrollTop,
    i: $data.isAiTyping,
    j: common_vendor.o((...args) => $options.sendMessage && $options.sendMessage(...args)),
    k: $data.inputMessage,
    l: common_vendor.o(($event) => $data.inputMessage = $event.detail.value),
    m: !$data.inputMessage.trim() || $data.isAiTyping ? 1 : "",
    n: common_vendor.o((...args) => $options.sendMessage && $options.sendMessage(...args)),
    o: !$data.inputMessage.trim() || $data.isAiTyping
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
