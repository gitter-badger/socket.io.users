# socket.io.users

This is a node js module for socket.io applications. This module finds and manages which socket is from who and visa versa.
One user per person. User means: Unlimited (new) browser tabs/windows but same machine. OR client can pass custom authorized id and have one user with it's sockets per group of different machines.
Make use of the middleware or the standalone server.

## Installation

```sh
$ npm install socket.io.users
```

[NPM] https://www.npmjs.com/package/socket.io.users

## Usage

```js
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var socketUsers = require('socket.io.users');

socketUsers.Session(app);//IMPORTANT

var rootIo = require('socket.io')(server); //default '/' as namespace.
var chatIo = rootIo.of('/chat');


var rootUsers = socketUsers.Users; /* default '/' as namespace. Each namespace has IT's OWN users object list, 
but the Id of a user of any other namespace may has the same value if request comes from the same client-machine-user.
This makes easy to keep a kind of synchronization between all users of all different namespaces. */

var chatUsers = socketUsers.Users.of('/chat'); // 


rootIo.use(socketUsers.Middleware());//IMPORTANT but no errors if you want to skip it for a io.of(namespace) that you don't want the socket.io.users' support. 

chatUsers.use(socketUsers.Middleware());

chatUsers.on('connected',function(user){
    console.log(user.id + ' has connected to the CHAT');
    user.store.username = 'username setted by server side'; //at the store property you can store any type of properties and objects you want to share between your user's sockets. 
    user.socket.on('any event', function(data){ //user.socket is the current socket, to get all connected sockets from this user, use: user.sockets 
    
    });
    chatIo.emit('set username',user.store.username);
});

rootUsers.on('connected',function(user){
    console.log('User has connected with ID: '+ user.id);
});



rootUsers.on('connection',function(user){
    console.log('Socket ID: '+user.socket.id+' is user with ID: '+user.id);
});

rootUsers.on('disconnected',function(user){
    console.log('User with ID: '+user.id+'is gone away :(');
});



//You can still use the io.on events, but the execution is after connected and connection of the 'users' and 'chatUsers', no matter the order.
rootIo.on('connection',function(socket){
    console.log('IO DEBUG: Socket '+ socket.id+ ' is ready \n'); 
});


```


## Example, very basic chat between different users, also sync user's rooms and messages to all of opened tabs or browser windows (=sockets).

### server.js
```js
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var path=require('path');
var bodyParser = require('body-parser');
var io = require('socket.io')(server);
var socketUsers = require('socket.io.users'); //IMPORTANT

app.set('view options',{layout:false});
app.engine('html',require('ejs').renderFile);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

socketUsers.Session(app);//IMPORTANT

app.use(express.static(path.join(__dirname,'public')));

app.get('/',function(req,res){
    res.render('index.html');
});

io.use(socketUsers.Middleware());

var rootUsers = socketUsers.Users; //or socketUsers.Users.of('/');
rootUsers.on('connection',function(user){
    user.socket.on('message',function (himsg){
        console.log(himsg);
    });
});

var chat = io.of('/chat');
chat.use(socketUsers.Middleware());//IMPORTANT 
require('./lib/socket.service.chat')(chat); //A custom service for this example. look how easy is to manage your code with users and socket.io.users module

var eye  = io.of('/eye');
eye.use(socketUsers.Middleware());
require('./lib/socket.service.eye')(eye);


server.listen(8080,function(){
    console.log('Server is running on 8080'); 
});
```
### lib/socket.service.chat.js

