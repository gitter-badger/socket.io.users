var SocketUser = function(){
    this.id=undefined;
    this.socket=undefined; //last / current socket of this user
    this.sockets=[];
    this.rooms=[];
    this.ip=undefined;
};

//sync, when user OR socket is connected and/or added to the users list  
SocketUser.prototype.attach = function(socket){
    this.socket=socket;
    this.sockets.push(socket);
    this.socket.join(this.id);

    if(this.rooms.length>1){
        for(var i =0; i < this.rooms.length;i++){
            this.socket.join(this.rooms[i]);
        }
    }
};

SocketUser.prototype.detach = function(){
    this.leaveAll();  
};

SocketUser.prototype.join = function(room){
    if(this.rooms.indexOf(room) !== -1){
        this.socket.join(room);
    }else{
        for(var i=0; i < this.sockets.length;i++){
            this.sockets[i].join(room);   
        }
        this.rooms.push(room);
    }
};

SocketUser.prototype.leave = function(room){
    if(this.rooms.indexOf(room) !== -1){
        for(var i=0; i < this.sockets.length;i++){
            this.sockets[i].leave(room);   
        }
        this.rooms.splice(room,1);
    }
};

SocketUser.prototype.leaveAll = function(){
    if(this.rooms.length>0){
        for(var i =0; i < this.rooms.length;i++){
            this.leave(this.rooms[i]);
        }
    }
};

module.exports = SocketUser;