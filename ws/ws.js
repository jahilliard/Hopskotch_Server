var WebSocket = require('ws').Server;
var AuthController = require("../controllers/AuthController.js");
var Chat = require("../models/Chat.js");
var Message = require("../models/Message.js");



var ws = null;
var clients = {};

//initialize websocket components
function initialize(server){
	ws = new WebSocket({server: server});

	ws.on('connection', function connection(ws) {
		ws.on('message', function incoming(data, flags) {
			var JSONdata = JSON.parse(data);
			AuthController.validateJSONAuth(JSONdata, function(errString){
				if (errString){
					var error = {error: errString}
					ws.send(JSON.stringify(error));
					return;
				} 
				onMessage(ws, JSONdata, flags);
			})
		});

		ws.on('close', function close(ws) {
			onClose(ws);
		});
	})
}

function onClose(ws){
	 keys = Object.keys(clients);
	 for (var i = 0; i < keys.length; i++){
	 	if(clients[keys[i]] == ws) {
	 		delete clients[keys[i]];
	 		return;
	 	}
	 }
}

//expect "date", "receiver", and "message" in messageBody
function processChatMessage(ws, sender, messageBody){
	var receiver = messageBody.receiver;
	var receiverSocket = clients[receiver];
	if (receiverSocket == null){
		var error = {error: "Receiver of message is not registered for chat"};
		ws.send(JSON.stringify(error));
		return;
	}

	Chat.getChat(sender, receiver, function(err, docs){
		console.log("HELLO");
		if (err){
			return ws.send(JSON.stringify(err));
		} else {
			if (docs.length > 0){
				var chatId = docs[0]._id;
				var newMessage = new Message({to: receiver, from: sender, 
					chatId: chatId, date: messageBody.date, 
					message: messageBody.message});
				newMessage.saveMessage(function(err, newMsg){
					if (err){
						return ws.send(JSON.stringify(err));
					} else {
						ws.send(JSON.stringify({message: "success"}));
						receiverSocket.send(JSON.stringify({message: "newMessages"}));
					}
				});
			} else {
				//create new chat
				var newChat = new Chat({user1: sender, user2: receiver});
				newChat.saveChat(function(err, newChat){
					var newMessage = new Message({to: receiver, from: sender, 
					chatId: newChat._id, date: messageBody.date, 
					message: messageBody.message});
					newMessage.saveMessage(function(err, newMsg){
						if (err){
							return ws.send(JSON.stringify(err));
						} else {
							ws.send(JSON.stringify({message: "success"}));
							receiverSocket.send(JSON.stringify({message: "newMessages"}));
						}
					});
				});
			}
		}
	});
}

function onMessage(ws, data, flags){
	switch (data.messageType) {
		case "ChatMessage":
			if (!(data.id in clients)){
				console.log(clients);
				var error = {error: "Socket not registered yet, please register first"}
				ws.send(JSON.stringify(error));
				return;
			}
		  processChatMessage(ws, data.id, data.data)
			break;

		case "RegisterSocket":
			if (!("id" in data)){
				var error = {error: "MISSING id field"}
				ws.send(JSON.stringify(error));
				return;
			}

			clients[data.id] = ws
			ws.send(JSON.stringify({"message": "success"}));
			break;

		case "Default":
			var error = {error: "MISSING messageType field"}
			ws.send(JSON.stringify(error));
	}
}

var webSocket = {
	initializeWebSocket: function(server){
		initialize(server);
	},
}


module.exports = webSocket;