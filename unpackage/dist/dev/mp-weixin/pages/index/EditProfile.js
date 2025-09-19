"use strict";
const common_vendor = require("../../common/vendor.js");
const api_user = require("../../api/user.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      formData: {
        avatar: "/static/avator.png",
        realName: "",
        nickname: "",
        sex: "",
        age: "",
        phone: "",
        birthday: "",
        signature: "",
        email: "",
        username: "",
        name: "",
        idCartNumber: "",
        idCartType: "",
        userType: "",
        createTime: null
      },
      originalData: {},
      // 保存原始数据
      currentDate: "",
      // 当前日期
      loading: false
    };
  },
  onLoad() {
    this.initData();
  },
  methods: {
    // 初始化数据
    initData() {
      const now = /* @__PURE__ */ new Date();
      this.currentDate = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
      this.getUserInfo();
    },
    // 获取用户信息
    async getUserInfo() {
      try {
        const result = await api_user.userApi.getUserInfo();
        if (result.code === 200) {
          this.formData = {
            avatar: result.data.avatar || "/static/avator.png",
            realName: result.data.realName || "",
            nickname: result.data.nickname || "",
            sex: result.data.sex || "",
            age: result.data.age || "",
            phone: result.data.phone || "",
            birthday: result.data.birthday || "",
            signature: result.data.signature || "",
            email: result.data.email || "",
            username: result.data.username || "",
            name: result.data.name || "",
            idCartNumber: result.data.idCartNumber || "",
            idCartType: result.data.idCartType || "",
            userType: result.data.userType || "",
            createTime: result.data.createTime || null
          };
          this.originalData = { ...this.formData };
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
        common_vendor.index.showToast({
          title: "获取用户信息失败",
          icon: "none"
        });
      }
    },
    // 选择性别
    selectGender(gender) {
      this.formData.sex = gender === "male" ? "男" : "女";
    },
    // 生日选择
    onBirthdayChange(e) {
      this.formData.birthday = e.detail.value;
    },
    // 更换头像
    async changeAvatar() {
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
              this.formData.avatar = result.data.avatarUrl;
              common_vendor.index.showToast({
                title: "头像上传成功",
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
    // 保存个人信息
    async saveProfile() {
      if (!this.validateForm()) {
        return;
      }
      try {
        this.loading = true;
        common_vendor.index.showLoading({
          title: "保存中..."
        });
        const saveData = {};
        const changedFields = [];
        Object.keys(this.formData).forEach((key) => {
          if (this.formData[key] !== this.originalData[key]) {
            saveData[key] = this.formData[key];
            changedFields.push(key);
          }
        });
        if (changedFields.length === 0) {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "没有修改内容",
            icon: "none"
          });
          return;
        }
        const result = await api_user.userApi.updateUserInfo(saveData);
        if (result.code === 200) {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "保存成功",
            icon: "success"
          });
          const app = getApp();
          if (app && app.globalData && app.refreshUserInfo) {
            try {
              await app.refreshUserInfo();
            } catch (error) {
              console.warn("刷新全局用户信息失败，使用本地更新:", error);
              app.globalData.userInfo = { ...app.globalData.userInfo, ...saveData };
              common_vendor.index.setStorageSync("userInfo", app.globalData.userInfo);
            }
          }
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          throw new Error(result.message || "保存失败");
        }
      } catch (error) {
        console.error("保存个人信息失败:", error);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: error.message || "保存失败",
          icon: "none"
        });
      } finally {
        this.loading = false;
      }
    },
    // 验证表单
    validateForm() {
      const { realName, nickname, phone, age } = this.formData;
      if (realName && realName.trim().length < 2) {
        common_vendor.index.showToast({
          title: "姓名至少2个字符",
          icon: "none"
        });
        return false;
      }
      if (nickname && nickname.trim().length < 2) {
        common_vendor.index.showToast({
          title: "昵称至少2个字符",
          icon: "none"
        });
        return false;
      }
      if (phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
          common_vendor.index.showToast({
            title: "请输入正确的手机号",
            icon: "none"
          });
          return false;
        }
      }
      if (age) {
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
          common_vendor.index.showToast({
            title: "请输入正确的年龄",
            icon: "none"
          });
          return false;
        }
      }
      return true;
    },
    // 返回上一页
    goBack() {
      const hasChanges = Object.keys(this.formData).some(
        (key) => this.formData[key] !== this.originalData[key]
      );
      if (hasChanges) {
        common_vendor.index.showModal({
          title: "提示",
          content: "您有未保存的修改，确定要离开吗？",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateBack();
            }
          }
        });
      } else {
        common_vendor.index.navigateBack();
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0$1,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: $data.formData.avatar,
    d: common_assets._imports_2,
    e: common_vendor.o((...args) => $options.changeAvatar && $options.changeAvatar(...args)),
    f: $data.formData.nickname,
    g: common_vendor.o(($event) => $data.formData.nickname = $event.detail.value),
    h: $data.formData.sex === "男" ? 1 : "",
    i: common_vendor.o(($event) => $options.selectGender("male")),
    j: $data.formData.sex === "女" ? 1 : "",
    k: common_vendor.o(($event) => $options.selectGender("female")),
    l: $data.formData.phone,
    m: common_vendor.o(($event) => $data.formData.phone = $event.detail.value),
    n: common_vendor.t($data.formData.birthday || "请选择生日"),
    o: !$data.formData.birthday ? 1 : "",
    p: common_assets._imports_2,
    q: $data.formData.birthday,
    r: common_vendor.o((...args) => $options.onBirthdayChange && $options.onBirthdayChange(...args)),
    s: $data.currentDate,
    t: $data.formData.signature,
    v: common_vendor.o(($event) => $data.formData.signature = $event.detail.value),
    w: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    x: common_vendor.o((...args) => $options.saveProfile && $options.saveProfile(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-769b8cad"]]);
wx.createPage(MiniProgramPage);
