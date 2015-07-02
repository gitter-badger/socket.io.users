"use strict";
var users = require('socket.io.users').Users;
var factory = require('../database/user-factory');
module.exports = function(io) {

  var rooms = [{
    name: 'global',
    users: [],
    messages: [] //auto einai mono gia to client side ( sto messages list)
  //  newMessage:'', //auto einai mono gia to client side ( sto msg input)
  }]; // name:'',users:[],//den 9a kratiounte messages prostoparwnmessages[]

  var getRoom = function(roomName) {
    for (var i = 0; i < rooms.length; i++) {
      var _room = rooms[i];
      if (_room.name === roomName) {
        return _room;
      }
    }
    return undefined;
  };

  var getUserIn = function(userStore) {
    var roomsJoinedUser = [];
    for (var i = 0; i < rooms.length; i++) {
      var _users = rooms[i].users;
      for (var j = 0; j < _users.length; j++) {
        if (_users[j].username === userStore.username) {
          roomsJoinedUser.push(rooms[i]);
          break;
        }
      }
    }
    return roomsJoinedUser;
  };

  function setUsername(user, username, fn) {
    user.set('username', factory.getUser(username).username);
    //user.join(rooms[0].name);
    //mazi tou stelnoume kai ta rooms
    joinRoom(user,{
      roomName: rooms[0].name
    }); //join to global room.
    var roomNames = [];

    for (var i = 0; i < rooms.length; i++) {
      roomNames.push(rooms[i].name);
    }

    fn({
      user: user.store,
      roomNames: roomNames,
      rooms: getUserIn(user.store)
    });

  }

  function userDisconnected(user) {
    for (var i = 1; i < rooms.length; i++) { //TO EXW 1 GIA NA MIN PERNEI TO GLOBAL ROOM

      var _users = rooms[i].users;
      if (_users) {
        for (var j = 0; j < _users.length; j++) {
          var _username = _users[j].username;
          if (_username === user.store.username) {
            leaveRoom(user, {
              roomName: rooms[i].name
            });
            //oxi gt borei na ksanabei.factory.removeUser(_username);
            break;
          }
        }
      }
    }
  }

  function sendMessage(user, data, fn) {
    var sender = user.store;
    var messageSent = {
      roomName: data.roomName,
      sender: sender,
      content: data.message,
      time: new Date().toISOString()
    };
    user.to(data.roomName).emit('receive message', messageSent); //se olous sto room ektos apo auto edw to SOCKET
    //  console.log(user.id+ 'sending message to '+data.roomName+ ' from '+sender);

    fn(messageSent);
  }

  function joinRoom(user, data, fn) {
    var room = getRoom(data.roomName);

    if (room === undefined) {
      //diladi to kanei create to room stin ousia kai meta join.
      room = {
        name: data.roomName,
        users: [user.store],
        messages: [],
      };
      rooms.push(room);
      io.sockets.emit('room created', room);
    } else {
      //apla kanei mono join sto room.
      room.users.push(user.store);

      user.to(room.name).emit('user joined room', {
        roomName: room.name,
        user: user.store
      });
    }

    user.join(room.name);
    if (fn) {
      fn(room);
    }
  }

  function leaveRoom(user, data) {
    var room = getRoom(data.roomName);
    var userIndex = -1;

    for (var i = 0; i < room.users.length; i++) {
      if (room.users[i].username === user.store.username) {
        userIndex = i;
        break;
      }
    }

    if (userIndex !== -1) {
      room.users.splice(userIndex, 1);
      user.to(room.name).emit('user left room', {
        roomName: room.name,
        user: user.store
      });

      user.leave(room.name);

      if (room.users.length === 0) {
        //edw to room diagrafete epidi efuge kai o teleuteos user.
        var roomIndex = -1;

        for (var i = 1; i < rooms.length; i++) { //TO EXW 1 GIA NA MIN PERNEI TO GLOBAL ROOM
          if (rooms[i].name === room.name) {
            roomIndex = i;
            break;
          }
        }

        if (roomIndex !== -1) {
          rooms.splice(roomIndex, 1);
          io.sockets.emit('room removed', room);
        }
      }
    }
  }

  users.on('disconnected', userDisconnected);
  users.on('set username', setUsername);
  users.on('join room', joinRoom); //notify other = user joined room or (GLOBAL) room created.
  users.on('leave room', leaveRoom); //notify other = user left room or (GLOBAL) room removed.
  users.on("send message", sendMessage); //notify other = receive message.

};
