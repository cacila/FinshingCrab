<template>
	<div>
		<p >底:{{bottom}}</p>
		<div class="team-container">
			<div :class="{ action: true, shuffle: shuffleflag }">			
				<transition-group name="team" tag="div" :class="{ container: true, shuffle: shuffleflag }">
					<div v-for="(item, index) in team" :key="item.card" :class="{content:true, back: item.card !== selectItem}" @click="selectHandle(item, index)">
						{{item.card}}
					</div>
				</transition-group>
			</div>
		</div>
	</div>
</template>

<script>
	import _ from 'lodash';	

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
		props:['bottom', 'winner', ],
		data() {
			return {
				team: card.map((item) => {return {
					card: item.card,
					type: item.type
				}}),
				shuffleflag: false,
				selectItem: '',
				FirstCard: '',
			}
		},
		watch: {
			FirstCard (value) {
				if (this.winner) return;
				this.selectItem = value;
				let temp;
				this.team.forEach((item, index) => {
					if (item.card === value) {
						temp = this.team[index];
						this.team[index] = this.team[0];
					}
				});
				this.team[0] = temp;
				setTimeout(() => {
					this.shuffleflag = false;					
				}, 1000);
			}
		},
		mounted() {
			setTimeout(this.shuffle, 1000);
		},
		methods: {
			shuffle() {
				this.shuffleflag = true;
				this.selectItem = '';
				setTimeout (() => {
					this.team = _.shuffle(this.team);
				},1000);				
			},
			selectHandle(item, index) {
				if (!this.winner) return;
				if (this.selectItem) return;
				this.selectItem = item.card;				
				this.team[index] = this.team[0];
				this.team[0] = item;
				setTimeout(() => {
					this.shuffleflag = false;					
				}, 1000);
				this.$emit('send',JSON.stringify({
					type: 'firstcard',
					content: item.card,
					value: item.type
				}))
			}
		}
	}
</script>

<style>
	.team-container {
		height: 160px;
		width: 240px;
		position: relative;
		left: 50%;
		transform: translate(-50%, 0);
	}
	.action {
		height: 40px;
		width: 30px;
		transition: all 1s;
		overflow: hidden;
		position: relative;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}
	.action.shuffle {
		left: 0;
		top: 0;
		transform: translate(0, 0);
		width: 240px;
		height: 160px;		
	}
	.container {
		
		display: flex;
		width: 240px;
		height: 160px;
		overflow: hidden;
		flex-wrap: wrap;
		position: relative;				
	}
	
	.content {
		box-sizing: border-box;
		text-align: center;
		width: 30px;
		height: 40px;
		border: 1px solid black;
		border-radius: 5px;
	}
	.content.back {
		color: transparent;
		background-color: #eee;
		background-image: linear-gradient(45deg, black 25%, transparent 25%, transparent 75%, black 75%, black),
		linear-gradient(45deg, black 25%, transparent 25%, transparent 75%, black 75%, black);
		background-size: 6px 6px;
		background-position: 0 0, 3px 3px;
	}
	.team-move {
		transition: transform 1s;
	}
</style>
