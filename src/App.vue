<template>
  <div v-if="roomFlag" class="main">
		<Bottom ref="bottom" :winner="winner" :bottom="bottom" @send="sendMessage" class="bottom"></Bottom>
		<ul>
			<li v-for="item in players" :key="item.name" :style="{color: item.winner?'red':'black'}">
				<p>{{item.name}}</p>
				<p>{{item.score}}</p>
				<p>{{item.option}}</p>
				<p>{{item.cardA}}</p>
				<p>{{item.cardB}}</p>
				
			</li>
		</ul>
		<Introduce :name="name" :score="score" class="introduce"></Introduce>
		<Self ref="self" :now="now" @send="sendMessage" :No="No" :card="selfCard" :before="before" class="self"></Self>
		<Chat ref="chat" :name="name" @send="sendMessage" class="chat"></Chat>  
	</div>
	<div v-else class="form">
		<p>{{errorMessage}}</p>
		<div class="form-item" >
			<label>房间名: </label>
			<input type='text' v-model.trim="roomName"/>
			<span v-if="submitFlag">请输入房间名</span>
		</div>
		<div class="form-item" >
			<label>用户名: </label>
			<input type='text' v-model.trim="name"/>
			<span v-if="submitFlag">请输入用户名</span>
		</div>
		<div class="form-item">
			<label>是否创建新房间: </label>
			<input type='checkbox' v-model="newRoom"/>
		</div>
		<div class="form-item" v-if="newRoom" >
			<label>玩家人数: </label>
			<input type='number' v-model.number="playerCount"/>
			<span v-if="submitFlag">请输入玩家人数</span>
		</div>
		<button @click="submitMessage">提交</button>
	</div>
</template>

<script>
import Chat from './components/Chat.vue';	
import Introduce from './components/Introduce.vue';
import Self from './components/Self.vue';
import Bottom from './components/Bottom.vue';

const url = 'ws://10.112.11.135:8090'
let ws = new WebSocket(url);

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
		}
	},
	mounted() {
		ws.onerror = () => {
			alert('连接出错请重连');
		}
		ws.onclose = () => {
			alert('掉线请重连');
		}
		ws.onmessage = this.messageHandler;
		/*
		ws.addEventListener('open',() => {
			const message = {
				type: 'firstConnect',
				name: this.name,
			}
			ws.send(JSON.stringify(message));
		});
		*/
	},
	computed: {
		No () {
			return (this.playerCount +  this.selfNo - this.first - 1) % this.playerCount + 1; 
		}
	},
	methods: {
		sendMessage (message) {
			ws.send(message);
		},
		messageHandler(data) {
			const message = JSON.parse(data.data);
			if (message.type === 'newResult') {
				if (message.success) {
					this.roomFlag = true;
				}
				else {
					this.errorMessage = message.content;
				}
			}
			if (message.type === 'chat') {
				this.$refs.chat.messageList.push(message);
			}
			if (message.type === 'init') {
				this.players = message.member;
				this.now = message.now;
				this.first = message.first;
				this.bottom = message.bottom;
				message.member.forEach((mb) => {
					mb.cardA = '';
					mb.cardB = '';
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
	.main {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		width: 100vw;
		height: 96vh;
		justify-content: space-around;
	}
	.Chat {
		
	}
	.bottom {
		text-align: center;
		width: 100%;
	}
	ul{
		width: 90%;
		border-top: black solid 1px;
		border-left: black solid 1px;
		border-right: black solid 1px;
	}
	li {		
		justify-content: space-around;
		display: flex;
		border-bottom: 1px solid #333;
		
		p {
			width: 100px;
			text-align: right;
		}
	}
	
</style>
