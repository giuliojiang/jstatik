# jstatik

An Express.js app to browse and serve static files

# Quickstart

```
npm --save install giuliojiang/jstatik
```

```javascript
var express = require("express");
var jstatik = require("jstatik");

var app = express();
var context = jstatik.createContext();
context.setRootDirectory("/my/content/folder");
app.use("/", jstatik.createApp(context));

app.listen(3000, () => {
    console.info("Listening on port 3000");
});
```

Replacing /my/content/folder with the directoring that you want to serve. An absolute path is required.

Navigate to http://localhost:3000 to see see the website.