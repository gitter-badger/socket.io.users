var express = require('express');
var app = express();
var server = require('http').createServer(app);
var path=require('path');
var bodyParser = require('body-parser');
var io = require('socket.io')(server);
var socketUsers = require('./../index'); //IMPORTANT
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


//eyeService(io);
require('./lib/socket.service.chat')(io);//A custom service for this example. look how easy is to manage your code with users and socket.io.users module

server.listen(8080,function(){
    console.log('Server is running on 8080'); 
});