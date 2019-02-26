const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;

const webSocketServer = new WebSocketServer({ port: 8090, clientTracking: true});

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
class Crab {
	constructor(teamName, playerCount, name, websocket) {
		this.teamName = teamName;
		this.nowCard = [];
		this.nowCardList = [];
		this.winner = 0;
		this.now = 1;
		this.first = 0;
		this.bottom = 6;
		this.playerCount = playerCount;
		this.nameList = [];
		this.playerMessage = [];
		this.gameStatus = false;
		this.nameList.push({
			name,
			websocket,
		});
	}
	init() {
		if (this.playerCount !== this.nameList.length) return false;
		this.nameList.forEach((value, index) => {
			const message = {
				name: value.name,
				No: index + 1,
				cardA: '',
				cardB: '',
				winner: false,
				score: 50,
				option: '',
				bottom: this.bottom,
			};
			this.playerMessage.push(message);
			this.sendMessage(JSON.stringify({
				type: 'init',
				member: this.playerMessage,
			}));
		})
	}
	getMessage(playerName, websocket) {
		this.nameList.forEach((item, index) => {
			if (item.name === playerName) {
				const message = {
					type: 'ConnetAgain',
					content: playerMessage[index],
				}
				websocket.send(JSON.stringify({
					type: 'init',
					member: this.playerMessage,
				}));
				websocket.send(JSON.stringify(message));
				item.websocket = websocket;				
				return;
			}
		});
	}
	addPlayer(name, websocket) {
		if (this.nameList.length === this.playerCount) return false;
		this.nameList.push({
			name,
			websocket,
		});
		if (this.nameList.length === this.playerCount) {
			this.init();
			this.gameStart();
			this.gameStatus = true;
		}
		return true;
	}
	getCard() {
		let flag = 0, cardA = 0, cardB = 0;
		if(this.nowCard.length >= 32) return;
		while (!flag) {
			cardA = Math.floor(Math.random() * 32);
			if (!this.nowCard.includes(cardA)) {
				flag = 1;
				this.nowCard.push(cardA);
			}
		}
		flag = 0;
		while (!flag) {
			cardB = Math.floor(Math.random() * 32);
			if (!this.nowCard.includes(cardB)) {
				flag = 1;
				this.nowCard.push(cardB);
			}
		}
		return cardA < cardB ? [cardA, cardB] : [cardB, cardA];
	}
	gameStart(index = Math.floor(Math.random() * 32)) {
		console.log(this.playerMessage);
		this.playerMessage[this.winner].winner = false;
		this.first = (card[index].value + this.winner - 1) % this.playerCount;
		this.nameList.forEach(({name, websocket}, index) => {
			let cardGet = this.getCard();
			let message = {
				type: 'start',
				value: this.first,
				card: cardGet
			};
			
			this.playerMessage[index].cardA = card[cardGet[0]].card;
			this.playerMessage[index].cardB = card[cardGet[1]].card;
			console.log(JSON.stringify(message));
			websocket.send(JSON.stringify(message));
			cardGet.push(name);
			this.nowCardList.push(cardGet);
		});	
		this.nowCard = [];
	}
	compare() {
		let rankList = [];
		let results = [];
		this.nowCardList.forEach((data, index) => {
			data.push[false];
			if (data[3] !== '扑') {
				const rank = {};
				rank.index = (index + 1 - this.first + this.playerCount)% this.playerCount +1;
				if (card[data[0]].rank === 1) {
					rank.rankA = card[data[1]].rank;
					rank.rankB = 9;
				} else {
					rank.rankA = card[data[0]].rank;
					rank.rankB = card[data[1]].rank;
				}		
				if ( data[0] % 2 === 0 && data[0] === data[1] - 1) {
					rank.value = 12;
					if (card[data[1]].rank === 1) {
						rank.rankA = 1;
						rank.rankB = 1;
					}
				} else if (card[data[0]].rank === 2 || card[data[1]].rank === 2) {
					rank.value = ((card[data[0]].value % 10) + (card[data[1]].value % 10)) % 12;
				} else if (card[data[0]].rank === 3 || card[data[1]].rank === 3) {
					rank.value = ((card[data[0]].value % 10) + (card[data[1]].value % 10)) % 11;
				} else {
					rank.value = (card[data[0]].value + card[data[1]].value) % 10;
				}
				rankList.push(rank);
			}		
		});
		rankList.sort((x, y) => {
			if (x.value > y.value) {
				return -1
			}
			if (x.value < y.value) {
				return 1;
			}
			if (x.rankA < y.rankA) {
				return -1;
			}
			if(x.rankA > y.rankA) {
				return 1;
			}
			if (x.rankB < y.rankB) {
				return -1;
			}
			if(x.rankB > y.rankB) {
				return 1;
			}
			if(x.index < y.index) {
				return -1;
			} else {
				return 1;
			}
		});	
		console.log(rankList);
		this.winner = (rankList[0].index - 2 + this.first) % this.playerCount;
		this.nowCardList[this.winner][4] = true;
		this.playerMessage[this.winner].winner = true;
		
		console.log(this.winner);
		console.log(this.nowCardList);
		let needpay = this.bottom;
		console.log(this.first);
		for (let count = this.first, i = 0; i < this.playerCount; i++) {
			let position = (count + i) % this.playerCount;
			const item = this.nowCardList[position];
			const result = {
				name: item[2],
				score: 0,
				winner: false,
				cardA: card[item[0]].card,
				cardB: card[item[1]].card,
			}
			if (item[3] === '扑') {
				results.push(result);
				continue;
			}
			if (item[3] === '碰') {
				if (item[4]) {
					result.winner = true;
					result.score += 1;
					this.bottom -= 1;
					needpay += 1;
				} else {
					result.score -= 1;
					this.bottom += 1;
					needpay += 1;
				}			
			}
			if (item[3] === '带' || item[3] === '吃底') {
				if (item[4]) {
					result.winner = true;
					result.score += this.bottom;
					this.bottom = 0;
					needpay += needpay;
				} else {
					result.score -=needpay;
					this.bottom += needpay;
					needpay += needpay;
				}
			}
			this.playerMessage[position].score += result.score; 
			results.push(result);
		}
		if(this.bottom < this.playerCount) {
			results.forEach((item) => {
				item.score -= 1;
			});
			this.bottom += this.playerCount;
		}
		results.push({
			name: 'bottom',
			score: this.bottom
		});
		this.playerMessage.forEach((item) => {
			item.bottom = this.bottom;
		});
		console.log(results);
		this.sendMessage(JSON.stringify(results));
	}
	sendMessage(message, webSocket = undefined) {
		if (webSocket) {
			webSocket.send(message);
		}
		else {
			this.nameList.forEach(({ name, websocket }, index) => {
				websocket.send(message);
			})
		}
	}
	addOption(ws, option) {
		this.now = this.now + 1;
		this.nameList.forEach(({ name, websocket }, index) => {
			if (websocket === ws) {
				console.log(this.nowCardList);
				console.log(index);
				this.nowCardList[index].push(option);
				this.playerMessage[index].option = option;
			}
		});
		this.sendMessage(JSON.stringify({
			type: 'option',
			now: this.now,
			content: option,
		}));	
	}
} 
var test = new Crab('闭群',6,'kacila',)
test.addPlayer('wu',)
test.addPlayer('zhang',)
test.addPlayer('sfy',)
test.addPlayer('q',)
test.addPlayer('aaaa',)
test.addOption('wu','碰')
test.addOption('aaaa','碰')
test.addOption('zhang','碰')
test.addOption('kacila','碰')
test.addOption('sfy','碰')
test.addOption('q','碰')
test.compare()
console.log(test.playerMessage);