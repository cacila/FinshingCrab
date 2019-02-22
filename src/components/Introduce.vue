<template>
	<div class="introduce">
		<p class="introduce-message" v-for="(item, key) in IntroduceMessage" :key="key">
			<span class="introduce-title">{{key}}:</span>
			<span class="introduce-content">{{item}}</span>
		</p>		
	</div>
</template>

<script>
	export default {
		props: ['name','score'],
		computed: {
			IntroduceMessage() {
				return {
					用户名: this.name,
					分数: this.score,
				}
			}
		},
	}
</script>

<style scoped lang="less">
	.introduce {
		width: 200px;
		height: 100px;
		font-size: 14px;
		padding: 10px;
		background-color:black;
		.introduce-message {			
			span {
				display: inline-block;
			}
			.introduce-title {
				text-align: right;
				width: 50px;
				margin-left: 50px;
				padding-right: 5px;
				color: white;
			}
			.introduce-content {
				color: white;
			}
		}	
	}
	
</style>
