"use strict";

var users = require('./../../index').Users.of('/chat');
var debug = true;


module.exports = function() {
  var io = undefined;
  if (arguments.length > 0) {
    io = arguments[0];
  } else {
    console.error('You did not pass a parameter socket.io inside!');
    return;
  }
  //{room: 'room', users: ['xxx1','xxx2']};
  var conversations = [];


  var numName = 1;

  function getConversation(room) {
    for (var i = 0; i < conversations.length; i++) {
      if (conversations[i].room === room) {
        return conversations[i];
      }
    }
    return undefined;
  }

  function getConversationsByUser(user) {
    var convs = [];
    for (var i = 0; i < conversations.length; i++) {
      if (conversations[i].users.indexOf(user) !== -1) {

        convs.push(conversations[i]);
      }
    }
    return convs;
  }

  function joinConversation(room, user) {
    var conv = getConversation(room);
    if (conv !== undefined) {
      conv.users.push(user);
    } else {
      conv = {
        room: room,
        users: [user],
        messages: []
      };
      conversations.push(conv);
    }
    return conv;
  }

  function getUsersFrom(room) {
    var users = users.in(room);
    var userId;
    var usersId = [];
    while (userId = users.shift().id) {
      usersId.push(userId);
    }
    return usersId;
  }

  //user here means user.id, for example purpose
  function clearUserConversations(user) {
    var myConvs = getConversationsByUser(user);
    if (debug)
      console.log('leaving from ' + myConvs.length + ' room(s)');
    for (var i = 0; i < myConvs.length; i++) {
      var myConv = myConvs[i];
      for (var j = 0; j < conversations.length; j++) {
        var conv = conversations[j];

        if (conv.room === myConv.room && conv.users.indexOf(user) !== -1) {
          conversations.splice(j, 1);

        }
      }
    }
  }

  function emitAll(listenerStr, data) {
    for (var nameSpace in io.sockets.manager.namespaces) {
      io.of(nameSpace).emit(listenerStr, data);
    }
  }



  users.on('connected', function(user) {
    if (debug)
      console.log('A User (' + user.id + ') has connected.');
    user.set('username', 'user' + numName); // You can use user.store or user.set(property,value,callbackFunction) to store your own custom properties describes this user.

    numName++;
  });

  users.on('conversation join', function(user, roomName) { //first parameter is ALWAYS the user, after are any all arguments you declared on the cleint side.
    console.log('CALLED the first event for conversation join with userID: ' + user.id + ' room: ' + roomName);
  });


  users.on('connection', function(user) {
    console.log('chat service on connection');
    //console.log('%s',user);
    var currentSocket = user.socket;
    var myConvs = getConversationsByUser(user.id);

    setTimeout(function() {

      user.socket.emit('conversation push', myConvs); // io.to(currentSocket.id).emit('conversation push',myConvs);

      user.socket.emit('set username', user.get('username')); // io.to(currentSocket.id).emit('set username', user.get('username'));
      if (debug)
        console.log('Push ' + myConvs.length + ' rooms to socket id: ' + currentSocket.id);
    }, 300);


    currentSocket.on('conversation join', function(roomName) {
      //  console.log('true or false: '+ user.belong(roomName));
      if (debug)
        console.log('Conversation JOIN: ' + roomName + ' asked by ' + user.id);

      var socketAlreadyJoined = user.join(roomName);
      if (!socketAlreadyJoined) {
        var conversation = joinConversation(roomName, user.id);
        if (debug)
          console.log('Conversation join added ' + conversation.room + ' with users len: ' + conversation.users.length);

        io.to(roomName).emit('conversation user added', { //If you want to broadcast to all except this user's socket use: user.to(roomName).emit('conversation user added', {
          room: roomName,
          user: user.id
        });
      }


      user.emit('conversation added', roomName); //   io.to(user).emit('conversation added',roomName); //all sockets of this user
      /*=io.to(user.id).
        this line emits an event for all
        of this user's connected/opened sockets.
        Pushing the rooms on all opened browser tabs and
        even on different pc which user has logged in.*/

    });

    currentSocket.on('conversation message', function(data) {
      if (debug)
        console.log('Conversation MESSAGE ' + user.id + ' to ' + data.room + ': ' + data.message);
      getConversation(data.room).messages.push({
        user: user.id,
        message: data.message
      });
      io.to(data.room).emit('conversation message added', {
        room: data.room,
        message: data.message,
        user: user.id
      });
    });

  });

  users.on('disconnected', function(user) {

    //The socket.io.users module automatically leaves all rooms which all user's sockets are inside, when user disconnects ( = all sockets disconnected).
    //but here we just clean up the conversations for this specific app/example.

    clearUserConversations(user.id);

    if (debug) {
      console.log('User ' + user.id + ' has gone.');
    }


  });



};
