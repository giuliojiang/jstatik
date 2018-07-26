var express = require("express");
var handler = require("./handler.js");
var context = require("./context.js");

module.exports.createApp = function(jstatikContext) {

    var app = express();

    app.get("*", function(req, res) {

        handler.handle(jstatikContext, req.baseUrl, req.path, res);

    });

    return app;

};

module.exports.createContext = function() {

    return context.createNewContext();

};