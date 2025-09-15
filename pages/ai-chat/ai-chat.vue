<template>
	<view class="ai-chat-container">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<view class="navbar-content">
				<view class="navbar-left" @click="goBack">
					<image class="back-icon" src="/static/icon/返回.png" mode="aspectFit"></image>
				</view>
				<view class="navbar-center">
					<text class="navbar-title">AI智能助手</text>
				</view>
				<view class="navbar-right">
					<view class="ai-status" :class="aiStatus">
						<text class="status-text">{{ statusText }}</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 聊天内容区域 -->
		<scroll-view class="chat-content" scroll-y="true" :scroll-top="scrollTop" scroll-with-animation="true">
			<view class="message-list">
				<view class="message-item" v-for="(message, index) in messageList" :key="index" :class="message.type">
					<view class="message-avatar">
						<image v-if="message.type === 'user'" class="avatar-img" :src="userAvatar" mode="aspectFill"></image>
						<image v-else class="avatar-img ai-avatar" src="/static/ai-assistant/ai-robot.png" mode="aspectFill"></image>
					</view>
					<view class="message-content">
						<view class="message-bubble" :class="message.type">
							<text class="message-text">{{ message.content }}</text>
						</view>
						<text class="message-time">{{ message.time }}</text>
					</view>
				</view>
				
				<!-- AI正在输入提示 -->
				<view class="message-item ai" v-if="isAiTyping">
					<view class="message-avatar">
						<image class="avatar-img ai-avatar" src="/static/小程序 AI 助手制作.png" mode="aspectFill"></image>
					</view>
					<view class="message-content">
						<view class="message-bubble ai typing">
							<view class="typing-indicator">
								<view class="typing-dot"></view>
								<view class="typing-dot"></view>
								<view class="typing-dot"></view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
		
		<!-- 未登录提示弹窗 -->
		<view class="login-modal" v-if="showLoginModal" @click="hideLoginModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">需要登录</text>
					<view class="close-btn" @click="hideLoginModal">
						<text class="close-icon">×</text>
					</view>
				</view>
				<view class="modal-body">
					<text class="modal-text">使用AI智能助手功能需要先登录账号</text>
					<text class="modal-subtitle">登录后即可享受完整的AI对话体验</text>
				</view>
				<view class="modal-footer">
					<button class="cancel-btn" @click="hideLoginModal">稍后再说</button>
					<button class="login-btn" @click="goToLogin">立即登录</button>
				</view>
			</view>
		</view>
		
		<!-- 输入区域 -->
		<view class="input-area">
			<view class="input-container">
				<input 
					class="message-input" 
					v-model="inputMessage" 
					placeholder="请输入您的问题..." 
					:disabled="isAiTyping"
					@confirm="sendMessage"
					confirm-type="send"
				/>
				<button 
					class="send-btn" 
					:class="{ disabled: !inputMessage.trim() || isAiTyping }"
					@click="sendMessage"
					:disabled="!inputMessage.trim() || isAiTyping"
				>
					<text class="send-text">发送</text>
				</button>
			</view>
		</view>
	</view>
</template>

<script>
import aiApi from '@/api/ai.js'

