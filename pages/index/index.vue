<template>
	<view class="content">
		<!-- 轮播图部分 -->
		<swiper class="banner-swiper" indicator-dots="true" autoplay="true" interval="3000" duration="1000" circular="true">
			<swiper-item v-for="(item, index) in bannerList" :key="index">
				<image class="banner-image" :src="item.image" mode="aspectFill"></image>
			</swiper-item>
		</swiper>
		
		<!-- 用户登录状态 -->
		<view class="login-section" v-if="!isLogin">
			<view class="login-prompt">
				<view class="prompt-content">
					<text class="prompt-text">登录后享受更多功能</text>
					<button class="login-btn" @click="goToLogin">立即登录</button>
				</view>
			</view>
		</view>
		
		<!-- 活动推文部分 -->
		<view class="activity-section">
			<view class="section-title">
				<text class="title-text">热门活动</text>
			</view>
			<view class="activity-list">
				<view class="activity-item" v-for="(item, index) in activityList" :key="index" @click="goToActivity(item)">
					<view class="activity-info">
						<text class="activity-title">{{item.title}}</text>
						<text class="activity-desc">{{item.description}}</text>
						<view class="activity-meta">
							<text class="activity-date">{{item.date}}</text>
							<text class="activity-status" :class="item.status">{{item.statusText}}</text>
						</view>
					</view>
					<image class="activity-cover" :src="item.cover" mode="aspectFill"></image>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: 'Hello world',
				isLogin: false, // 登录状态
				// 轮播图数据
				bannerList: [
					{
						image: '/static/banner1.jpg',
						title: '轮播图1'
					},
					{
						image: '/static/banner2.jpg',
						title: '轮播图2'
					},
					{
						image: '/static/banner3.jpg',
						title: '轮播图3'
					}
				],
				// 活动推文数据
				activityList: [
					{
						id: 1,
						title: '春季新品发布会',
						description: '全新产品系列震撼发布，限时优惠等你来抢！现场还有神秘嘉宾助阵，精彩不容错过！',
						cover: '/static/activity1.jpg',
						date: '2024-03-15',
						status: 'active',
						statusText: '进行中'
					},
					{
						id: 2,
						title: '用户福利活动',
						description: '注册即送好礼，邀请好友还有额外奖励！更多惊喜等你来发现，赶快行动起来吧！',
						cover: '/static/activity2.jpg',
						date: '2024-03-20',
						status: 'upcoming',
						statusText: '即将开始'
					},
					{
						id: 3,
						title: '技术分享会',
						description: '行业大咖分享最新技术趋势，不容错过！深度解析前沿技术，助你把握未来机遇。',
						cover: '/static/activity3.jpg',
						date: '2024-03-25',
						status: 'ended',
						statusText: '已结束'
					},
					{
						id: 4,
						title: '夏日狂欢节',
						description: '炎炎夏日，清凉一夏！多重优惠活动同时开启，购物满减、积分翻倍、限时秒杀应有尽有！',
						cover: '/static/activity4.jpg',
						date: '2024-06-01',
						status: 'upcoming',
						statusText: '即将开始'
					},
					{
						id: 5,
						title: '会员专享日',
						description: 'VIP会员独享特权日，全场商品8折优惠，还有专属客服一对一服务，尊享体验从这里开始！',
						cover: '/static/activity5.jpg',
						date: '2024-04-15',
						status: 'active',
						statusText: '进行中'
					},
					{
						id: 6,
						title: '品牌周年庆典',
						description: '感谢一路相伴！品牌成立五周年庆典活动正式启动，历史最低价、限量纪念品等你来拿！',
						cover: '/static/activity6.jpg',
						date: '2024-05-20',
						status: 'upcoming',
						statusText: '即将开始'
					},
					{
						id: 7,
						title: '公益慈善活动',
						description: '爱心传递，温暖人间。参与公益慈善活动，每笔消费都将捐出部分金额用于慈善事业，让爱心延续！',
						cover: '/static/activity7.jpg',
						date: '2024-04-01',
						status: 'active',
						statusText: '进行中'
					},
					{
						id: 8,
						title: '科技创新峰会',
						description: '汇聚全球顶尖科技人才，探讨人工智能、区块链、物联网等前沿技术发展，引领未来科技潮流！',
						cover: '/static/activity8.jpg',
						date: '2024-03-10',
						status: 'ended',
						statusText: '已结束'
					}
				]
			}
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
				uni.navigateTo({
					url: '/pages/login/EmailLogin',
					fail: (error) => {
						console.error('跳转登录页面失败:', error);
					}
				});
			},
			
			// 跳转到活动详情
			goToActivity(item) {
				uni.showToast({
					title: `点击了：${item.title}`,
					icon: 'none'
				});
				// 这里可以跳转到活动详情页
				// uni.navigateTo({
				// 	url: `/pages/activity/detail?id=${item.id}`
				// });
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		background-color: #f5f5f5;
		min-height: 100vh;
	}
	
	/* 登录提示区域 */
	.login-section {
		margin: 20rpx;
		width: calc(100% - 40rpx);
	}
	
	.login-prompt {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 20rpx;
		padding: 40rpx;
		box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.3);
	}
	
	.prompt-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.prompt-text {
		color: #ffffff;
		font-size: 32rpx;
		font-weight: 500;
	}
	
	.login-btn {
		background: #ffffff;
		color: #667eea;
		font-size: 28rpx;
		font-weight: bold;
		padding: 16rpx 32rpx;
		margin-right: 0;
		border-radius: 50rpx;
		border: none;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
		transition: all 0.3s;
	}
	
	.login-btn:active {
		transform: translateY(2rpx);
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
	}

	/* 轮播图样式 */
	.banner-swiper {
		width: 100%;
		height: 400rpx;
	}

	.banner-image {
		width: 100%;
		height: 100%;
	}

	/* 活动推文样式 */
	.activity-section {
		width: 100%;
		padding: 20rpx;
		background-color: #fff;
		margin-top: 20rpx;
	}

	.section-title {
		padding: 20rpx 0;
		border-bottom: 1rpx solid #eee;
		margin-bottom: 20rpx;
	}

	.title-text {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		margin-left: 20rpx;
	}

	.activity-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.activity-item {
		display: flex;
		background-color: #fff;
		border-radius: 12rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
		transition: transform 0.2s;
	}

	.activity-item:active {
		transform: scale(0.98);
	}

	.activity-info {
		flex: 1;
		padding: 20rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		text-align: left;
	}

	.activity-cover {
		width: 200rpx;
		height: 150rpx;
		flex-shrink: 0;
		margin-left: 10rpx;
	}

	.activity-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 10rpx;
		line-height: 1.4;
		text-align: left;
	}

	.activity-desc {
		font-size: 28rpx;
		color: #666;
		line-height: 1.4;
		margin-bottom: 15rpx;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
		text-align: left;
	}

	.activity-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.activity-date {
		font-size: 24rpx;
		color: #999;
	}

	.activity-status {
		font-size: 24rpx;
		padding: 4rpx 12rpx;
		border-radius: 20rpx;
	}

	.activity-status.active {
		background-color: #e8f5e8;
		color: #52c41a;
	}

	.activity-status.upcoming {
		background-color: #fff7e6;
		color: #fa8c16;
	}

	.activity-status.ended {
		background-color: #f5f5f5;
		color: #999;
	}
</style>
