var SocketUser = function(){

    this.id=undefined;
    this.socket=undefined; //last / current socket of this user
    this.sockets=[];
    this.rooms=[];
    this.ip=undefined;





};

//sync, when user is connected and added to the users list
SocketUser.prototype.attach = function(){
    if(this.rooms.length>0){
        for(var i =0; i < this.rooms.length;i++){
            this.socket.join(this.rooms[i]);
            //or this.join(this.rooms[i]);
        }
    }
};

//when user has disconnected and removed from users list
SocketUser.prototype.detach = function(){
    if(this.rooms.length>0){
        for(var i =0; i < this.rooms.length;i++){
            this.leave(this.rooms[i]);
        }
    }
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

module.exports = SocketUser;