"use strict";
const common_vendor = require("../../common/vendor.js");
const api_user = require("../../api/user.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  name: "EmailLogin",
  data() {
    return {
      email: "",
      code: "",
      emailError: "",
      codeError: "",
      loading: false,
      countdown: 0,
      timer: null,
      agreeToTerms: false
      // 是否同意用户协议和隐私政策
    };
  },
  computed: {
    // 邮箱格式验证
    isValidEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(this.email);
    },
    // 是否可以发送验证码
    canSendCode() {
      return this.isValidEmail && this.countdown === 0;
    }
  },
  onLoad() {
    this.initPage();
  },
  onUnload() {
    this.clearTimer();
  },
  methods: {
    // 返回上一页
    goBack() {
      common_vendor.index.navigateBack({
        delta: 1
      });
    },
    // 切换协议勾选状态
    toggleAgreement() {
      this.agreeToTerms = !this.agreeToTerms;
    },
    // 初始化页面
    initPage() {
      if (api_user.userApi.checkLoginStatus()) {
        common_vendor.index.showToast({
          title: "您已登录",
          icon: "none"
        });
        this.goBack();
        return;
      }
    },
    // 邮箱输入处理
    onEmailInput(e) {
      this.email = e.detail.value.trim();
      this.emailError = "";
    },
    // 验证码输入处理
    onCodeInput(e) {
      this.code = e.detail.value.trim();
      this.codeError = "";
    },
    // 验证邮箱格式
    validateEmail() {
      if (this.email && !this.isValidEmail) {
        this.emailError = "请输入正确的邮箱格式";
      } else {
        this.emailError = "";
      }
    },
    // 发送验证码
    async sendCode() {
      if (!this.canSendCode) {
        if (!this.isValidEmail) {
          this.emailError = "请输入正确的邮箱格式";
        }
        return;
      }
      try {
        common_vendor.index.showLoading({
          title: "发送中..."
        });
        const result = await api_user.userApi.sendEmailCode(this.email);
        common_vendor.index.hideLoading();
        if (result.code === 200) {
          common_vendor.index.showToast({
            title: "验证码已发送",
            icon: "success"
          });
          this.startCountdown();
        } else {
          common_vendor.index.showToast({
            title: result.message || "发送失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: error.message || "发送失败，请重试",
          icon: "none"
        });
        console.error("发送验证码失败:", error);
      }
    },
    // 开始倒计时
    startCountdown() {
      this.countdown = 30;
      this.timer = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          this.clearTimer();
        }
      }, 1e3);
    },
    // 清除定时器
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
        this.countdown = 0;
      }
    },
    // 处理登录
    async handleLogin() {
      if (this.loading) {
        return;
      }
      if (!this.email.trim()) {
        common_vendor.index.showToast({
          title: "请输入邮箱地址",
          icon: "none"
        });
        return;
      }
      if (!this.isValidEmail) {
        common_vendor.index.showToast({
          title: "请输入正确的邮箱格式",
          icon: "none"
        });
        return;
      }
      if (!this.code.trim()) {
        common_vendor.index.showToast({
          title: "请输入验证码",
          icon: "none"
        });
        return;
      }
      if (!this.agreeToTerms) {
        common_vendor.index.showToast({
          title: "请先同意用户协议和隐私政策",
          icon: "none"
        });
        return;
      }
      this.loading = true;
      try {
        const result = await api_user.userApi.loginByEmailCode(this.email, this.code);
        if (result.code === 200 && result.data) {
          const { token } = result.data;
          common_vendor.index.setStorageSync("token", token);
          try {
            const userInfoResult = await api_user.userApi.getUserInfo();
            if (userInfoResult.code === 200 && userInfoResult.data) {
              const userInfo = userInfoResult.data;
              api_user.userApi.saveLoginInfo(token, userInfo);
              getApp().setUserLoginInfo(token, userInfo);
              console.log("登录成功，用户信息:", userInfo);
            } else {
              throw new Error(userInfoResult.message || "获取用户信息失败");
            }
          } catch (userInfoError) {
            console.error("获取用户信息失败:", userInfoError);
            api_user.userApi.saveLoginInfo(token, null);
            getApp().setUserLoginInfo(token, null);
            common_vendor.index.showToast({
              title: "登录成功，但获取用户信息失败",
              icon: "none"
            });
          }
          common_vendor.index.showToast({
            title: "登录成功",
            icon: "success"
          });
          setTimeout(() => {
            this.handleLoginSuccess();
          }, 1e3);
        } else {
          common_vendor.index.showToast({
            title: result.message || "登录失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: error.message || "登录失败，请重试",
          icon: "none"
        });
        console.error("登录失败:", error);
      } finally {
        this.loading = false;
      }
    },
    // 跳转到微信登录
    goToWxLogin() {
      common_vendor.index.showToast({
        title: "微信登录功能开发中",
        icon: "none"
      });
    },
    // 显示隐私政策
    showPrivacy() {
      common_vendor.index.showModal({
        title: "隐私政策",
        content: "这里是隐私政策内容...",
        showCancel: false
      });
    },
    // 显示用户协议
    showTerms() {
      common_vendor.index.showModal({
        title: "用户协议",
        content: "这里是用户协议内容...",
        showCancel: false
      });
    },
    // 处理登录成功后的跳转
    handleLoginSuccess() {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const options = currentPage.options || {};
      const redirectUrl = options.redirect;
      if (redirectUrl) {
        try {
          const decodedUrl = decodeURIComponent(redirectUrl);
          if (decodedUrl.startsWith("/")) {
            common_vendor.index.redirectTo({
              url: decodedUrl,
              fail: () => {
                this.goBack();
              }
            });
          } else {
            this.goBack();
          }
        } catch (error) {
          console.error("重定向URL解析失败:", error);
          this.goBack();
        }
      } else {
        this.goBack();
      }
    },
    // 返回上一页
    goBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        common_vendor.index.navigateBack();
      } else {
        common_vendor.index.reLaunch({
          url: "/pages/index/index"
        });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$2,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_vendor.o([($event) => $data.email = $event.detail.value, (...args) => $options.onEmailInput && $options.onEmailInput(...args)]),
    d: common_vendor.o((...args) => $options.validateEmail && $options.validateEmail(...args)),
    e: $data.email,
    f: $data.emailError
  }, $data.emailError ? {
    g: common_vendor.t($data.emailError)
  } : {}, {
    h: common_vendor.o([($event) => $data.code = $event.detail.value, (...args) => $options.onCodeInput && $options.onCodeInput(...args)]),
    i: $data.code,
    j: common_vendor.t($data.countdown > 0 ? `${$data.countdown}s` : "发送验证码"),
    k: !$options.canSendCode || $data.countdown > 0 ? 1 : "",
    l: common_vendor.o((...args) => $options.sendCode && $options.sendCode(...args)),
    m: $data.codeError
  }, $data.codeError ? {
    n: common_vendor.t($data.codeError)
  } : {}, {
    o: common_vendor.t($data.loading ? "登录中..." : "登录"),
    p: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args)),
    q: $data.loading,
    r: common_vendor.o((...args) => $options.goToWxLogin && $options.goToWxLogin(...args)),
    s: $data.agreeToTerms
  }, $data.agreeToTerms ? {} : {}, {
    t: $data.agreeToTerms ? 1 : "",
    v: common_vendor.o((...args) => $options.showTerms && $options.showTerms(...args)),
    w: common_vendor.o((...args) => $options.showPrivacy && $options.showPrivacy(...args)),
    x: common_vendor.o((...args) => $options.toggleAgreement && $options.toggleAgreement(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1e4e9c0a"]]);
wx.createPage(MiniProgramPage);
