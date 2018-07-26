var express = require("express");
var jstatik = require("./index.js");
var context = require("./context.js");
var path = require("path");

process.on('uncaughtException', (err) => {
    console.error("Uncaught exception: ", err);
});

var app = express();
var jstatikContext = context.createNewContext();
jstatikContext.setRootDirectory(path.join(__dirname, "etc", "www"));
app.use("/js", jstatik.createApp(jstatikContext));

app.listen(3000, () => {
    console.info("Listening on port 3000");
});