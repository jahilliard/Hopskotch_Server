var Chat = require("../models/Chat.js");
var User = require("../models/User.js");
var helper = require("../helpers/helper.js");
var _ = require('lodash');
var Socket = require('../ws/ws.js');

//used to specify what fields of the model a client cannot update
function validateFields(fields, req, res){
  return 0;
}

var ChatController = {
 
  getAll: function(req, res) {
    Chat.getAll(function(err, chats){
      if(err){
        res.status(404);
        res.json({"errcode": err.code, "message": err.errmsg});
      } else {
        res.status(200);
        res.json({"message": "success", "chats": chats});
      }
    });
  },
 
  getById: function(req, res) {
    Chat.getById(req.params.id, function(err, chat){
      if(err){
        res.status(404);
        res.json({"errcode": err.code, "message": err.errmsg});
      } else {
        res.status(200);
        res.json({"message": "success", "chat": chat});
      }
    });
  },

  //test function
  fillInLastMsgNumber: function(userId, chatResults, i, callback){
    if (i == chatResults.length){
      callback(null);
      return;
    } else {
      Chat.getById(chatResults[i].chatId, function(err, chat){
        if (err) {
          callback(err);
          return;
        } 

        User.getById(chatResults[i].chatee, function(err, user){
          if (err) {
            callback(err);
            return;
          }

          if (userId == chat.user1){
            chatResults[i].lastMsgNum = chat.user1LastMsgNumber;
          } else {
            chatResults[i].lastMsgNum = chat.user2LastMsgNumber;
          }

          console.log("HEREEE");
          console.log(chatResults[i]);
          chatResults[i]["chatee"] = user;
          ChatController.fillInLastMsgNumber(userId, chatResults, i+1, callback);
        });

      });
    }
  },

  //end test function
  getLatestChats: function(req, res){
    Chat.getLatestChats(req.body.id, function(err, chatResults) {
      if (err){
        res.status(404);
        res.json({"errcode": err.code, "message": err.errmsg});
      } else {
        console.log("RESULTS");
        console.log(chatResults);
        //START TEST
        var self = this;
        ChatController.fillInLastMsgNumber(req.body.id, chatResults, 0, function(err){
          if (err) {
            res.status(404);
            res.json({"errcode": err.code, "message": err.errmsg});
            return;
          }

          /*var filteredMemberIds  = _.map(chatResults, function(chat){return chat.chatee._id;});
          UserController.addMatches(req.body.id, filteredMemberIds, chatResults, function(err, result) {
            console.log(results);
            res.json({"message": "success", "chats": result});
          }*/
          
          res.json({"message": "success", "chats": chatResults});
        });
        //END TEST

        //res.json({"message": "success", "chats": chatResults});
      }
    });
  },

  getUnreadChatMessages: function(req, res){
    Chat.getChat(req.params.id, req.params.chatee, function(err, foundChat){
      if (err){
        res.status(404);
        res.json({"errcode": err.code, "message": err.errmsg});
        return;
      } 

      if (!foundChat){
        res.status(404);
        res.json({"errcode": 400, "message": "No such chat exists"});
        return;
      }

      else {
        foundChat.getUnreadMessages(req.body.id, function(err, messages){
          if (err){
            res.status(404);
            res.json({"errcode": err.code, "message": err.errmsg});
          } else {
            /*var messageIds = [];
            //mark all the chat messages as read
            for(var i = 0; i < messages.length; i++){
              messageIds.push(messages[i]._id);
            }

            Chat.markRead(messageIds, function(err, updateInfo){
              if (err){
                console.log(err);
              }
            });*/
            res.status(200);
            res.json({"message": "success", "chatMessages": messages});
          }
        });
      }
    });
  },

  setRead: function(req, res){
    if (helper.verifyBody(req, res, ['messageIds'])) {
      return;
    }

    var messageIds = req.body.messageIds;
    Chat.markRead(messageIds, function(err, updateInfo){
      if (err){
        res.status(404);
        res.json({"errcode": err.code, "message": err.errmsg});
      } else {
        res.status(200);
        res.json({"message": "success"});
      }
    });
  }


  //each chat has "otherUser" field designating which userId the offers are for
  /*addChates: function(req, res) {
    if (helper.verifyBody(req, res, ['newChates'])) {
      return;
    }

    var newChates = req.body.newChates;

    for (int i = 0; i < newChates.length; i++){
      var singleChat = newChates[i];
      var otherUser =  singleChat.otherUser;
      var user = singleChat.user;
      var criteria = {};
      criteria.otherUser = otherUser;
      criteria.user = user;

      Chat.getChatByCriteria(criteria, function(err, foundChat) {
        if (err){
          res.status(404);
          res.json({
            "message": err.message
          });
          return;
        } 

        if (!foundChat){
          //create new chat object
          var newChat = new Chat();
          newChat.userId1 = user;
          newChat.userId2 = otherUser;
          newChat.user1Offers = singleChat.offers;
          newChat.saveChat(function(err, newChat){
            if (err){
              res.status(404);
              return res.json({
                "message": err.message
              });
            } else {
              res.status(200);
              return res.json({
                "message": "success"
              })
            }
          });
        } else {
          var currentOffers = null;
          if (foundChat.userId1 == user){
            currentOffers = foundChat.user1Offers;
          } else {
            currentOffers = foundChat.user2Offers;
          }

          //see if there is any new offers
          if(_.difference(offers, currentOffers).length > 0){
            if (foundChat.userId1 == user){
              foundChat.user1Offers = offers;
            } else {
              foundChat.user2Offers = offers;
            }
            foundChat.saveChat(function(err, savedChat){
              if (err){
                res.status(404);
                return res.json({
                  "message": err.message
                });
              } else {
                //notify people of new offers
                res.status(200);
                return res.json({
                  "message": "success"
                })
              }
            })
          }
        }
      });
    }
  },

  removeChates: function(req, res) {
    if (helper.verifyBody(req, res, ['deleteChates'])) {
      return;
    }

    Chat.getById(req.params.id, function(err, targetChat) {
        if (err){
          res.status(404);
          res.json({
            "message": err.message
          });
          return;
        } 

        if (!targetChat){
          res.status(404);
          res.json({
            "message": "Establishment with this id does not exist"
          });
          return;
        }

        var deleteChates = req.body.deleteChates;
        var currentChates = targetChat.get("chatList");
        var newChatList = _.filter(currentChates, function(chat)
          {
            return !(_.includes(deleteChates, chat.userId));
          });

        targetChat.updateChat({"chatList": newChatList});
        targetChat.saveChat(function(err, updatedChates) {
          if (err){
            res.status(404);
            res.json({
              "message": err.message
            });
          } else {
            res.status(200);
            res.json({
              "message": "success"
            });
          }
        });
    });
  }*/
};
 
module.exports = ChatController;