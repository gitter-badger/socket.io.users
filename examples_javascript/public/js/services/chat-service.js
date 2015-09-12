function ChatService($timeout, $q, $socket) {


  var service = {};

  service.me = undefined;
  service.onlineUsers = [];


  //joined rooms.
  service.rooms = [];
  // service.rooms = [{
  //   name: 'room1',
  //   messages: [],
  //   users: []
  // }];

  //all room names , joined and not joined.
  service.roomNames = [];

  service.getRoom = function (roomName) {
    console.log('exec service.getRoom');
    for (var i = 0; i < service.rooms.length; i++) {
      var _room = service.rooms[i];
      console.log("'i' room: " + _room.name + ' but searching for: ' + roomName);
      if (_room.name === roomName) {
        return _room;
      }
    }
    console.log('end exec service.getRoom');
    return undefined;
  };

  service.canJoin = function (roomName) {
    var _room = service.getRoom(roomName);
    if (_room !== undefined) {
      var _roomUsers = _room.users;
      for (var i = 0; i < _roomUsers.length; i++) {
        if (_roomUsers[i].username === service.me.username) {
          return false;
        }
      }
    }
    return true;
  };

  function userDisconnect() {
  }

  function receiveMessage(data) {
    console.log('message received: ' + data.content);
    //isws edw xreiastei to $timeout(function(){...}); *
    service.getRoom(data.roomName).messages.push({
      roomName: data.roomName,
      sender: data.sender,
      content: data.content,
      time: data.time
    });


  }

  function roomCreated(room) {
    //roomData = creator: username,roomName: ''
    service.roomNames.push(room.name);
    console.log('Room ' + room.name + ' just created by ' + room.users[0].username);
  }

  function roomRemoved(room) {
    var roomIndex = service.roomNames.indexOf(room.name);
    if (roomIndex !== -1) {
      service.roomNames.splice(roomIndex, 1);
    }
  }

  function userJoinedRoom(joinedData) {
    console.log("start userJoinedRoom: ", joinedData);
    var room = service.getRoom(joinedData.roomName);
    if (room !== undefined) {
      room.users.push(joinedData.user);

      console.log('A user with username ' + joinedData.user.username + ' joined to ' + joinedData.roomName);
    } else {
      console.log('something goes wrong here...on chat-service.js.userJoinedRoom');
    }

  }

  function userLeftRoom(leftData) {
    var room = service.getRoom(leftData.roomName);
    var userIndex = -1;
    for (var i = 0; i < room.users.length; i++) {
      if (room.users[i].username === leftData.user.username) {
        userIndex = i;
        break;
      }
    }
    if (userIndex !== -1) {
      room.users.splice(userIndex, 1);
      if (room.users.length === 0) {
        /*an autos pou efuge itan o teleuteos xristis tote diagrafoume to room.
        [auto proteimw na to kanw mono otan feugei allos xristis, etsi wste na borei o creator diladi to 'me' na vlepei
        poia rooms dimiourgise prosfata kai an patisei join na ksanadimiourgounte ( ston server to kanw remove to room kai tou creator )]
        */
        var roomIndex = -1;
        for (var i = 0; i < service.rooms.length; i++) {
          if (service.rooms[i].name === room.name) {
            roomIndex = i;
            break;
          }
        }

        if (roomIndex !== -1) {
          service.rooms.splice(roomIndex, 1);
          var roomNameIndex = service.roomNames.indexOf(room.name);
          if (roomNameIndex !== -1) {
            service.roomNames.splice(roomNameIndex, 1);
          }
        }
      }
    }
    //console.log('A user with username ' + leftData.user.username + ' left from ' + leftData.roomName);
  }

  service.initSocketEvents = function () {
    $socket.on('disconnect', userDisconnect);
    $socket.on('receive message', receiveMessage);
    $socket.on('room created', roomCreated);
    $socket.on('room removed', roomRemoved);
    $socket.on('user joined room', userJoinedRoom);
    $socket.on('user left room', userLeftRoom);

  };

  service.connect = function () {
    var deferred = $q.defer();
    $socket.connect().then(function () {
      service.initSocketEvents();
      deferred.resolve();
    });

    return deferred.promise;
  };

  service.sendMessage = function (roomName, msg) {
    var deferred = $q.defer();
    $socket.emit('send message', {
      roomName: roomName,
      message: msg
    }, function (newMsg) {
      if (newMsg) {
        console.dir(service.getRoom(roomName));
        service.getRoom(roomName).messages.push(newMsg);
        deferred.resolve(newMsg);
      } else {
        deferred.reject('Message could not be sent!');
      }

    });
    return deferred.promise;
  };

  service.joinRoom = function (roomName) {
    var deferred = $q.defer();

    $socket.emit('join room', {
      roomName: roomName
    },
      function (theRoom) {
        if (theRoom) {
          //service.getRoom(roomName).users.push(me);
          service.rooms.push(theRoom);
          console.log("chat-service.js.joinRoom: " + theRoom);
          deferred.resolve(theRoom);
        } else {
          console.log("chat-service.js.joinRoom: ERROR", theRoom);
          deferred.reject('Cannot join the room!');
        }
      });
    return deferred.promise;
  };

  service.leaveRoom = function (roomName) {
    $socket.emit('leave room', {
      roomName: roomName
    });
    //user: me den xreiazete giati kaleite mesw tou server gia asfaleia.
    userLeftRoom({
      roomName: roomName,
      user: me
    });
  };

  return service;
}

angular.module('textme').factory('ChatService', ['$timeout', '$q', '$socket', ChatService]);
