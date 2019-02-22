<template>
	<div class="chat">
		<div class="screen">
			<div class="message" v-for="(item, index) in messageList" :key="index">
				<p class="message-title">{{item.name}}</p>
				<p class="message-content">{{item.content}}</p>
			</div>
		</div>
		<div class="message-input">
			<textarea v-model="message">				
			</textarea>
			<button @click="sendMessage()">发送</button>
		</div>
	</div>
</template>

<script>
	export default {
		props: ['name'],
		data() {
			return {
				messageList:[],
				message:'',
			}
		},
		methods: {
			sendMessage () {
				if (this.message.length === 0) {
					return;
				}			
				const time = new Date();
				const hour = time.getHours();
				const minute = time.getMinutes();
				const second = time.getSeconds();
				const message = {
					type: 'chat',
					name: `${this.name}-${hour}:${minute}:${second}`,
					content: this.message				
				};
				this.messageList.push(message);
				this.$emit('send',JSON.stringify(message));
				this.message = '';			
			}
		}
	}
</script>

<style scoped lang="less">
.chat {
	p {
		margin: 0;		
	}
	input,button,select,textarea{outline:none}
	textarea{resize:none}
	button {
		color: white;
		width: 40px;
		height: 20px;
		border: 0 solid transparent;
		background-color: deepskyblue;
		font-size: 12px;
	}
	background-color: black;
	width: 300px;
	padding: 10px; 
	.screen {
		box-sizing: border-box;
		background-color: white;
		width: 300px;
		height: 150px;
		border: 1px steelblue solid;
		overflow-y: scroll;		
		-ms-overflow-style: none;			
		overflow: -moz-scrollbars-none;
		&::-webkit-scrollbar {
			display: none;
		}
	}
	.message-input {
		padding-top: 5px;
		text-align: right;
		textarea {
			box-sizing: border-box;
			width: 300px;
			height: 50px;
		}		
	}
	.message {
		padding-left: 5px;
		font-size: 12px;
		.message-title {
			color: darkblue;
		}
		.message-content {
			padding-left: 10px; 
			color: coral;
		}
	}
}
</style>
