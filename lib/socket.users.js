var EventEmitter = require('events').EventEmitter;
var util = require('util');
var SocketUser = require('./socket.user');


var SocketUsers = function() {
    EventEmitter.call(this);
    this.users = []; // SocketUser array list.
};

util.inherits(SocketUsers, EventEmitter);

SocketUsers.prototype.takeId= function(request){
    return request.headers.cookie.substr(request.headers.cookie.indexOf('sid=')+4);
};

SocketUsers.prototype.create = function(socket){
    var _user = new SocketUser();
    _user.id = this.takeId(socket.request);
    _user.ip = socket.request.connection.remoteAddress;
    _user.attach(socket);
    return _user;
};

SocketUsers.prototype.getById = function(id){
    for(var i =0 ; i < this.users.length; i++){
        if(this.users[i].id === id){
            return this.users[i];
            break;
        }
    }
    return undefined;
};

//get by socket.
SocketUsers.prototype.get = function(socket){
    return this.getById(this.takeId(socket.request));
};

SocketUsers.prototype.list = function(){
    return this.users;  
};

SocketUsers.prototype.size = function(){
    return this.users.length;
};

SocketUsers.prototype.push = function(user){
    this.users.push(user);
};

SocketUsers.prototype.add = function(socket){
    var _user = this.create(socket);
    this.push(_user);   
    return _user;
};

SocketUsers.prototype.indexOf = function(obj){
    return this.users.indexOf(obj);  
};

SocketUsers.prototype.remove =  function(user){
    user.detach();
    this.users.splice(this.indexOf(user),1);
};



module.exports = new SocketUsers();
