"use strict";

var SocketUser = function(){
    this.id=undefined;
    this.socket=undefined; //last / current socket of this user
    this.sockets=[];
    this.rooms=[];
    this.ip=undefined;
    this.store={};
};

//sync, when user OR socket is connected and/or added to the users list  
SocketUser.prototype.attach = function(socket){
    //we could use socket.rooms I know it exists but I am sure I will need user's rooms later on...
    this.socket=socket;
    this.sockets.push(socket);
    this.socket.join(this.id);

    if(this.rooms.length>0){
        for(var i =0; i < this.rooms.length;i++){
            this.socket.join(this.rooms[i]);
        }
    }
};

SocketUser.prototype.detach = function(){
    this.leaveAll();  
};

SocketUser.prototype.join = function(room){
    var socketAlreadyInRoom = this.socket.rooms.indexOf(room) !==-1;

    if(this.rooms.indexOf(room) !== -1){
        if(!socketAlreadyInRoom){
            this.socket.join(room);
        }
    }else{
        for(var i=0; i < this.sockets.length;i++){
            this.sockets[i].join(room);   
        }
        this.rooms.push(room);
    }

    return socketAlreadyInRoom; //just return true/false if socket was already inside this room, no error happens.  This is only for this socket, maybe I have problem if some1 try sync from socket to other socket but in the same user, if then I will fix it when the time arrives.
};

SocketUser.prototype.leave = function(room){
    var index = this.rooms.indexOf(room)
    if( index!== -1){
        for(var i=0; i < this.sockets.length;i++){
            this.sockets[i].leave(room);   
        }
        this.rooms.splice(index,1);
    }
};

SocketUser.prototype.leaveAll = function(){
    if(this.rooms.length>0){
        for(var i =0; i < this.rooms.length;i++){
            this.leave(this.rooms[i]);
        }
    }
};

SocketUser.prototype.belong = SocketUser.prototype.in = function(){
    var len = arguments.length;
    var ok=0;
    for(var i =0;i<arguments.length; i++){

        if(this.rooms.indexOf(arguments[i]) !==-1 ){
            ok++
        }
        if(ok==len){
            return true;   
        }
    }
    return false;
};

module.exports = SocketUser;