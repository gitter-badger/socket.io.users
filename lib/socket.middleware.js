"use strict";

var  socketIoUsers = require('./socket.users');

function SocketMiddleware(){
    //  var namespaces=  users.namespaces; if we do that, the io.use must go after users.register() setted

    //    function call(evt,args){
    //        for(var i= 0; i < namespaces.length;i++){
    //            var index = namespaces[i].on.indexOf(evt);
    //            if(index !==-1){
    //                namespaces[i].obj[namespaces[i].on[index]](args);
    //            }
    //        }
    //    }

    return function handle(socket,next){
        var users = socketIoUsers.of(socket.nsp.name);
        var user = users.get(socket);


        if(user !== undefined){
            //when user opens a new tab or new browser window.
            
            user.attach(socket);
        }else{

            user = users.add(socket);

            users.emit('connected',user);
            //   call('connected',user);

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