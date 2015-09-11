/// <reference path="../typings/express/express.d.ts" />
/// <reference path="../typings/express-session/express-session.d.ts" />

import {Application} from "express";
import {SessionOptions} from "express-session";

var Session = (app: Application, options?:SessionOptions) => {
    let cookieParser = require('cookie-parser');

    if (options === undefined) {
        options = {
            secret: "socket.io.users secret",
            resave: true,
            saveUninitialized: true
        };
    }
    let session = require("express-session")(options, cookieParser);

    app.use(cookieParser());
    app.use(session); // express-session middleware for express
}

export default Session;
