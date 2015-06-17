var EventEmitter = require("events").EventEmitter;
var util         = require("util");
var io = require('socket.io')();
var  users = require('./socket.users');

function SocketServer(server){
    EventEmitter.call(this);

    this.start =  function (){
        var self = this;
        io.listen(server);

        io.on('connection',function(socket){


            // var uid = users.takeId(socket.request);

            //   var user = users.getById(uid);
            var user = users.get(socket);

            if(user !== undefined){
                //apla anoigei allo tab o xristis
                user.sockets.push(socket);
                user.socket=socket; //to last socket
                io.user=user;
            }else{
                //                user = {uid:uid,sockets:[socket],socket:socket,ip: socket.request.connection.remoteAddress};
                //                users.push(user);

                user = users.add(socket);
                io.user = user;
                self.emit('connected',io);
                users.emit('connected',io);
                //to eixa etsi alla pisteuw me to users einai kalutera                for(var i =0; i < middlewares.length;i++){
                //                    middlewares[i].connected(io);
                //                }

            }

            users.emit('connection',io);

            socket.on('disconnect',function(){
                var index = user.sockets.indexOf(socket);
                if (index !== -1) {
                    user.sockets.splice(index, 1);
                }

                io.user = user;
                if(user.sockets.length===0){
                    users.remove(user);
                    self.emit('disconnected',io);
                    users.emit('disconnected',io);
                }

            });

        });

    };

};

util.inherits(SocketServer, EventEmitter);

module.exports = function(server){
    return new SocketServer(server);
};
