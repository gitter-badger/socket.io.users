# socket.io.users

This is a node js module for `socket.io` applications. `One user per client`. User means `new tab, new browser but same client-machine-user`. `This module helps developer to find which socket is from who`. The package contains a `server which is build on top of the socket.io` server, you have to use it in order the module to work.

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
var ioUsers = require('socket.io.users');
var socketServer = ioUsers.Server(server);


ioUsers.Session(app);

socketServer.start();

users.on('connected',function(io){
 // For first time this io.user.id has connected.
});

users.on('connection',function(io){
 // Every time SOCKET(first time user-connection, or existing user with new tab or other browser window) connected.
});

users.on('disconnected',function(io){
 // io.user has disconnected, means all browser tabs or windows are closed by user.
});
```
### Any js file connected to your main application

```js
var users =  require('socket.io.users').Users;


users.on('connected',function(io){
 // For first time this io.user.id has connected.
});

users.on('connection',function(io){
 // Every time SOCKET(first time user-connection, or existing user with new tab or other browser window) connected.
});

users.on('disconnected',function(io){
 // io.user has disconnected, means all browser tabs or windows are closed by user.
});

```


### [GPL-3.0 Licensed](LICENSE)

[downloads-url]: https://www.npmjs.com/package/socket.io.users
