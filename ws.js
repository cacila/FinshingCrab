const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;

const webSocketServer = new WebSocketServer({ port: 8090, clientTracking: true});

const card = [
	{ type: 1, value: 6, card: '🃏', rank: 1},
	{ type: 2, value: 3, card: '♠3', rank: 1 },
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
		this.time = 0;
		this.bottom = 6;
		this.playerCount = playerCount;
		this.nameList = [];
		this.playerMessage = [];
		this.gameStatus = false;
		this.before = 0;
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
				cardAindex: 32,
				cardBindex: 32,
				winner: false,
				score: 50,
				option: '',
			};
			this.playerMessage.push(message);
			this.sendMessage(JSON.stringify({
				type: 'init',
				member: this.playerMessage,
				now: this.now,
				bottom: this.bottom,
				first: this.first,
				before: this.before,
			}));
		})
	}
	getMessage(playerName, websocket) {
		this.nameList.forEach((item, index) => {
			if (item.name === playerName) {
				const message = {
					type: 'ConnetAgain',
					content: this.playerMessage[index],
				}
				if (websocket.readyState === 1) {
					websocket.send(JSON.stringify({
						type: 'init',
						member: this.playerMessage,					
						now: this.now,
						bottom: this.bottom,
						first: this.first,
						before: this.before,
					}));
					websocket.send(JSON.stringify(message));
					item.websocket = websocket;			
				}					
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
		console.log(`${name} join`);
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
		this.before = 0;
		console.log(this.playerMessage);
		this.playerMessage[this.winner].winner = false;
		this.playerMessage.forEach((item) => {
			item.cardA = '';
			item.cardB = '';
			item.option = '';
			item.cardAindex = 32;
			item.cardAindex = 32;
		});
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
			this.playerMessage[index].cardAindex = cardGet[0];
			this.playerMessage[index].cardBindex = cardGet[1];
			console.log(JSON.stringify(message));
			if (websocket.readyState === 1) {
				websocket.send(JSON.stringify(message));
			}			
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
		this.winner = (rankList[0].index - 2 + this.first + this.playerCount) % this.playerCount;
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
			this.playerMessage.forEach((item) => {
				item.score -= 1;
			});
		}
		results.push({
			name: 'bottom',
			score: this.bottom
		});
		console.log(results);
		this.sendMessage(JSON.stringify({
			type: 'result',
			results,
		}));
		this.now = 1;
		this.nowCardList = [];
		rankList = [];
		results = [];
	}
	sendMessage(message, webSocket = undefined) {
		console.log(message);
		console.log(webSocket);
		if (webSocket) {
			if (webSocket.readyState === 1) {
				webSocket.send(message);
			}			
		}
		else {
			this.nameList.forEach(({ name, websocket }, index) => {
				console.log(name);
				if (websocket.readyState === 1) {
					websocket.send(message);
				}				
			})
		}
	}
	addOption(ws, option) {
		this.now = this.now + 1;
		if (option !== '扑') this.before = 1;
		this.nameList.forEach(({ name, websocket }, index) => {
			if (websocket === ws) {
				console.log(this.nowCardList);
				console.log(index);
				this.sendMessage(JSON.stringify({
					type: 'option',
					name,
					now: this.now,
					content: option,
				}));
				console.log(this.nowCardList);
				this.nowCardList[index].push(option);
				this.playerMessage[index].option = option;
			}
		});		
	}
} 

const roomList = [];

webSocketServer.on('connection', (ws) => {
	let room = undefined;
	ws.onerror = (error) => {
		console.log(error);
	};
	ws.onclose = () => {
		console.log('connect closed');
		if (!room) return;
		if (room.time !== 0) {
			clearTimeout(room.time);
		}
		room.time = setTimeout(() => {
			room.nameList.forEach(({name, websocket}, index) => {
				if (websocket.readyState === 2) {
					return;
				}
				if (index === room.nameList.length - 1) {
					roomList.forEach((item, itemindex) => {
						if (item === room) {
							roomList.splice(itemindex, 1);
						}
					});
				}
			})
		},120000);
	}
	ws.onmessage = (data) => {
		const message = JSON.parse(data.data);
		console.log(message);
		if (message.type === 'new') {
			const newMessage = {
				type: 'newResult',
				content: '',
				success: true,
			}
			if (message.newRoom) {
				roomList.forEach((item) => {
					if (item.teamName === message.roomName) {
						newMessage.success = false;
						newMessage.content = '房间名已存在';
						return;
					}
				})
				if (newMessage.success) {
					room = new Crab(message.roomName, message.playerCount, message.name, ws);
					roomList.push(room);					
				}
			} else {
				roomList.forEach((item) => {
					if (item.teamName === message.roomName) {
						room = item;
						return;
					}
				});
				if (room) {
					if (room.gameStatus) {
						room.getMessage(message.name, ws);
					} else {
						room.nameList.forEach((item) => {
							if (item.name === message.name) {	
								console.log(item.websocket.readyState);
								if (item.websocket.readyState === 1) {
									newMessage.success = false;
									newMessage.content = '用户名已存在';
								} else {
									newMessage.content = 'success';
								}
								return ;
							}
						})
						if (newMessage.success && newMessage.content !== 'success') {
							room.addPlayer(message.name, ws);
						}
						if (newMessage.content === 'success') {
							newMessage.content = '';
						}
					}
				} else {
					newMessage.success = false;
					newMessage.content = '房间名不存在';
				}
			}
			console.log(`${message.name} join`);
			if (ws.readyState === 1) {
				console.log(newMessage);
				ws.send(JSON.stringify(newMessage));
			}
			
		}
		if (message.type === 'chat') {
			room.nameList.forEach(({ name, websocket }) => {
				if (websocket !== ws) {
					if (websocket.readyState === 1) {
						websocket.send(JSON.stringify(message));
					}					
				}
			});		
		}
		if (message.type === 'firstcard') {
			room.nameList.forEach(({ name, websocket }) => {
				if (websocket !== ws) {
					if (websocket.readyState === 1) {
						websocket.send(JSON.stringify(message));
					}					
				}
			});			
			setTimeout(() => {
				room.gameStart(message.value - 1);
			},3000);
		}
		if (message.type === 'option') {
			room.addOption(ws, message.content);
			if (message.end) {
				room.compare();			
			}
		}
	};
})

console.log('server is listening on 8090 port');