"use strict";

var SocketUser = function() {
  this.id = undefined;
  this.socket = undefined; //last added socket / or the current user's socket who (if) emits an event
  this.sockets = [];
  this.rooms = [];
  this.ip = undefined; //last machine's ip which user has connected to.
  this.remoteAddresses = [];
  this.store = {};
};


//sync, when user OR socket is connected and/or added to the users list
SocketUser.prototype.attach = function(socket) {
  //we could use socket.rooms I know it exists but I am sure I will need user's rooms later on...
  this.socket = socket;

  this.ip = this.socket.client.request.headers['x-forwarded-for'] || this.socket.client.conn.remoteAddress || this.socket.conn.remoteAddress || this.socket.request.connection.remoteAddress;
  // if(this.ip.indexOf(':')===0){
  //   //means IPV6
  //   this.ip = this.ip.substring(7); //::ffff
  //auto einai gia na to kanw IPV4 alla isws 9eloun ipv6 oi developers giauto to afeinw .
  // }
  //this.ip = this.socket.request.connection.remoteAddress;
  if (this.remoteAddresses.indexOf(this.ip) === -1) {
    //means that the user has connectly FROM DIFFERENT MACHINE BUT IT IS THE SAME USER BECAUSE OF GET NOW CAN WORKS WITH io _query.id.
    this.remoteAddresses.push(this.ip);

  }

  this.sockets.push(socket);
  this.socket.join(this.id);
  if (this.rooms.length > 0) {
    for (var i = 0; i < this.rooms.length; i++) {
      this.socket.join(this.rooms[i]);
    }
  }
};

SocketUser.prototype.detachSocket = function(socket) {
  for (var i = 0; i < this.sockets.length; i++) {
    if (this.sockets[i].id === socket.id) {
      this.sockets.splice(i, 1);
      break;
    }
  }
};

SocketUser.prototype.detach = function() {
  this.leaveAll();
};

SocketUser.prototype.join = function(room) {
  var socketAlreadyInRoom = this.socket.rooms.indexOf(room) !== -1;

  if (this.rooms.indexOf(room) !== -1) {
    if (!socketAlreadyInRoom) {
      this.socket.join(room);
    }
  } else {
    for (var i = 0; i < this.sockets.length; i++) {
      this.sockets[i].join(room);
    }
    this.rooms.push(room);
  }

  return socketAlreadyInRoom; //just return true/false if socket was already inside this room, no error happens.  This is only for this socket, maybe I have problem if some1 try sync from socket to other socket but in the same user, if then I will fix it when the time arrives.
};

SocketUser.prototype.leave = function(room) {
  var index = this.rooms.indexOf(room);

  if (index !== -1) {
    this.rooms.splice(index, 1);

    for (var i = 0; i < this.sockets.length; i++) {
      this.sockets[i].leave(room);
    }

  }
};

SocketUser.prototype.leaveAll = function() {
  if (this.rooms.length > 0) {
    for (var i = 0; i < this.rooms.length; i++) {
      this.leave(this.rooms[i]);

    }
  }
};

SocketUser.prototype.belong = SocketUser.prototype.in = function() {
  var len = arguments.length;
  var ok = 0;
  for (var i = 0; i < arguments.length; i++) {

    if (this.rooms.indexOf(arguments[i]) !== -1) {
      ok++
    }
    if (ok == len) {
      return true;
    }
  }
  return false;
};

SocketUser.prototype.set = function() { //property,value,callback(callback is unnessecary for now)
  var len = arguments.length;
  if (len >= 2) {
    this.store[arguments[0]] = arguments[1];
    if (len === 3) {
      arguments[2]();
    }
  }
};

SocketUser.prototype.get = function(property) {
  if (this.store.hasOwnProperty(property)) {
    return this.store[property];
  } else {
    return undefined;
  }
};

SocketUser.prototype.toString = function() {
  return this.id;
};

SocketUser.prototype.emit = function() {
  //this is async way as far I know.
  var args = Array.prototype.slice.call(arguments);
  this.sockets.forEach(function(_socket) {
    _socket.emit.apply(_socket, args);
  });

};


SocketUser.prototype.to = function(name) {
  this.socket._rooms = this.socket._rooms || [];
  if (!~this.socket._rooms.indexOf(name)) this.socket._rooms.push(name);
  return this.socket; //this happens because of THIS socket.emit. this function sends to all sockets inside this room data EXCEPT THIS.SOCKET.ID (look on socket.io.socket.js on emit = ).
};


module.exports = SocketUser;
