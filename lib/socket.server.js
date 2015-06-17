var io = require('socket.io')();
var  users = require('./socket.users');


function SocketServer(server){


    this.start =  function (){
        var self = this;
        io.listen(server);

        io.on('connection',function(socket){
            
            var user = users.get(socket);

            if(user !== undefined){
                //when user opens a new tab or new browser window.
                user.attach(socket);
                io.user=user;
            }else{

                user = users.add(socket);
                io.user = user;

                //no need anymore  self.emit('connected',io);
                users.emit('connected',io);

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
                    //no need anymore  self.emit('disconnected',io);
                    users.emit('disconnected',io);
                }

            });

        });

    };

};

module.exports = function(server){
    return new SocketServer(server);
};
