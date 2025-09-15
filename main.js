/*
 * @Author: 徐佳德 1404577549@qq.com
 * @Date: 2025-07-06 11:29:10
 * @LastEditors: 徐佳德 1404577549@qq.com
 * @LastEditTime: 2025-09-14 21:04:44
 * @FilePath: \demo1\main.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
import AiAssistant from '@/components/AiAssistant/AiAssistant.vue'
Vue.component('AiAssistant', AiAssistant)
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif