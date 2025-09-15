"use strict";
const common_vendor = require("../../common/vendor.js");
const api_user = require("../../api/user.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  components: {},
  data() {
    return {
      userInfo: {
        nickname: "张三",
        account: "zhangsan123",
        avatar: "/static/avator.png"
      },
      loading: false,
      userInfoCompleteness: 0,
      // 用户信息完整度
      missingFields: [],
      // 缺失的字段
      isLogin: false
      // 登录状态
    };
  },
  computed: {},
  methods: {
    // 检查登录状态并加载数据
    checkLoginAndLoadData() {
      const app = getApp();
      this.isLogin = app.globalData.isLogin;
      if (app.globalData.isLogin) {
        this.getUserInfo();
      } else {
        this.userInfo = {
          nickname: "点击登录",
          account: "未登录",
          avatar: "/static/default-avatar.png",
          level: 0,
          points: 0,
          balance: 0
        };
      }
    },
    // 检查登录状态
    checkLoginStatus() {
      const app = getApp();
      this.isLogin = app.globalData.isLogin;
      if (app.globalData.isLogin && app.globalData.userInfo) {
        this.userInfo = { ...this.userInfo, ...app.globalData.userInfo };
        this.checkUserInfoCompleteness();
      }
    },
    // 跳转到登录页面
    goToLogin() {
      const currentPage = getCurrentPages()[getCurrentPages().length - 1];
      const redirectUrl = currentPage.route;
      common_vendor.index.navigateTo({
        url: `/pages/login/EmailLogin?redirect=/${redirectUrl}`,
        fail: (error) => {
          console.error("跳转登录页面失败:", error);
        }
      });
    },
    // 用户登出
    async logout() {
      common_vendor.index.showModal({
        title: "确认登出",
        content: "确定要退出登录吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({
                title: "退出中..."
              });
              common_vendor.index.removeStorageSync("token");
              common_vendor.index.removeStorageSync("userInfo");
              common_vendor.index.removeStorageSync("isLogin");
              const app = getApp();
              if (app && app.globalData) {
                app.globalData.isLogin = false;
                app.globalData.userInfo = null;
                app.globalData.token = null;
              }
              this.isLogin = false;
              this.userInfo = {
                nickname: "点击登录",
                account: "未登录",
                avatar: "/static/default-avatar.png",
                level: 0,
                points: 0,
                balance: 0
              };
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({
                title: "已退出登录",
                icon: "success"
              });
              setTimeout(() => {
                this.goToLogin();
              }, 1500);
            } catch (error) {
              console.error("退出登录失败:", error);
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({
                title: "退出登录成功",
                icon: "success"
              });
              setTimeout(() => {
                this.goToLogin();
              }, 1500);
            }
          }
        }
      });
    },
    // 获取用户信息
    async getUserInfo() {
      try {
        this.loading = true;
        const result = await api_user.userApi.getUserInfo();
        if (result.code === 200) {
          this.userInfo = { ...this.userInfo, ...result.data };
          this.checkUserInfoCompleteness();
          this.validateUserInfo();
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
        common_vendor.index.showToast({
          title: "获取用户信息失败",
          icon: "none"
        });
      } finally {
        this.loading = false;
      }
    },
    // 检查用户信息完整性
    checkUserInfoCompleteness() {
      const completeness = api_user.userApi.checkUserInfoCompleteness(this.userInfo);
      this.userInfoCompleteness = completeness.completeness;
      this.missingFields = completeness.missingFields;
      if (!completeness.isComplete) {
        console.log("用户信息不完整，缺失字段:", completeness.missingFields);
        console.log("完整度:", completeness.completeness + "%");
      }
    },
    // 验证用户信息
    validateUserInfo() {
      const validation = api_user.userApi.validateUserInfo(this.userInfo);
      if (!validation.isValid) {
        console.warn("用户信息验证失败:", validation.errors);
        common_vendor.index.showToast({
          title: "用户信息格式有误",
          icon: "none"
        });
      }
    },
    // 更换头像方法
    async changeAvatar() {
      if (!this.isLogin) {
        this.goToLogin();
        return;
      }
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];
          try {
            common_vendor.index.showLoading({
              title: "上传中..."
            });
            const result = await api_user.userApi.uploadAvatar(tempFilePath);
            if (result.code === 200) {
              this.userInfo.avatar = result.data.avatarUrl;
              common_vendor.index.showToast({
                title: "头像更换成功",
                icon: "success"
              });
            } else {
              throw new Error(result.message || "上传失败");
            }
          } catch (error) {
            console.error("上传头像失败:", error);
            common_vendor.index.showToast({
              title: "上传头像失败",
              icon: "none"
            });
          } finally {
            common_vendor.index.hideLoading();
          }
        },
        fail: (err) => {
          console.log("选择图片失败", err);
          common_vendor.index.showToast({
            title: "选择图片失败",
            icon: "none"
          });
        }
      });
    },
    // 页面跳转方法
    async goToPage(page) {
      if (!this.isLogin) {
        this.goToLogin();
        return;
      }
      switch (page) {
        case "favorites":
          try {
            const result = await api_user.userApi.getFavorites();
            if (result.code === 200) {
              common_vendor.index.showToast({
                title: `收藏数量: ${result.data.total}`,
                icon: "none"
              });
            }
          } catch (error) {
            console.error("获取收藏失败:", error);
            common_vendor.index.showToast({
              title: "获取收藏失败",
              icon: "none"
            });
          }
          break;
        case "history":
          try {
            const result = await api_user.userApi.getHistory();
            if (result.code === 200) {
              common_vendor.index.showToast({
                title: `历史记录: ${result.data.total}条`,
                icon: "none"
              });
            }
          } catch (error) {
            console.error("获取历史失败:", error);
            common_vendor.index.showToast({
              title: "获取历史失败",
              icon: "none"
            });
          }
          break;
        case "settings":
          try {
            const result = await api_user.userApi.getUserSettings();
            if (result.code === 200) {
              common_vendor.index.showToast({
                title: "设置获取成功",
                icon: "success"
              });
            }
          } catch (error) {
            console.error("获取设置失败:", error);
            common_vendor.index.showToast({
              title: "获取设置失败",
              icon: "none"
            });
          }
          break;
        case "page":
          common_vendor.index.showToast({
            title: "跳转到Page",
            icon: "none"
          });
          break;
      }
    }
  },
  watch: {},
  onLoad() {
    this.checkLoginAndLoadData();
  },
  onReady() {
  },
  onShow() {
    this.checkLoginStatus();
  },
  onHide() {
  },
  onUnload() {
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.isLogin
  }, $data.isLogin ? {
    b: common_assets._imports_0,
    c: common_vendor.o((...args) => $options.logout && $options.logout(...args))
  } : {}, {
    d: $data.userInfo.avatar,
    e: common_vendor.o((...args) => $options.changeAvatar && $options.changeAvatar(...args)),
    f: common_vendor.t($data.userInfo.nickname),
    g: common_vendor.t($data.userInfo.account),
    h: $data.userInfoCompleteness < 100 && $data.isLogin
  }, $data.userInfoCompleteness < 100 && $data.isLogin ? {
    i: common_vendor.t($data.userInfoCompleteness),
    j: $data.userInfoCompleteness + "%"
  } : {}, {
    k: $data.isLogin
  }, $data.isLogin ? {
    l: common_vendor.o(($event) => $options.goToPage("favorites")),
    m: common_vendor.o(($event) => $options.goToPage("history")),
    n: common_vendor.o(($event) => $options.goToPage("settings")),
    o: common_vendor.o(($event) => $options.goToPage("page"))
  } : {}, {
    p: !$data.isLogin
  }, !$data.isLogin ? {
    q: common_vendor.o((...args) => $options.goToLogin && $options.goToLogin(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-cdbfb462"]]);
wx.createPage(MiniProgramPage);
