var EventEmitter = require('events').EventEmitter;
var util = require('util');

var SocketUser = function(){

    var id=undefined,
        socket=undefined,
        sockets=[],
        ip=undefined;

};

var SocketUsers = function() {
    EventEmitter.call(this);
    this.users = []; // array apo to SocketUser,

    //    //   client: {
    //    events:['connected','disconnected','connection'],
    //    listeners:[], //to callback kai to event name pou einai kataxwrimena 
    //    on: function(eventName,callbackListener){
    //        if( this.events.indexOf(eventName) !==-1){
    //            this.listeners.push({event:eventName,callback:callbackListener});
    //        }
    //    },
    //    emit: function(eventName,args){
    //        //        if (typeof variable !== 'undefined') {
    //        for(var i =0; i < this.listeners.length; i++){
    //            var listener = this.listeners[i];
    //            if(listener.event === eventName){
    //                listener.callback(args);   
    //            }
    //        }
    //    }
    //  }


};

util.inherits(SocketUsers, EventEmitter);

SocketUsers.prototype.takeId= function(request){
    return request.headers.cookie.substr(request.headers.cookie.indexOf('sid=')+4);
};

SocketUsers.prototype.create = function(socket){
    var _user = new SocketUser();
    _user.id = this.takeId(socket.request);
    _user.socket  = socket;
    _user.sockets= [socket];
    _user.ip = socket.request.connection.remoteAddress;

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

SocketUsers.prototype.size =  function(){
    return this.users.length;
};

SocketUsers.prototype.push=  function(user){
    this.users.push(user);  
};

SocketUsers.prototype.add = function(socket){
    var _user = this.create(socket);
    this.push(_user);   
    return _user;
};

SocketUsers.prototype.indexOf= function(obj){
    return this.users.indexOf(obj);  
};

SocketUsers.prototype.remove =  function(user){
    this.users.splice(this.indexOf(user),1);
};




module.exports = new SocketUsers();
