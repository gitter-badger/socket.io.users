"use strict";

var users = require('./../../index').Users;
var debug=true;

module.exports = function(io){

    //{room: 'room', users: ['xxx1','xxx2']};
    var conversations = [];


    function getConversation(room){
        for(var i=0; i<conversations.length;i++){
            if(conversations[i].room === room){
                return conversations[i];   
            }
        }
        return undefined;
    }

    function getConversationsByUser(user){
        var convs = [] ;
        for(var i=0; i<conversations.length;i++){
            if(conversations[i].users.indexOf(user) !==-1){

                convs.push(conversations[i]);   
            }
        }
        return convs;
    }

    function joinConversation(room,user){
        var conv = getConversation(room);
        if(conv!==undefined){
            conv.users.push(user);   
        }else{
            conv = {room:room,users:[user]};
            conversations.push(conv);
        }
        return conv;
    }

    function getUsersFrom(room){
        var users = users.in(room);   
        var userId;
        var usersId = [];
        while(userId = users.shift().id){
            usersId.push(userId);
        }
        return usersId;
    }
    //user here means user.id, for example purpose
    function clearUserConversations(user){
        var myConvs = getConversationsByUser(user);
        if(debug)
            console.log('leaving from ' +myConvs.length + ' room(s)');
        for(var i =0; i<myConvs.length;i++){
            var myConv = myConvs[i];
            for(var j=0;j<conversations.length;j++){
                var conv = conversations[j];
                if(conv.room === myConv.room &&  conv.users.indexOf(user.id) !==-1){
                    conversations.splice(j,1);  

                }
            }
        }
    }

    users.on('connected',function(user){
        if(debug)
            console.log('A User ('+ user.id+') has connected.');
    });

    users.on('connection',function(user){

        var currentSocket = user.socket;
        var myConvs = getConversationsByUser(user.id);

        setTimeout(function(){
            io.to(currentSocket.id).emit('conversation push',myConvs);
            if(debug)
                console.log('Push '+myConvs.length+' rooms to socket id: '+currentSocket.id);
        },300);


        currentSocket.on('conversation join',function(roomName){
            if(debug)
                console.log('Conversation JOIN: ' +roomName + ' asked by '+user.id);

            user.join(roomName);
            var conversation= joinConversation(roomName,user.id);
            if(debug)
                console.log('Conversation join added '+ conversation.room + ' with users len: '+ conversation.users.length);
            io.to(roomName).emit('conversation user added',{room: roomName,user: user.id});
        });

        currentSocket.on('conversation message',function(data){
            if(debug)
                console.log('Conversation MESSAGE '+ user.id + ' to '+data.room +': '+ data.message);

            io.to(data.room).emit('conversation message added',{room:data.room,message:data.message,user:user.id});
        });

    });

    users.on('disconnected',function(user){
      
        //The socket.io.users module automatically leaves all rooms which all user's sockets are inside, when user disconnects ( = all sockets disconnected).  
        //but here we just clean up the conversations for this specific app/example.
        clearUserConversations(user.id);

        if(debug){
            console.log('User '+ user.id+' has gone.');
        }


    });




};