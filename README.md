# socket.io.users

This is a node js module for socket.io applications. One user per client. User means new tab, new browser window but same machine. This module finds and manages which socket is from who and visa versa. Make use of the middleware or the standalone server.

** This is my first node module, almost one week  experience with node js.  This means if you want to support this project, you are welcome! **

## Installation

```sh
$ npm install socket.io.users
```

[NPM] https://www.npmjs.com/package/socket.io.users

## Example, very basic chat between different users, also sync user's rooms to all of opened tabs or browser windows (=sockets).

### server.js
```js
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var path=require('path');
var bodyParser = require('body-parser');
var io = require('socket.io')(server);
var socketUsers = require('socket.io.users'); //IMPORTANT
var users = socketUsers.Users;

app.set('view options',{layout:false});
app.engine('html',require('ejs').renderFile);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

socketUsers.Session(app);//IMPORTANT

app.use(express.static(path.join(__dirname,'public')));

app.get('/',function(req,res){
    res.render('index.html');
});

io.use(socketUsers.Middleware());//IMPORTANT


//users.on('connected',function(user){
//    console.log('User has connected with ID: '+ user.id);
//});
//
//users.on('connection',function(user){
//    console.log('Socket ID: '+user.socket.id+' added to user with ID: '+user.id);
//});
//
//
//io.on('connection',function(socket){//this executes after connected and  connection
//    console.log('IO DEBUG: Socket '+ socket.id+ ' is ready \n'); 
//});
//
//users.on('disconnected',function(user){
//    console.log('User with ID: '+user.id+'is gone away :(');
//});

require('./lib/socket.service.chat')(io);//A custom service for this example. look how easy is to manage your code with users and socket.io.users module

server.listen(8080,function(){
    console.log('Server is running on 8080'); 
});
```
### lib/socket.service.chat.js

```js
"use strict";

var users = require('socket.io.users').Users;
var debug=true;

module.exports = function(io){

    //{room: 'room', users: ['xxx1','xxx2']};
    var conversations = [];


    var numName=1;
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
        user.store.username = 'user'+numName; // You can use user.store to store your own custom properties describes this user.
        numName++;
    });

    users.on('connection',function(user){

        var currentSocket = user.socket;
        var myConvs = getConversationsByUser(user.id);

        setTimeout(function(){
            io.to(currentSocket.id).emit('conversation push',myConvs);
            io.to(currentSocket.id).emit('set username',user.store.username);
            if(debug)
                console.log('Push '+myConvs.length+' rooms to socket id: '+currentSocket.id);
        },300);


        currentSocket.on('conversation join',function(roomName){
            //  console.log('true or false: '+ user.belong(roomName));
            if(debug)
                console.log('Conversation JOIN: ' +roomName + ' asked by '+user.id);

            var socketAlreadyJoined = user.join(roomName);
            if(!socketAlreadyJoined){
                var conversation= joinConversation(roomName,user.id);
                if(debug )
                    console.log('Conversation join added '+ conversation.room + ' with users len: '+ conversation.users.length);
                io.to(roomName).emit('conversation user added',{room: roomName,user: user.id});
            }
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

};

```
### public/index.html
```html
<html lang="el" xml:lang="el">
    <head>
        <meta charset="UTF-8"/>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta http-equiv="Content-Language" content="el" />
        <title>Socket.io.users example #1</title>
        <link rel="stylesheet" href="css/bootstrap.min.css">

    </head>
    <body>
        <div class="container">

            <div id="conversationsArea" style="width:300px;height:50px;">

            </div> <input type="text" id="joinConversationTxt" placeholder="type a room to join"/><button type="button" class="btn btn-sm btn-danger" id="joinConversationBtn" >Join</button>  <br/>
            Users inside conversations: 
            <div id="usersArea" style="width:500px;height:50px;">

            </div>
            <hr/>

            <br/>

            <div id="messagesArea" style="width:500px;height:500px;">

            </div>

            <br/>

            <input type="text" id="messageTxt" placeholder="message to send" />

            <button type="button" id="sendMessageBtn" class="btn btn-sm btn-primary">Send message</button>

        </div>


        <script src="/socket.io/socket.io.js"></script> <!-- provided by socket.io module. -->
         <script src="js/libs/jquery-2.1.4.min.js"></script>
        <script src="js/chat.js" ></script> <!-- custom script for this example -->
    </body>
</html>

```

### public/js/chat.js

```js
/* Just jquery for now - no use of angular on this example. */
var rooms = []; //or conversations


function joinConversation(room){
    rooms.push(room);

    appendConversation(room);
}

function appendConversation(room){
    $("#conversationsArea").append("<li>"+room+"</li>");
}

function appendUser(user){
    $("#usersArea").append("<li>"+user+"</li>");    
}



function appendMessage(data){
    $("#messagesArea").append("<br/>("+data.room+") <b>"+data.user+ " :</b> "+data.message); 
}

function clearConversations(){
    $("#conversationsArea").html("");   
    rooms = [];
}

function clearUsers(){
    $("#usersArea").html("");   
}


function clearMessages(){
    $("#messagesArea").html("");
}



$(document).ready(function(){
    var socket = io();

    socket.on('connect',function(){
        console.log('Connected to server.');
    });
    
    socket.on('set username',function(username){
        console.log('Your username is: '+username);
        window.alert('Your username setted by server is: 'username);

    });
    
    socket.on('conversation push',function(_conversations){
        console.log('-----GET----');
        if(_conversations.length ===0){
            clearMessages();
            clearConversations();
            clearUsers();
            console.log('clear conversations');
        }
        console.log('Received ' + _conversations.length+ ' conversations ');
        for(var i=0;i< _conversations.length;i++){
            joinConversation(_conversations[i].room);
            console.log('join to '+ _conversations[i].room);
            for(var j=0; j < _conversations[i].users.length; j++){
                appendUser(_conversations[i].users[j]);
                console.log('inside user: ' + _conversations[i].users[j]);

            }
        }
    });



    socket.on('conversation user added',function(data){
        //data = room, user  
        appendUser(data.user);
    });

    socket.on('conversation message added',function(data){
        appendMessage(data);
    });


    $("#sendMessageBtn").click(function(){
        var msg = $("#messageTxt").val();
        console.dir(rooms);
        var data = {
            room:rooms[0],
            message: msg
        };

        socket.emit('conversation message',data);
        console.log('sending message to '+data.room);
        $("#messageTxt").val("");
    });


    $("#joinConversationBtn").click(function(){
        var roomName = $("#joinConversationTxt").val();

        if(rooms.indexOf(roomName)!==-1){
            window.alert('You are already in this Room!');

        }else{
            socket.emit('conversation join', roomName);
            console.log('Emit join to: ' +roomName);

            joinConversation(roomName);
            $("#joinConversationTxt").val("");}
    });

});


```

### [GPL-3.0 Licensed](LICENSE)

[downloads-url]: https://www.npmjs.com/package/socket.io.users
