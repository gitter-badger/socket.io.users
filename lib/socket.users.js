"use strict";

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var SocketUser = require('./socket.user');
var namespaces = require('./socket.namespaces');


var SocketUsers = function() {

    if(this.namespace === undefined || this.namespace===''){
        namespaces.attach('/',this);
    }

    EventEmitter.call(this);
    this.users = []; // SocketUser array list. Each namespace has IT's OWN users object list, but the Id of a user of any other namespace may has the same value if request comes from the same client-machine-user. This makes easy to keep a kind of synchronization between all users of all different namespaces.  

};

util.inherits(SocketUsers, EventEmitter);

SocketUsers.prototype.of = function (){

    var ns = arguments.length>0 ?  arguments[0] : '/';
    var socketUsers = namespaces.get(ns);
    if(socketUsers==undefined){
        //console.log('Initialize new socketusers with ns : ' +ns);
        socketUsers= new SocketUsers(ns);
        namespaces.attach(ns,socketUsers);
    }
    return socketUsers;

};

SocketUsers.prototype.takeId= function(request){

    if(request._query !== undefined && request._query !=='' && request._query.id !==undefined){
        return  request._query.id;
    }else{
        return request.headers.cookie.substr(request.headers.cookie.indexOf('sid=')+4);
    }
};

SocketUsers.prototype.create = function(socket){
    var _user = new SocketUser();
    _user.id = this.takeId(socket.request);
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

SocketUsers.prototype.remove = function(user){
    user.detach();

    for(var i =0 ; i < this.users.length; i++){
        if(this.users[i].id === user.id) {
            this.users.splice(i,1);
        
            break;
        }
    } 

};

SocketUsers.prototype.room = SocketUsers.prototype.in = SocketUsers.prototype.from = function(room){
    var _usersConnectedToRoom = [];
    for(var i=0;i< this.users.length;i ++){
        var _user = this.users[i];

        if(_user.rooms.indexOf(room) !==-1){
            _usersConnectedToRoom.push(_user);
        }
    }
    return _usersConnectedToRoom;
};

//We call this when we are doing manual update to a user object, example:
// users.on('update',function(user) { console.log (' A user with id: '+ user.id +' has been updated from code');});
// var user= users.get('userid123456'); user.store.anyproperty='aproperty'; users.update(user);

SocketUsers.prototype.update  = function (user){
    this.emit('update',user);
};



module.exports = new SocketUsers();

