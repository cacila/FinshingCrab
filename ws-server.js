const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;

const webSocketServer = new WebSocketServer({ port: 8090, clientTracking: true});

let winner = 0;
let nowCard = [];
let nowCardList = [];
let first = 0;
let now = 1;
let bottom = 6;
let playerCount = 6;
const nameList = ['kacila', 'sfy', 'q', 'aaaa', 'wu', 'zhang'];
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
const compare = function Compare(content) {
	let rankList = [];
	let results = [];
	nowCard = [];
	content.forEach((data, index) => {
		data.push[false];
		if (data[3] !== '扑') {
			const rank = {};
			rank.index = (index + 1 - first + playerCount)% playerCount +1;
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
	winner = (rankList[0].index - 2 + first) % playerCount;
	content[winner][4] = true;
	
	console.log(winner);
	console.log(content);
	let needpay = bottom;
	console.log(first);
	for (let count = first, i = 0; i < 6; i++) {
		const item = content[(count + i) % playerCount];
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
				bottom -= 1;
				needpay += 1;
			} else {
				result.score -= 1;
				bottom += 1;
				needpay += 1;
			}			
		}
		if (item[3] === '带' || item[3] === '吃底') {
			if (item[4]) {
				result.winner = true;
				result.score += bottom;
				bottom = 0;
				needpay += needpay;
			} else {
				result.score -=needpay;
				bottom += needpay;
				needpay += needpay;
			}
		}
		results.push(result);
	}
	if(bottom < playerCount) {
		results.forEach((item) => {
			item.score -= 1;
		});
		bottom += playerCount;
	}
	results.push({
		name: 'bottom',
		score: bottom
	});
	console.log(results);
	return results;
};
const getCard = function GetCard() {
	let flag = 0, cardA = 0, cardB = 0;
	if(nowCard.length >= 32) return;
	while (!flag) {
		cardA = Math.floor(Math.random() * 32);
		if (!nowCard.includes(cardA)) {
			flag = 1;
			nowCard.push(cardA);
		}
	}
	flag = 0;
	while (!flag) {
		cardB = Math.floor(Math.random() * 32);
		if (!nowCard.includes(cardB)) {
			flag = 1;
			nowCard.push(cardB);
		}
	}
	return cardA < cardB ? [cardA, cardB] : [cardB, cardA];
};
const gameStart = function GameStart (index = Math.floor(Math.random() * 32) ) {
	first = (card[index].value + winner - 1) % playerCount;		
	console.log(winner);
	console.log(first);
	webSocketServer.clients.forEach((websocket, index) => {
		let cardGet = getCard();
		let message = {
			type: 'start',
			value: first,
			card: cardGet
		};			
		console.log(JSON.stringify(message));
		websocket.send(JSON.stringify(message));
		cardGet.push(websocket.name);
		nowCardList.push(cardGet);
	});	
	nowCard = [];
};


webSocketServer.on('connection', (ws) => {
	if (nameList.length > 0) {
		const nameMessage = {
			type: 'name',
			name: nameList.pop()
		}		
		ws.name = nameMessage.name;
		ws.send(JSON.stringify(nameMessage));
	} else {
		ws.close(1000,'Server is busy');
		return;
	}	
	//初始化游戏当人来齐时
	if(nameList.length === 0) {
		now = 1;
		bottom = 6;
		nowCardList = [];
		webSocketServer.clients.forEach((websocket) => {
			const message = {				
				type: 'init',
				member: [],				
			}
			let i = 0;
			webSocketServer.clients.forEach((websoc) => {
				i = i + 1;
				websoc.No = i;
				const memberMessage = {
					name: websoc.name,
					score: 50,
					option: '',
					websocNo: i,
				}
				message.member.push(memberMessage);
			})
			i = 0;
			console.log(websocket.No);
			console.log(JSON.stringify(message));
			websocket.send(JSON.stringify(message));
		});
		gameStart();
	}
	ws.onclose = () => {
		if (ws.name) {
			nameList.push(ws.name);
		}
	};
	ws.onerror = (error) => {
		console.log(error);
	};
	ws.onmessage = (data) => {
		const message = JSON.parse(data.data);
		console.log(message);
		if (message.type === 'chat') {
			webSocketServer.clients.forEach((wsocket) => {
				if(wsocket.name !== ws.name) {
					wsocket.send(JSON.stringify(message));
				}
			})
		}
		if (message.type === 'firstcard') {
			webSocketServer.clients.forEach((websocket) => {
				if (websocket.name !== ws.name) {
					console.log(message);

					websocket.send(JSON.stringify(message));
				}
			});
			
			setTimeout(() => {
				gameStart(message.value - 1);
			},2000);
		}
		if (message.type === 'option') {
			now = now + 1;
			message.name = ws.name;
			message.now = now;
			console.log(message);
			webSocketServer.clients.forEach((wsocket) => {
				wsocket.send(JSON.stringify(message));				
			});
			nowCardList.forEach((item) => {
				if(item[2] === ws.name) {
					item.push(message.content);
					return;
				}
			});
			console.log(nowCardList);
			if (message.end) {
				const results = compare(nowCardList);
				webSocketServer.clients.forEach((wsocket) => {
					wsocket.send(JSON.stringify({
						type: 'result',
						results,
					}));				
				});				
				console.log(JSON.stringify({
						type: 'result',
						results,
					}));
				nowCardList = [];
				now = 1;
			}
		}
	};
})

console.log('server is listening on 8090 port');