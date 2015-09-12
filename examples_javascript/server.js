///// <reference path="node_modules/socket.io.users/compiled/typings/socket.io.users/socket.io.users.d.ts" />
var express = require('express');
var app = express();
var httpServer = require('http').createServer(app);
var path = require('path');
var bodyParser = require('body-parser');
var io = require('socket.io')(httpServer);
var socketUsers = require('socket.io.users');
var config = require('config');
var routes = require('./routes/index');
app.set('view options', {
  layout: false
});
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

socketUsers.Session(app,{
    "secret": "socket.io.users secret",
    "resave": true,
    "saveUninitialized": true
  });

//app.use(require('prerender-node').set('prerenderServiceUrl', 'http://service.prerender.io/').set('prerenderToken', 'yqzEnhIVldxGR95v2V1s'));  //otan to aenvasw na dw an doulevei prepei na pros9esw add url sto prerender.io

app.use(express.static(path.join(__dirname, 'public')));

app.use("/", routes);

//Define socket.io routes

io.use(socketUsers.Middleware());
var chatServer = require('./modules/chat-server')(io);

var httpPort = 80;// config.get('Server.port');
httpServer.listen(httpPort, function() {
  console.log("Server is running on " + httpPort);
});
