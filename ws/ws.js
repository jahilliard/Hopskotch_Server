var AuthController = require("../controllers/AuthController.js");
var Chat = require("../models/Chat.js");
var Message = require("../models/Message.js");
var socketIdToUserId = {};
var userIdToSocket = {};
var _ = require('lodash');

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
				console.log("ERROR VALIDATING");
				next(new Error(errString));
				return;
			}

			console.log("VALIDATED")
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

	//test function
	socket.on('lastMsgNumber', function(data, callback){
		var sender = socketIdToUserId[socket.id];
		var receiver = data.receiver;
		lastMsgNumber = -1;
		Chat.getChat(sender, receiver, function(err, doc){
			if (doc){
				if (doc.user1 == sender){
					lastMsgNumber = doc.user1LastMsgNumber;
				} else {
					lastMsgNumber = doc.user2LastMsgNumber;
				}
			} 

			callback({"lastMsgNumber": lastMsgNumber});
		});
	});

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
	var messageNumber = data.messageNumber;
	//TODO: check if in same circle
	console.log("PROCESSING CHAT");

	//check out if this message has been recieved before
	Message.getByMessageNumber(messageNumber, sender, receiver, function(err, foundDoc){
		if (foundDoc){
			//message has been sent before, just send confirmation and return
			callback("success", {sentMessage: foundDoc});
			return;
		}

		Chat.getChat(sender, receiver, function(err, doc){
			if (err){
				return callback("error", {error: err});
			} else {
				if (doc){
					var chatId = doc._id;
					var newMessage = new Message({to: receiver, from: sender, 
						chatId: chatId, isRead: false, date: new Date(), 
						message: data.message, messageNumber: messageNumber});

					//start of testing
					if (sender == doc.user1){
						doc.user1LastMsgNumber = messageNumber;
					} else {
						doc.user2LastMsgNumber = messageNumber;
					}
					doc.saveChat(function(err, chat){});
					//end of testing

					newMessage.saveMessage(function(err, newMsg){
						if (err){
							return callback("error", {error: err});
						} else {
							callback("success", {sentMessage: newMsg});
							if (receiverSocket != null){
								receiverSocket.emit("newMessage", {message: newMsg});
							}
						}
					});
				} else {
					//create new chat
					var newChat = new Chat({user1: sender, user2: receiver});
					newChat.saveChat(function(err, newChat){
						var newMessage = new Message({to: receiver, from: sender, 
						chatId: newChat._id, isRead: false, date: new Date(), 
						message: data.message, messageNumber: messageNumber});

						//start of testing
						if (sender == newChat.user1){
							newChat.user1LastMsgNumber = messageNumber;
						} else {
							newChat.user2LastMsgNumber = messageNumber;
						}
						newChat.saveChat(function(err, chat){});
						//end of testing

						newMessage.saveMessage(function(err, newMsg){
							if (err){
								return callback("error", {error: err});
							} else {
	console.log("MESSAGE SAVED");
								callback("success", {sentMessage: newMsg});
								if (receiverSocket != null){
	console.log("EMITTING MESAGE");
								receiverSocket.emit("newMessage", {message: newMsg});
								}
							}
						});
					});
				}
			}
		});
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

		console.log("emitting");
		otherUserSocket.emit("newOffers", {from: myId, matchId: matchId, newOffers: newOffers});
	},

	notifyUsersNewCircleMember: function(oldUserIds, newMember) {
		//add lastMsgNumber to object
		var newMemberId = newMember._id.toString();

    Chat.getChatsForUser(newMemberId, oldUserIds, function(err, chats) {
      if (err) {
        console.log(err);
        return;
      }

       //add chatNumber 
      addedChatResult = _.map(oldUserIds, function(oldMemberId){
        chat = _.find(chats, function(c) { return (c.user1 == oldMemberId) || (c.user2 == oldMemberId) });
        newMember = newMember.toObject();
        newMember.lastMsgNum = 0;
        if (chat) {
          if (chat.user1 == oldMemberId) {
            newMember.lastMsgNum = chat.user1LastMsgNumber;
          } else {
            newMember.lastMsgNum = chat.user2LastMsgNumber;
          }
        }

        if (oldMemberId in userIdToSocket) {
					userIdToSocket[oldMemberId].emit("newCircleMember", {"newMember": newMember});
				}

        return newMember;
      });
		});
	},

	notifyUsersCircleMemberLeave: function(users, oldMember) {
		users.map(function(user){
			if (user._id in userIdToSocket) {
				console.log("MEMBER LEAVING");
				userIdToSocket[user._id].emit("circleMemberLeave", {"oldMember": oldMember});
			}
		})
	},

}

module.exports = webSocket;