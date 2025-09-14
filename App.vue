<script>
import { userApi } from '@/api/user.js'

export default {
	globalData: {
		// 全局用户信息
		userInfo: null,
		// 登录状态
		isLogin: false,
		// 登录token
		token: null
	},
	
	onLaunch: function() {
		console.log('App Launch')
		// 初始化用户登录状态
		this.initUserLoginStatus()
	},
	
	onShow: function() {
		console.log('App Show')
		// 检查登录状态
		this.checkLoginStatus()
	},
	
	onHide: function() {
		console.log('App Hide')
	},
	
	methods: {
		/**
		 * 初始化用户登录状态
		 */
		initUserLoginStatus() {
			try {
				// 从本地存储获取用户信息
				const userInfo = userApi.getLocalUserInfo()
				const token = uni.getStorageSync('token')
				const isLogin = uni.getStorageSync('isLogin')
				
				if (userInfo && token && isLogin) {
					// 设置全局数据
					this.globalData.userInfo = userInfo
					this.globalData.token = token
					this.globalData.isLogin = true
					
					console.log('用户已登录:', userInfo)
				} else {
					// 清除可能存在的过期数据
					this.clearLoginData()
				}
			} catch (error) {
				console.error('初始化用户登录状态失败:', error)
				this.clearLoginData()
			}
		},
		
		/**
		 * 检查登录状态
		 */
		checkLoginStatus() {
			const isLogin = userApi.checkLoginStatus()
			
			if (!isLogin && this.globalData.isLogin) {
				// 登录状态已失效，清除全局数据
				this.clearLoginData()
				console.log('用户登录状态已失效')
			}
		},
		
		/**
		 * 清除登录数据
		 */
		clearLoginData() {
			this.globalData.userInfo = null
			this.globalData.token = null
			this.globalData.isLogin = false
		},
		
		/**
		 * 设置用户登录信息
		 * @param {string} token - 登录token
		 * @param {Object} userInfo - 用户信息
		 */
		setUserLoginInfo(token, userInfo) {
			this.globalData.token = token
			this.globalData.userInfo = userInfo
			this.globalData.isLogin = true
		},
		
		/**
		 * 用户登出
		 */
		userLogout() {
			this.clearLoginData()
			userApi.logout()
			console.log('用户已登出')
		},
		
		/**
		 * 检查是否需要登录
		 * @param {string} pagePath - 页面路径
		 * @returns {boolean} 是否需要登录
		 */
		needLogin(pagePath) {
			// 定义不需要登录的页面路径
			const publicPages = [
				'/pages/index/index',
				'/pages/login/EmailLogin'
			]
			
			return !publicPages.includes(pagePath)
		},
		
		/**
		 * 跳转到登录页面
		 * @param {string} redirectUrl - 登录后跳转的页面
		 */
		goToLogin(redirectUrl = '') {
			let url = '/pages/login/EmailLogin'
			if (redirectUrl) {
				url += `?redirect=${encodeURIComponent(redirectUrl)}`
			}
			
			uni.navigateTo({
				url: url,
				fail: (error) => {
					console.error('跳转登录页面失败:', error)
				}
			})
		}
	}
}
</script>

<template>
	<view id="app">
	
		<AiAssistant />
		
		</view>
</template>

<style>
	#app {
		position: relative;
	}
</style>
