# socket.io.users

This is a node js module for socket.io applications. One user per client. User means new tab, new browser but same client-machine-user. This module helps developer to find which socket is from who. The package contains a server which is build on top of the socket.io server, you DO NOT have to use it in order the module to work, but you have to use the socket.session and socket.middleware.

** This is my first node module, almost one week  experience with node js.  This means if you want to support this project, you are welcome! **

## Installation

```sh
$ npm install socket.io.users
```

[NPM] https://www.npmjs.com/package/socket.io.users

## Example

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
var eyeService = require('./lib/socket.service.eye');

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


users.on('connected',function(user){
    console.log('User has connected with ID: '+ user.id);
});

users.on('connection',function(user){
    console.log('Socket ID: '+user.socket.id+' added to user with ID: '+user.id);
});


io.on('connection',function(socket){//this executes after connected and  connection
    console.log('IO DEBUG: Socket '+ socket.id+ ' is ready \n'); 
});

users.on('disconnected',function(user){
    console.log('User with ID: '+user.id+'is gone away :(');
});


eyeService(io);//A custom service for this example. look how easy is to manage your code with users and socket.io.users module


server.listen(8080,function(){
    console.log('Server is running on 8080'); 
});
```
### socket.service.eye.js

```js
var users = require('socket.io.users').Users;//IMPORTANT, this is the only require you want here.

module.exports = function(io){

    var eyes = [];
    var addEye = function(eye){
        var exists=false;
        for(var i =0; i <eyes.length; i++){
            if( eyes[i].id === eye.id && eyes[i].article === eye.article ){
                exists=true;
                break;
            }

        }
        if(exists===false){
            eyes.push(eye);   
        }
        return !exists;
    };

    var getByArticle = function(article){
        for(var i =0; i <eyes.length; i++){
            if( eyes[i].article === article ){
                return eye;
            }

        }
    };

    users.on('connected',function(user){
        console.log('A user has connected to EYE.'); 
    });

    users.on('connection',function(user){
        io.to(user.socket.id).emit('push eyes',eyes);
        user.socket.on('article read',function (eye){
            eye.id = user.id;
            if(addEye(eye)){
                io.emit('eye added',eye); 
                io.to(user.id).emit('eye added',{id: 'Myself',article: 'You have seen an article', town: 'Server'});

            }
        }); 
    });

    users.on('disconnected',function(user){
        console.log('A user has been disconnected from EYE.'); 
    });

};

```


### [GPL-3.0 Licensed](LICENSE)

[downloads-url]: https://www.npmjs.com/package/socket.io.users
