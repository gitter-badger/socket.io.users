module.exports = function(app){
    var cookieParser = require('cookie-parser');  

    var session = require("express-session")({
        secret: "makis",
        resave: true,
        saveUninitialized: true
    },cookieParser);

    app.use(cookieParser());
    app.use(session); // express-session middleware for express


};