```js
"use strict";

var users = require('socket.io.users').Users.of('/chat');
var debug=true;


module.exports = function(){
    var io=undefined;
    if(arguments.length>0){
        io = arguments[0];   
    }else{
        console.error('You did not pass a parameter socket.io inside!');    
    }
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
            conv = {room:room,users:[user],messages:[]};
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

    function emitAll(listenerStr,data){
        for (var nameSpace in io.sockets.manager.namespaces){
            io.of(nameSpace).emit(listenerStr, data);
        }   
    }

    users.on('connected', function(user){
        if(debug)
            console.log('A User ('+ user.id+') has connected.');
        user.store.username = 'user'+numName; // You can use user.store to store your own custom properties describes this user.
        numName++;
    });

    users.on('connection', function(user){
        console.log('chat service on connection');
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
            io.to(user.id).emit('conversation added',roomName);
        });

        currentSocket.on('conversation message',function(data){
            if(debug)
                console.log('Conversation MESSAGE '+ user.id + ' to '+data.room +': '+ data.message);
            getConversation(data.room).messages.push({user: user.id, message: data.message});
            io.to(data.room).emit('conversation message added',{room:data.room,message:data.message,user:user.id});
        });

    });

    users.on('disconnected', function(user){

        //The socket.io.users module automatically leaves all rooms which all user's sockets are inside, when user disconnects ( = all sockets disconnected).  
        //but here we just clean up the conversations for this specific app/example.
        clearUserConversations(user.id);

        if(debug){
            console.log('User '+ user.id+' has gone.');
        }


    }); 



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


        <script src="/socket.io/socket.io.js"></script> <!-- provided by socket.io module -->
        <script src="js/libs/jquery-2.1.4.min.js"></script> <!-- need this for the example -->
        <script src="js/libs/js.cookie.js"></script> <!-- need this for the example -->
        <script src="js/chat.js" ></script> <!-- custom script for this example -->
    </body>
</html>

```

### public/js/chat.js

```js
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
    var root = io();
    var chat;

    //On line 1050 a loc.hostname is used instead of loc.host.
    //This causes a hostname to be used when passing in a namespace, this doesn't include port number so a temp fix is: 
    var chatURI=':8080/chat'; 
    /* or

     var myId = 'kataras'; // this can be asked by server too for authorization
     var chat = io(':8080/chat?id='+myId); 

     this means all sockets is one user with id=kataras rathen than the default which is session id, you can ask for username from client and start 
     connection to io with same user    and sockets from different machine-pcs too! 

     Real web application example from above explaination: */ 
    if(Cookies.get('id') !== undefined){
        chatURI+='?id='+Cookies.get('id');
    }else{
        var explainStr = "You can pass same name if you want to test it between other machine. All same user's sockets will be synchronized!";
        var person = prompt("Please enter your name", explainStr);

        if (person !== null && person.length>0 && person!==explainStr) {
            chatURI+='?id='+person; 
            Cookies.set('id',person);
            setTimeout(function() {  root.emit('message',person+' is here!');},1000);
        }
    }

    chat = io(chatURI); 

    /*End real web application example*/



    chat.on('connect',function(){
        console.log('Connected to server.');
    });

    chat.on('set username',function(username){
        console.log('Your username is: '+username);
        //  window.alert('Your username setted by server is: '+username);

    });

    chat.on('conversation push',function(_conversations){
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
            for(var k=0;k< _conversations[i].messages.length;k++){
                $("#messagesArea").append("<br/>("+_conversations[i].room+") <b>"+_conversations[i].messages[k].user+ " :</b> "+_conversations[i].messages[k].message); 
            }
        }
    });

    chat.on('conversation added',function(roomName){
        joinConversation(roomName);
    });



    chat.on('conversation user added',function(data){
        //data = room, user  
        appendUser(data.user);
    });

    chat.on('conversation message added',function(data){
        appendMessage(data);
    });


    $("#sendMessageBtn").click(function(){
        var msg = $("#messageTxt").val();
        console.dir(rooms);
        var data = {
            room:rooms[0],
            message: msg
        };

        chat.emit('conversation message',data);
        console.log('sending message to '+data.room);
        $("#messageTxt").val("");
    });


    $("#joinConversationBtn").click(function(){
        var roomName = $("#joinConversationTxt").val();

        if(rooms.indexOf(roomName)!==-1){
            window.alert('You are already in this Room!');

        }else{
            chat.emit('conversation join', roomName);
            console.log('Emit join to: ' +roomName);

            // on emit  joinConversation(roomName);
            $("#joinConversationTxt").val("");}
    });

});


```

### [GPL-3.0 Licensed](LICENSE)

[downloads-url]: https://www.npmjs.com/package/socket.io.users
