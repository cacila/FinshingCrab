const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;

const webSocketServer = new WebSocketServer({ port: 8090, clientTracking: true});

const nameList = ['kacila', 'sfy', 'q', 'aaaa', 'wu', 'zhang'];
let winner = 0;
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
	{ type: 29, value: 7, card: '♥7', rank: 8 },
	{ type: 30, value: 7, card: '♦7', rank: 8 },
	{ type: 31, value: 8, card: '♥8', rank: 8 },
	{ type: 32, value: 8, card: '♦8', rank: 8 },	
]
const compare = function Compare(content) {
	const rankList = []
	nowCard = []
	content.forEach((data, index) => {
		const rank = {};
		rank.index = index;
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
		} else if (card[data[0]].type === 3 || card[data[1]].type === 4) {
			rank.value = (card[data[0]].value + card[data[0]].value) % 12;
		} else if (card[data[0]].type === 5 || card[data[1]].type === 6) {
			rank.value = (card[data[0]].value + card[data[1]].value) % 11;
		} else {
			rank.value = (card[data[0]].value + card[data[1]].value) % 10;
		}
		rankList.push(rank);
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
	return rankList;	
} 
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
}
let nowCard = [];
let nowCardList = [];


webSocketServer.on('connection', (ws) => {
	if (nameList.length > 0) {
		const nameMessage = {
			type: 'name',
			name: nameList.pop()
		}
		ws.name = nameMessage.name;
		ws.No = webSocketServer.clients.length;
		ws.send(JSON.stringify(nameMessage));
	} else {
		ws.close(1000,'Server is busy');
		return;
	}	
	if(nameList.length === 0) {
		webSocketServer.clients.forEach((websocket) => {
			const message = {
				type: 'init',
				member: [],
				me: websocket.No,
			}
			webSocketServer.clients.forEach((websoc) => {
				const memberMessage = {
					name: websoc.name,
					score: 50,
					websocNo: websoc.No
				}
				message.member.push(memberMessage);
			})
			websocket.send(JSON.stringify(message));
		});
		const first = (card[Math.floor(Math.random() * 32)].value + winner) % 6 + 1;		
		webSocketServer.clients.foEach((websocket) => {
			const card = getCard();
			const message = {
				type: 'start',
				value: first,
				card,
			},
			nowCardList.push(card);
			ws.send(JSON.stringify(message));
		});
		
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
	};
})

console.log('server is listening on 8090 port');