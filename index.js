var express = require("express");
var handler = require("./handler.js");

module.exports.createApp = function(jstatikContext) {

    var app = express();

    app.get("*", function(req, res) {

        handler.handle(jstatikContext, req.baseUrl, req.path, res);

    });

    return app;

};