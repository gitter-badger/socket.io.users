var express = require('express');
var app = express();
var server = require('http').createServer(app);
var path = require('path');
var bodyParser = require('body-parser');
var io = require('socket.io')(server);
var socketUsers = require('./../index'); //IMPORTANT

app.set('view options', {
  layout: false
});
app.engine('html', require('ejs').renderFile);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

var optionalSessionOptions = {
  secret: "socket.io.users.example",
  resave: true,
  saveUninitialized: true
};

socketUsers.Session(app); //IMPORTANT if you will use the default cookie-session-id to be your user(s)'s indentifer/authorizator or
//socketUsers.Session(app,optionalSessionOptions) .

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.render('index.html');
});

var userLocalFactory = [{
  id: 1,
  username: 'makis',
  password: 'encryptedmakispassword',
  someotherPropety: 'extra'
}, {
  id: 2,
  username: 'george',
  password: 'encryptedgeorgepassword',
  someotherPropety: 'extra'
}, {
  id: 3,
  username: 'kataras',
  password: 'encryptedkataraspassword',
  someotherPropety: 'extra'
}, {
  id: 4,
  username: 'argi',
  password: 'encryptedargipassword',
  someotherPropety: 'extra'
}];

app.post('/api/users', function(req, res) {
  var username = req.body.username;

  var userObject = {
    error: 'Wrong username.'
  };
  for (i = 0; i < userLocalFactory.length; i++) {
    var _user = userLocalFactory[i];
    if (_user.username == username) {
      userObject = _user;
      break;
    }
  }

  res.json(userObject);
});


//  io.use(socketUsers.Middleware()); the namespace of '/' (socket.io's default)
//  Middleware SHARES all socket.io,users across all namespaces and Middlewares so if you will use the default napespace for socket.io this will has all users inside ( and from /chat and from /eye for example).
//  var rootUsers = socketUsers.Users; //or socketUsers.Users.of('/');
// rootUsers.on('connection',function(user){
//      user.socket.on('message',function (himsg){
//         console.log(himsg);
//     });
// });


var chat = io.of('/chat');
chat.use(socketUsers.Middleware()); //IMPORTANT
require('./lib/socket.service.chat')(chat); //A custom service for this example. look how easy is to manage your code with socket.io.users module

var eye = io.of('/eye');
eye.use(socketUsers.Middleware());
require('./lib/socket.service.eye')(eye);



server.listen(8080, function() {
  console.log('Server is running on 8080');
});
