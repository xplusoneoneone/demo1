"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
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
      const windowInfo = common_vendor.index.getWindowInfo();
      const screenWidth = windowInfo.windowWidth;
      const screenHeight = windowInfo.windowHeight;
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
      const query = common_vendor.index.createSelectorQuery().in(this);
      query.select(".ai-assistant").boundingClientRect((rect) => {
        if (rect) {
          const windowInfo = common_vendor.index.getWindowInfo();
          const screenWidth = windowInfo.windowWidth;
          const screenHeight = windowInfo.windowHeight;
          this.position.x = Math.max(0, Math.min(this.position.x, screenWidth - rect.width));
          this.position.y = Math.max(0, Math.min(this.position.y, screenHeight - rect.height));
        }
      }).exec();
    },
    handleTouchStart(e) {
      e.stopPropagation();
      e.preventDefault();
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
      e.stopPropagation();
      e.preventDefault();
      const deltaX = e.touches[0].clientX - this.startTouch.x;
      const deltaY = e.touches[0].clientY - this.startTouch.y;
      this.position.x = this.startPosition.x + deltaX;
      this.position.y = this.startPosition.y + deltaY;
      this.constrainPosition();
    },
    handleTouchEnd(e) {
      if (this.isDragging) {
        e.stopPropagation();
        e.preventDefault();
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
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0$2,
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
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-30ad0b5f"]]);
wx.createComponent(Component);
