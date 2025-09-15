"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      title: "Hello world",
      isLogin: false,
      // 登录状态
      // 轮播图数据
      bannerList: [
        {
          image: "/static/banner1.jpg",
          title: "轮播图1"
        },
        {
          image: "/static/banner2.jpg",
          title: "轮播图2"
        },
        {
          image: "/static/banner3.jpg",
          title: "轮播图3"
        }
      ],
      // 活动推文数据
      activityList: [
        {
          id: 1,
          title: "春季新品发布会",
          description: "全新产品系列震撼发布，限时优惠等你来抢！现场还有神秘嘉宾助阵，精彩不容错过！",
          cover: "/static/activity1.jpg",
          date: "2024-03-15",
          status: "active",
          statusText: "进行中"
        },
        {
          id: 2,
          title: "用户福利活动",
          description: "注册即送好礼，邀请好友还有额外奖励！更多惊喜等你来发现，赶快行动起来吧！",
          cover: "/static/activity2.jpg",
          date: "2024-03-20",
          status: "upcoming",
          statusText: "即将开始"
        },
        {
          id: 3,
          title: "技术分享会",
          description: "行业大咖分享最新技术趋势，不容错过！深度解析前沿技术，助你把握未来机遇。",
          cover: "/static/activity3.jpg",
          date: "2024-03-25",
          status: "ended",
          statusText: "已结束"
        },
        {
          id: 4,
          title: "夏日狂欢节",
          description: "炎炎夏日，清凉一夏！多重优惠活动同时开启，购物满减、积分翻倍、限时秒杀应有尽有！",
          cover: "/static/activity4.jpg",
          date: "2024-06-01",
          status: "upcoming",
          statusText: "即将开始"
        },
        {
          id: 5,
          title: "会员专享日",
          description: "VIP会员独享特权日，全场商品8折优惠，还有专属客服一对一服务，尊享体验从这里开始！",
          cover: "/static/activity5.jpg",
          date: "2024-04-15",
          status: "active",
          statusText: "进行中"
        },
        {
          id: 6,
          title: "品牌周年庆典",
          description: "感谢一路相伴！品牌成立五周年庆典活动正式启动，历史最低价、限量纪念品等你来拿！",
          cover: "/static/activity6.jpg",
          date: "2024-05-20",
          status: "upcoming",
          statusText: "即将开始"
        },
        {
          id: 7,
          title: "公益慈善活动",
          description: "爱心传递，温暖人间。参与公益慈善活动，每笔消费都将捐出部分金额用于慈善事业，让爱心延续！",
          cover: "/static/activity7.jpg",
          date: "2024-04-01",
          status: "active",
          statusText: "进行中"
        },
        {
          id: 8,
          title: "科技创新峰会",
          description: "汇聚全球顶尖科技人才，探讨人工智能、区块链、物联网等前沿技术发展，引领未来科技潮流！",
          cover: "/static/activity8.jpg",
          date: "2024-03-10",
          status: "ended",
          statusText: "已结束"
        }
      ]
    };
  },
  onLoad() {
    this.checkLoginStatus();
  },
  onShow() {
    this.checkLoginStatus();
  },
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      const app = getApp();
      this.isLogin = app.globalData.isLogin;
    },
    // 跳转到登录页面
    goToLogin() {
      common_vendor.index.navigateTo({
        url: "/pages/login/EmailLogin",
        fail: (error) => {
          console.error("跳转登录页面失败:", error);
        }
      });
    },
    // 跳转到活动详情
    goToActivity(item) {
      common_vendor.index.showToast({
        title: `点击了：${item.title}`,
        icon: "none"
      });
    }
  }
};
if (!Array) {
  const _easycom_AiAssistant2 = common_vendor.resolveComponent("AiAssistant");
  _easycom_AiAssistant2();
}
const _easycom_AiAssistant = () => "../../components/AiAssistant/AiAssistant.js";
if (!Math) {
  _easycom_AiAssistant();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.bannerList, (item, index, i0) => {
      return {
        a: item.image,
        b: index
      };
    }),
    b: !$data.isLogin
  }, !$data.isLogin ? {
    c: common_vendor.o((...args) => $options.goToLogin && $options.goToLogin(...args))
  } : {}, {
    d: common_vendor.f($data.activityList, (item, index, i0) => {
      return {
        a: common_vendor.t(item.title),
        b: common_vendor.t(item.description),
        c: common_vendor.t(item.date),
        d: common_vendor.t(item.statusText),
        e: common_vendor.n(item.status),
        f: item.cover,
        g: index,
        h: common_vendor.o(($event) => $options.goToActivity(item), index)
      };
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