export default {
	data() {
		return {
			inputMessage: '',
			messageList: [
				{
					type: 'ai',
					content: '您好！我是AI智能助手，很高兴为您服务！有什么可以帮助您的吗？',
					time: this.getCurrentTime()
				}
			],
			scrollTop: 0,
			isAiTyping: false,
			aiStatus: 'online',
			userAvatar: '/static/avator.png',
			showLoginModal: false,
			isLoggedIn: false
		}
	},
	
	computed: {
		statusText() {
			switch(this.aiStatus) {
				case 'online': return '在线';
				case 'typing': return '输入中';
				case 'offline': return '离线';
				default: return '在线';
			}
		}
	},
	
	onLoad() {
		// 检查登录状态
		this.checkLoginStatus()
	},
	
	onShow() {
		// 每次显示页面时重新检查登录状态
		this.checkLoginStatus()
	},
	
	methods: {
		// 返回上一页
		goBack() {
			uni.navigateBack({
				delta: 1
			});
		},
		
		// 发送消息
		sendMessage() {
			if (!this.inputMessage.trim() || this.isAiTyping) return;
			
			// 检查登录状态
			if (!this.isLoggedIn) {
				this.showLoginModal = true;
				return;
			}
			
			const userMessage = {
				type: 'user',
				content: this.inputMessage.trim(),
				time: this.getCurrentTime()
			};
			
			this.messageList.push(userMessage);
			this.inputMessage = '';
			this.scrollToBottom();
			
			// 调用AI API
			this.callAiApi(userMessage.content);
		},
		
		// 调用AI API
		async callAiApi(userInput) {
			this.isAiTyping = true;
			this.aiStatus = 'typing';
			
			try {
				// 使用封装的AI API
				const result = await aiApi.sendMessage(userInput);
				
				if (result.success) {
					// 添加AI回复到消息列表
					const aiMessage = {
						type: 'ai',
						content: result.message,
						time: this.getCurrentTime()
					};
					
					this.messageList.push(aiMessage);
					this.aiStatus = 'online';
				} else {
					// API返回失败
					const aiMessage = {
						type: 'ai',
						content: result.message || '抱歉，服务暂时不可用，请稍后再试。',
						time: this.getCurrentTime()
					};
					
					this.messageList.push(aiMessage);
					this.aiStatus = 'offline';
				}
			} catch (error) {
				console.error('AI API请求失败:', error);
				
				// 请求异常时的处理
				const aiMessage = {
					type: 'ai',
					content: '抱歉，网络连接出现问题，请检查网络后重试。',
					time: this.getCurrentTime()
				};
				
				this.messageList.push(aiMessage);
				this.aiStatus = 'offline';
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
			const now = new Date();
			const hours = now.getHours().toString().padStart(2, '0');
			const minutes = now.getMinutes().toString().padStart(2, '0');
			return `${hours}:${minutes}`;
		},
		
		// 检查登录状态
		checkLoginStatus() {
			const app = getApp();
			this.isLoggedIn = app.globalData.isLogin;
			
			// 如果未登录，更新AI的欢迎消息
			if (!this.isLoggedIn && this.messageList.length === 1) {
				this.messageList[0] = {
					type: 'ai',
					content: '您好！我是AI智能助手，很高兴为您服务！请先登录账号以使用完整功能。',
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
			const currentPage = '/pages/ai-chat/ai-chat';
			uni.navigateTo({
				url: `/pages/login/EmailLogin?redirect=${encodeURIComponent(currentPage)}`,
				fail: (error) => {
					console.error('跳转登录页面失败:', error);
					uni.showToast({
						title: '跳转失败',
						icon: 'none'
					});
				}
			});
		}
	}
}
</script>

<style>
.ai-chat-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #f5f5f5;
}

/* 自定义导航栏 */
.custom-navbar {
	background-color: #ffffff;
	border-bottom: 1rpx solid #e5e5e5;
	padding-top: var(--status-bar-height);
}

.navbar-content {
	display: flex;
	align-items: center;
	height: 88rpx;
	padding: 0 30rpx;
}

.navbar-left {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-icon {
	width: 40rpx;
	height: 40rpx;
}

.navbar-center {
	flex: 1;
	text-align: center;
}

.navbar-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

.navbar-right {
	width: 60rpx;
	display: flex;
	justify-content: center;
}

.ai-status {
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
	font-size: 24rpx;
}

.ai-status.online {
	background-color: #e8f5e8;
	color: #52c41a;
}

.ai-status.typing {
	background-color: #fff7e6;
	color: #fa8c16;
}

.ai-status.offline {
	background-color: #f5f5f5;
	color: #999;
}

/* 聊天内容区域 */
.chat-content {
	flex: 1;
	padding-top: 20rpx;
	padding-bottom: 20rpx;
	padding-left: 0rpx;
	padding-right: 0rpx;
}

.message-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.message-item {
	display: flex;
	gap: 20rpx;
}

.message-item.user {
	flex-direction: row-reverse;
}

.message-avatar {
	width: 80rpx;
	height: 80rpx;
	margin: 15rpx;
	flex-shrink: 0;
}

.avatar-img {
	width: 100%;
	height: 100%;
	border-radius: 50%;
}

.ai-avatar {
	border: 2rpx solid #e5e5e5;
}

.message-content {
	flex: 1;
	max-width: 70%;
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}

.message-item.user .message-content {
	align-items: flex-end;
}

.message-bubble {
	padding: 20rpx 24rpx;
	border-radius: 20rpx;
	position: relative;
	word-wrap: break-word;
}

.message-bubble.user {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	border-bottom-right-radius: 8rpx;
}

.message-bubble.ai {
	background-color: #ffffff;
	color: #333;
	border: 1rpx solid #e5e5e5;
	border-bottom-left-radius: 8rpx;
}

.message-bubble.ai.typing {
	padding: 24rpx;
}

.message-text {
	font-size: 28rpx;
	line-height: 1.5;
}

.message-time {
	font-size: 24rpx;
	color: #999;
	padding: 0 10rpx;
}

/* 输入中动画 */
.typing-indicator {
	display: flex;
	gap: 8rpx;
	align-items: center;
}

.typing-dot {
	width: 12rpx;
	height: 12rpx;
	background-color: #999;
	border-radius: 50%;
	animation: typing 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) {
	animation-delay: -0.32s;
}

.typing-dot:nth-child(2) {
	animation-delay: -0.16s;
}

@keyframes typing {
	0%, 80%, 100% {
		transform: scale(0.8);
		opacity: 0.5;
	}
	40% {
		transform: scale(1);
		opacity: 1;
	}
}

/* 输入区域 */
.input-area {
	background-color: #ffffff;
	border-top: 1rpx solid #e5e5e5;
	padding: 20rpx;
}

.input-container {
	display: flex;
	align-items: center;
	gap: 20rpx;
	background-color: #f8f8f8;
	border-radius: 50rpx;
	padding: 10rpx 20rpx;
}

.message-input {
	flex: 1;
	font-size: 28rpx;
	color: #333;
	background-color: transparent;
	border: none;
	outline: none;
}

.message-input::placeholder {
	color: #999;
}

.send-btn {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	font-size: 28rpx;
	font-weight: bold;
	padding: 16rpx 32rpx;
	border-radius: 50rpx;
	border: none;
	transition: all 0.3s;
}

.send-btn.disabled {
	background: #cccccc;
	color: #999;
}

.send-btn:not(.disabled):active {
	transform: scale(0.95);
}

/* 登录弹窗样式 */
.login-modal {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10000;
}

.modal-content {
	background-color: #ffffff;
	border-radius: 20rpx;
	width: 600rpx;
	max-width: 90%;
	overflow: hidden;
	animation: modalShow 0.3s ease-out;
}

@keyframes modalShow {
	from {
		opacity: 0;
		transform: scale(0.8);
	}
	to {
		opacity: 1;
		transform: scale(1);
	}
}

.modal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 40rpx 40rpx 20rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

.close-btn {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background-color: #f5f5f5;
}

.close-icon {
	font-size: 40rpx;
	color: #999;
	line-height: 1;
}

.modal-body {
	padding: 40rpx;
	height: 80%;
	text-align: center;
}

.login-icon {
	width: 120rpx;
	height: 120rpx;
	margin-bottom: 30rpx;
}

.modal-text {
	display: block;
	font-size: 32rpx;
	color: #333;
	margin-bottom: 20rpx;
	line-height: 1.5;
}

.modal-subtitle {
	display: block;
	font-size: 28rpx;
	color: #666;
	line-height: 1.4;
}

.modal-footer {
	display: flex;
	gap: 20rpx;
	padding: 20rpx 40rpx 40rpx;
}

.cancel-btn {
	flex: 1;
	background-color: #f5f5f5;
	color: #666;
	font-size: 28rpx;
	padding: 24rpx;
	border-radius: 12rpx;
	border: none;
}

.login-btn {
	flex: 1;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	font-size: 28rpx;
	font-weight: bold;
	padding: 24rpx;
	border-radius: 12rpx;
	border: none;
}

.cancel-btn:active {
	background-color: #e8e8e8;
}

.login-btn:active {
	transform: scale(0.98);
}
</style>
