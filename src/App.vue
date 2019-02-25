<template>
  <div class="main">
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
</template>

<script>
import Chat from './components/Chat.vue';	
import Introduce from './components/Introduce.vue';
import Self from './components/Self.vue';
import Bottom from './components/Bottom.vue';

const ws = new WebSocket('ws://10.112.11.135:8090');

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
			name: '',
			message: '',
			players: [],
			selfNo: 0,
			before: 0,
			selfCard: [],
			others: [],
			first: 0,
			score: 0,
			palyerCount: 6,
			bottom: 6,
			now: 1,
			winner: false,
		}
	},
	mounted() {		
		ws.onmessage = (data) => {
			const message = JSON.parse(data.data);
			if (message.type === 'name') {
				this.name = message.name;
			}
			if (message.type === 'chat') {
				this.$refs.chat.messageList.push(message);
			}
			if (message.type === 'init') {
				this.players = message.member;
				message.member.forEach((mb) => {
					mb.option = '';
					mb.winner = false;
					mb.cardA = '';
					mb.cardB = '';
					if (mb.name === this.name) {
						this.selfNo = mb.websocNo;
						this.score = mb.score;
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
				this.bottom = message.results[this.palyerCount].score;
				this.players.forEach((player) => {
						let position = (this.palyerCount + player.websocNo - this.first -1) % this.palyerCount;
						let item = message.results[position];
						player.score += item.score;	
						player.winner = item.winner;
						player.cardA = item.cardA;
						player.cardB = item.cardB;
				})
			}
		};
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
			return (this.palyerCount +  this.selfNo - this.first - 1) % this.palyerCount + 1; 
		}
	},
	methods: {
		sendMessage (message) {
			ws.send(message);
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
