<template>
  <div class="main">
		<Introduce :name="name" :score="score" class="introduce"></Introduce>
		<Self @send="sendMessage" :No="1" :card="selfCard" :before="before" class="self"></Self>
		<Chat ref="chat" :name="name" @send="sendMessage" class="chat"></Chat>
  </div>
</template>

<script>
import Chat from './components/Chat.vue';	
import Introduce from './components/Introduce.vue';
import Self from './components/Self.vue';

const ws = new WebSocket('ws://localhost:8090');

export default {
  name: 'app',
	components:{
		Chat,
		Introduce,
		Self,
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
				this.players = data.meber;
				this.selfNo = data.me;
			}
			if (message.type === 'start') {
				this.first = data.value; 
				this.selfCard = data.card;
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
	methods: {
		sendMessage (message) {
			ws.send(message);
		}
	}
}
</script>

<style scoped lang="less">
	.main {
		display: grid;
		grid-template-columns: 1fr 2fr 1fr;
		grid-template-columns: 1fr 2fr 1fr;
	}
	.chat {
		text-align: center;
		display: block;				
		grid-row: 3/4;
		grid-column: 3/4;
	}
	.introduce {
		text-align: center;
		display: block;		
		grid-row: 1/2;
		grid-column: 3/4;
	}
	.self {
		text-align: center;
		grid-row: 2/3;
		grid-column: 3/4;
	}
	
</style>
