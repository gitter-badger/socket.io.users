"use strict";

module.exports = function(app){
    var cookieParser = require('cookie-parser'); 
    var options;
    
    if(arguments.length>1){
        options = arguments[1];   
    }else{
        options={
            secret: "socket.io.users secret",
            resave: true,
            saveUninitialized: true
        };
    }
    
    var session = require("express-session")(options,cookieParser);

    app.use(cookieParser());
    app.use(session); // express-session middleware for express

};