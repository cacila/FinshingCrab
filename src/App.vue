<template>
  <div v-if="roomFlag" class="main">	
		<button class="chatShowButton" @click="chatHandler">{{buttonContent}}聊天窗</button>
		<p class="error">{{errorMessage}}</p>
		<Bottom ref="bottom" :winner="winner" :bottom="bottom" @send="sendMessage" class="bottom" ></Bottom>
		<table v-show="tableShow">
			<thead>
				<tr>
					<th>用户名</th>
					<th>分数</th>
					<th>操作</th>
					<th colspan="2">牌型</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="item in players" :key="item.name" :style="{color: item.winner?'red':'black'}">
					<td>{{item.name}}</td>
					<td>{{item.score}}</td>
					<td>{{item.option}}</td>
					<td>{{item.cardA}}</td>
					<td>{{item.cardB}}</td>				
				</tr>
			</tbody>			
		</table>
		<div class="playerself">
			<Introduce :name="name" :score="score" class="introduce"></Introduce>
			<Self ref="self" :now="now" @send="sendMessage" :No="No" :card="selfCard" :before="before" class="self"></Self>
		</div>
		<Chat ref="chat" :name="name" @send="sendMessage" class="chat" v-show="showChat"></Chat>  		
	</div>
	<div v-else class="form">
		<p class="error">{{errorMessage}}</p>
		<div class="form-item" >
			<input type='text' v-model.trim="roomName" placeholder="请输入房间名"/>
		</div>
		<div class="form-item" >
			<input type='text' v-model.trim="name" placeholder="请输入用户名"/>
		</div>
		<div class="form-item">			
			<input type='checkbox' v-model="newRoom"/>
			<label>是否创建新房间: </label>
		</div>
		<div class="form-item" v-if="newRoom" placeholder="请输入玩家人数">
			<input type='number' v-model.number="playerCount"/>
		</div>
		<div class="form-item">
			<button @click="submitMessage">提交</button>
		</div>
		
	</div>
</template>

<script>
import Chat from './components/Chat.vue';	
import Introduce from './components/Introduce.vue';
import Self from './components/Self.vue';
import Bottom from './components/Bottom.vue';

const url = 'ws://10.112.11.135:8090'

export default {
  name: 'app',
	components:{
		Chat,
		Introduce,
		Self,
		Bottom,
	},
	data()  {
		return {
			tableShow: false,
			showChat: false,
			newRoom: false,
			roomName: '',
			submitFlag: false,
			roomFlag: false,
			theSame: false,
			name: '',
			errorMessage: '',
			message: '',
			players: [],
			selfNo: 0,
			before: 0,
			selfCard: [],
			others: [],
			first: 0,
			score: 0,
			playerCount: 6,
			bottom: 6,
			now: 1,
			winner: false,
			ws: '',
			buttonContent: '显示',
		}
	},
	mounted() {
		this.websocketInit();
	},
	computed: {
		No () {
			return (this.playerCount +  this.selfNo - this.first - 1) % this.playerCount + 1; 
		}
	},
	methods: {
		chatHandler() {
			this.showChat = !this.showChat;
			if (this.showChat) {
				this.buttonContent = '关闭';
			} else {
				this.buttonContent = '显示';
			}
		},
		websocketInit() {
			this.ws = new WebSocket(url);
			this.ws.onerror = () => {
				alert('连接出错请重连');
			};
			this.ws.onclose = () => {
				this.errorMessage = '掉线重连中';
				setTimeout(this.websocketInit,1000);				
			};
			this.ws.onopen = () => {
				this.errorMessage = '';
			}
			if (this.submitFlag) {				
				this.ws.onopen = () => {
					this.newRoom = false;						
					this.sendMessage(JSON.stringify({
						type: 'new',
						roomName: this.roomName,
						name: this.name,
						newRoom: this.newRoom,
						playerCount: this.playerCount,
					}));
				}
			}
			this.ws.onmessage = this.messageHandler;
		},
		sendMessage (message) {
			this.ws.send(message);
		},
		messageHandler(data) {
			const message = JSON.parse(data.data);
			if (message.type === 'newResult') {
				if (message.success) {
					this.roomFlag = true;
					this.errorMessage = message.content;
				}
				else {
					this.roomFlag = false;
					this.errorMessage = message.content;
				}
			}
			if (message.type === 'chat') {
				this.$refs.chat.messageList.push(message);
			}
			if (message.type === 'init') {
				this.tableShow = true;
				this.players = message.member;
				this.now = message.now;
				this.before = message.before;
				this.first = message.first;
				this.bottom = message.bottom;
				message.member.forEach((mb) => {
					if (message.now !== 1 || message.member[1].option === '') {
						mb.cardA = '';
						mb.cardB = '';
					}
					if (mb.name === this.name) {
						this.selfNo = mb.No;
						this.winner = mb.winner;
						this.score = mb.score;
						if (mb.cardAindex !== 32) {
							this.selfCard.push(mb.cardAindex,mb.cardBindex);
						}
					}
				})
			}
			if (message.type === 'option') {
				this.now = message.now;
				if (this.before === 0) {
					if (message.content !== '扑') this.before = 1;
				}
				this.players.forEach((player) => {
					if (player.name === message.name) {						
						player.option = message.content;
						return;
					}
				})
			}
			if (message.type === 'start') {
				this.now = 1;
				this.first = message.value; 
				this.before = 0;
				this.winner = false;
				this.selfCard = message.card;
				this.players.forEach((item) => {
					item.option = '';
					item.cardA = '';
					item.cardB = '';					
				});
				this.$refs.bottom.shuffle();
			}
			if (message.type === 'firstcard') {
				this.$refs.bottom.FirstCard = message.content;
			}
			if (message.type === 'result') {
				this.tableShow = false;
				this.$refs.self.option = '';
				this.score += message.results[this.No-1].score;
				this.winner = message.results[this.No-1].winner;
				this.bottom = message.results[this.playerCount].score;
				this.players.forEach((player) => {
						let position = (this.playerCount + player.No - this.first -1) % this.playerCount;
						let item = message.results[position];
						player.score += item.score;	
						player.winner = item.winner;
						player.cardA = item.cardA;
						player.cardB = item.cardB;
				})
			}
		},
		submitMessage () {
			if (this.roomName === '') {
				this.submitFlag = true;
				return;
			}
			if (this.name === '') {
				this.submitFlag = true;
				return;
			}
			if (this.newRoom) {
				if(!this.playerCount) {
					this.submitFlag = true;
					return;
				}
			}
			this.submitFlag = true;
			this.sendMessage(JSON.stringify({
				type: 'new',
				roomName: this.roomName,
				name: this.name,
				newRoom: this.newRoom,
				playerCount: this.playerCount,
			}));
		}
	}
}
</script>

