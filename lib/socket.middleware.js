"use strict";

var  users = require('./socket.users');

function SocketMiddleware(){

    return function handle(socket,next){
        var user = users.get(socket);

        if(user !== undefined){
            //when user opens a new tab or new browser window.
            user.attach(socket);
        }else{

            user = users.add(socket);

            //no need anymore  self.emit('connected',io);
            users.emit('connected',user);

        }

        users.emit('connection',user);
        
        socket.on('disconnect',function(){

            var index = user.sockets.indexOf(socket);
            if (index !== -1) {
                user.sockets.splice(index, 1);
            }

            if(user.sockets.length===0){
                users.remove(user);
                users.emit('disconnected',user);
            }

        });

        next();
    };
}


module.exports  = SocketMiddleware;