var AuthController = require("../controllers/AuthController.js");
var Chat = require("../models/Chat.js");
var Message = require("../models/Message.js");
var socketIdToUserId = {};
var userIdToSocket = {};

//initialize websocket components
function initialize(server){
	var io = require('socket.io')(server);
	//register handshake
	io.use(function(socket, next){
		var handshakeData = socket.request._query;
		console.log(handshakeData);

		if (!('id' in handshakeData)){
			return next(new Error("missing id"));
		}

		if (!('access_token' in handshakeData)){
			return next(new Error("missing access_token"));
		}

		var userId = handshakeData.id;
		var accessToken = handshakeData.access_token;

		AuthController.validateSocketAuth(accessToken, userId, function(errString){
			if (errString){
				next(new Error(errString));
				return;
			}
			//add connection to our managed list of connections
			socketIdToUserId[socket.id] = userId;
			userIdToSocket[userId] = socket;
			next(); 
		});
	});

	io.on('connection', function (socket) {
		console.log("new connection!");
		initializeHandlers(socket);
	})
}

function initializeHandlers(socket){
	socket.on('ChatMessage', function(data, callback){
		processChatMessage(socket, data, callback);
	});

	socket.on('reconnect', function() {} ); // connection restored  
	socket.on('reconnecting', function(nextRetry) {} ); //trying to reconnect
	socket.on('reconnect_failed', function() { console.log("Reconnect failed"); });
	socket.on('disconnect', function() {
		onDisconnect(socket);
	});
}

function onDisconnect(socket){
	console.log("socket disconnected!")
	var userid = socketIdToUserId[socket.id];
	delete socketIdToUserId[socket.id];
	delete userIdToSocket[userid];
}

//expect "date", "receiver", and "message" in data
function processChatMessage(socket, data, callback){
	var sender = socketIdToUserId[socket.id];
	var receiver = data.receiver;
	var receiverSocket = userIdToSocket[receiver];
	//TODO: check if in same circle

	Chat.getChat(sender, receiver, function(err, docs){
		if (err){
			return callback("error", {error: err});
		} else {
			if (docs.length > 0){
				var chatId = docs[0]._id;
				var newMessage = new Message({to: receiver, from: sender, 
					chatId: chatId, isRead: false, date: new Date(), 
					message: data.message});
				newMessage.saveMessage(function(err, newMsg){
					if (err){
						return callback("error", {error: err});
					} else {
						callback("success", {message: "success", chatId: chatId});
						if (receiverSocket != null){
							receiverSocket.emit("newMessage", {from: sender, message: data.message, chatId: chatId});
						}
					}
				});
			} else {
				//create new chat
				var newChat = new Chat({user1: sender, user2: receiver});
				newChat.saveChat(function(err, newChat){
					var newMessage = new Message({to: receiver, from: sender, 
					chatId: newChat._id, isRead: false, date: new Date(), 
					message: data.message});
					newMessage.saveMessage(function(err, newMsg){
						if (err){
							return callback("error", {error: err});
						} else {
							callback("success", {message: "success", chatId: chatId});
							if (receiverSocket != null){
								receiverSocket.emit("newMessage", {from: sender, message: data.message, chatId: chatId});
							}
						}
					});
				});
			}
		}
	});
}

var webSocket = {
	initializeWebSocket: function(server){
		initialize(server);
	},

	sendNewOffers: function(myId, otherUser, matchId, newOffers){
		var otherUserSocket = userIdToSocket[otherUser];
		if (otherUserSocket == null){
			return;
		}

		otherUserSocket.emit("newOffers", {from: myId, matchId: matchId, newOffers: newOffers});
	}
}


module.exports = webSocket;