<style scoped lang="less">
	ul,li,p {
		margin: 0;
		padding: 0;
	}
	* {
		box-sizing: border-box;
	}
	.main {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		flex-direction: column;
		padding: 0 20px;
		width: 100%;
		height: 100%;
		justify-content: space-around;
	}
	.chat {
		position: absolute;
		top: 35px;
		@media (min-width: 1200px) {
			right: 0;
			top: 70vh;
		}
	}
	.playerself {
		width: 100%;
		display: flex;
		max-width: 600px;
		justify-content: space-between;
		.self {
			flex-shrink: 0;
			flex-grow: 1;
		}
	}
	.bottom {
		text-align: center;
		width: 100%;
	}
	.chatShowButton {
		position: fixed;
		color: white;
		right: 0;
		top: 30px;
		width: 25px;
		text-shadow: 0px -1px 0px #5b6ddc;
		outline: none;
		border: 1px solid rgba(0, 0, 0, .49);
		background-clip: padding-box;
		border-top-left-radius: 6px;
		border-bottom-left-radius: 6px;
		background-color: #5466da;				
		cursor: pointer;		
		-webkit-box-shadow: inset 0px 1px 0px #9ab1ec;
		box-shadow: inset 0px 1px 0px #9ab1ec;
	}
	table{
		width: 100%;
		max-width: 800px;
		border: 0 solid transparent;
	}	
	tbody {
		tr {
			&:nth-of-type(2n) {
				background-color: paleturquoise;
			}
			&:nth-of-type(2n+1) {
				background-color: navajowhite;
			}
		}
		
	}
	thead {
		tr {
			background-color: skyblue;
			th {
				width: 20%;
				&:nth-of-type(4) {
					width: 40%;
				}
			}
		}
	}
	.error {
		padding: 10px;
		line-height: 16px;
		height: 16px;
		color: red;
	}
	.form {
		position: relative;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		max-width: 400px;
		height: 400px;
		text-align: center;
		animation: 1s ease-in-out login;
		color:white;
		
		@keyframes login {
			0% {
				opacity: 0;
				margin-top: 50px;
			}
			100% {
				opacity: 1;
			}
		}
		.form-item {
			display: flex;
			align-items: center;
			text-align: left;
			box-sizing: border-box;			
			width: 100%;
			padding: 10px;
			input[type="text"], input[type="number"] {
				width: 100%;
				height: 40px;
				margin-top: 7px;
				font-size: 14px;
				color: #444;
				outline: none;
				border: 1px solid rgba(0, 0, 0, .49);
				padding-left: 20px;
				
				-webkit-background-clip: padding-box;
				-moz-background-clip: padding-box;
				background-clip: padding-box;
				border-radius: 6px;
		
				background-color: #fff;
				-webkit-box-shadow: inset 0px 2px 0px #d9d9d9;
				box-shadow: inset 0px 2px 0px #d9d9d9;
			}
			input[type="checkbox"] {
				margin-top: 7px;
				font-size: 14px;
				color: #444;
				outline: none;
				border: 1px solid rgba(0, 0, 0, .49);
				padding-left: 20px;
			}
			button {
				width: 100%;
				height: 50px;
				margin-top: 7px;
				color: #fff;
				font-size: 18px;
				font-weight: bold;
				text-shadow: 0px -1px 0px #5b6ddc;
				outline: none;
				border: 1px solid rgba(0, 0, 0, .49);
		
				-webkit-background-clip: padding-box;
				-moz-background-clip: padding-box;
				background-clip: padding-box;
				border-radius: 6px;
		
				background-color: #5466da;
		
				cursor: pointer;
				
				-webkit-box-shadow: inset 0px 1px 0px #9ab1ec;
				box-shadow: inset 0px 1px 0px #9ab1ec;
				&:hover {
					background-color: #5f73e9;
					box-shadow: inset 0px 1px 0px #aab9f4;
					margin-top: 10px;
				}
				&:active {
					background-color: #7588e1;
					box-shadow: inset 0px 1px 0px #93a9e9;
				}
			}
		}		
	}
</style>
