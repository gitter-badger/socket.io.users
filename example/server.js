var express = require('express');
var app = express();
var server = require('http').createServer(app);
var path=require('path');
var bodyParser = require('body-parser');
var io = require('socket.io')(server);
var socketUsers = require('./../index'); //IMPORTANT

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