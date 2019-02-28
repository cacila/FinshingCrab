<template>
	<div class="self-container">
		<p>你是第{{No}}家</p>
		<div class="option">			
			<button v-if="(before === 0 && option === '') || option === '吃底'" @click="Option">吃底</button>
			<button v-if="(No > 1 && before !== 0 && option === '') || option === '带'" @click="Option">带</button>
			<button v-if="option === '' || option === '碰'" @click="Option">碰</button>
			<button v-if="(option === '' || option === '扑') && !(No === 6 && before === 0)" @click="Option">扑</button>
		</div>
		<div class="card">
			<div><span>{{cardA}}</span></div>
			<div><span>{{cardB}}</span></div>
		</div>
	</div>
</template>

<script>
const card = [
	{ type: 1, value: 3, card: '🃏', rank: 1},
	{ type: 2, value: 6, card: '♠3', rank: 1 },
	{ type: 3, value: 12, card: '♥Q', rank: 2 },
	{ type: 4, value: 12, card: '♦Q', rank: 2 },
	{ type: 5, value: 2, card: '♥2', rank: 3 },
	{ type: 6, value: 2, card: '♦2', rank: 3 },
	{ type: 7, value: 8, card: '♥8', rank: 4 },
	{ type: 8, value: 8, card: '♦8', rank: 4 },
	{ type: 9, value: 4, card: '♥4', rank: 5 },
	{ type: 10, value: 4, card: '♦4', rank: 5 },
	{ type: 11, value: 6, card: '♠6', rank: 6 },
	{ type: 12, value: 6, card: '♣6', rank: 6 },
	{ type: 13, value: 10, card: '♠10', rank: 6 },
	{ type: 14, value: 10, card: '♣10', rank: 6 },
	{ type: 15, value: 4, card: '♠4', rank: 6 },
	{ type: 16, value: 4, card: '♣4', rank: 6 },
	{ type: 17, value: 11, card: '♥J', rank: 7 },
	{ type: 18, value: 11, card: '♦J', rank: 7 },
	{ type: 19, value: 7, card: '♥7', rank: 7 },
	{ type: 20, value: 7, card: '♦7', rank: 7 },
	{ type: 21, value: 10, card: '♥10', rank: 7 },
	{ type: 22, value: 10, card: '♦10', rank: 7 },
	{ type: 23, value: 6, card: '♥6', rank: 7 },
	{ type: 24, value: 6, card: '♦6', rank: 7 },
	{ type: 25, value: 9, card: '♥9', rank: 8 },
	{ type: 26, value: 9, card: '♦9', rank: 8 },
	{ type: 27, value: 5, card: '♥5', rank: 8 },
	{ type: 28, value: 5, card: '♦5', rank: 8 },
	{ type: 29, value: 7, card: '♠7', rank: 8 },
	{ type: 30, value: 7, card: '♣7', rank: 8 },
	{ type: 31, value: 8, card: '♠8', rank: 8 },
	{ type: 32, value: 8, card: '♣8', rank: 8 },	
]
export default {
	props: ['No', 'before' ,'card','now'],
	data() {
		return {
			option: '' 
		}
	},
	methods: {
		Option(event) {
			if (this.now !== this.No) return; 
			this.option = event.target.textContent;
			const message = {
				type: 'option',
				end: this.No === 6,
				content: this.option,
			}
			
			this.$emit('send',JSON.stringify(message));
		}
	},
	computed: {
		cardA() {
			return  this.card.length ? card[this.card[0]].card : '';
		},
		cardB() {
			return  this.card.length ? card[this.card[1]].card : '';
		}
	},
}
</script>

<style lang="less">
	div.self-container {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		color:white;
		max-width: 180px;
		height: 120px;
		p {
			margin: 0;
			text-align: center;
		}
		.option {
			display: flex;
			justify-content: space-around;
			button {
				width: 40px;
				margin-top: 7px;
				color: #fff;
				font-size: 12px;
				font-weight: bold;
				text-shadow: 0px -1px 0px #5b6ddc;
				outline: none;
				border: 1px solid rgba(0, 0, 0, .49);
				background-clip: padding-box;
				border-radius: 6px;
						
				background-color: #5466da;
						
				cursor: pointer;
				
				-webkit-box-shadow: inset 0px 1px 0px #9ab1ec;
				box-shadow: inset 0px 1px 0px #9ab1ec;
			}
		}
		.card {
			display: flex;
			justify-content: center;
			div {
				color: black;
				text-align: center;
				background-color: white;
				width: 30px;
				height: 40px;
				border: 1px solid black;
				border-radius: 5px;
				vertical-align: middle;
				::before {
					height: 100%;
					width: 0;
					vertical-align: middle;
					display: inline-block;
					content: '';
				}
				::after {
					height: 100%;
					width: 0;
					vertical-align: middle;
					display: inline-block;
					content: '';
				}
			}
		}
	}
</style>
