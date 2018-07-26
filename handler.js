var path = require("path");
var fs = require("fs");
var jsdom = require("jsdom");
const { JSDOM } = jsdom;
var async = require("async");

var priv = {};

module.exports.handle = function(context, baseUrl, reqpath, res) {

    // Basic sanitize, remove ..
    var relPath = reqpath.split("..").join("");

    // Resolve as filesystem place
    var wwwDir = context.getRootDirectory();
    var fsPath = path.join(wwwDir, relPath);

    // Check if it's a directory
    fs.stat(fsPath, function(err, stats) {
        if (err) {
            res.sendStatus(404);
        } else {
            if (stats.isDirectory()) {
                priv.handleDirectory(baseUrl, reqpath, fsPath, res, context);
            } else {
                priv.handleFile(fsPath, res);
            }
        }
    });

};

priv.handleFile = function(fsPath, res) {

    res.sendFile(fsPath);

}

priv.handleDirectory = function(baseUrl, reqpath, fsPath, res, context) {

    // Load HTML template
    fs.readFile(path.join(__dirname, "template", "template.html"), function(err, templateString) {
        if (err) {
            console.error("handler.js: Could not read template file");
            res.sendStatus(500);
            return;
        }

        var templateDom = new JSDOM(templateString);

        // Replace the title link
        var navbarTitle = templateDom.window.document.getElementById("jNavbarTitle");
        if (!navbarTitle) {
            console.error("handler.js: template has no jNavbarTitle ID element");
            res.sendStatus(500);
            return;
        }
        navbarTitle.href = baseUrl;

        // Add list of files
        var tableBody = templateDom.window.document.getElementById("jTableBody");
        if (!tableBody) {
            console.error("handler.js: template has no jTableBody ID element");
            res.sendStatus(500);
            return;
        }

        // Add the "back" link
        var parentPath = path.dirname(fsPath);
        if (priv.isChildOf(parentPath, context.getRootDirectory())) {
            // This path is allowed
            var parentLink = baseUrl + reqpath;
            parentLink = path.dirname(parentLink);
            priv.createLinkElement(templateDom, tableBody, "..", parentLink);
        } else {
            // It's a parent of the root directory, so do not show the parent link
            // do nothing here
        }

        // Add contents
        async.waterfall([

            // Get directory content
            function(callback) {
                fs.readdir(fsPath, callback);
            },

            // Generate DOM elements
            function(files, callback) {
                async.eachSeries(files, function(file, callback) {
                    var filePath = path.join(fsPath, file);
                    fs.stat(filePath, function(err, stats) {
                        if (err) {
                            callback(err);
                        } else {
                            var displayName = "";
                            if (stats.isDirectory()) {
                                displayName = file + "/";
                            } else {
                                displayName = file;
                            }
                            var targetLink = path.resolve(baseUrl + reqpath, file);
                            priv.createLinkElement(
                                templateDom,
                                tableBody,
                                displayName,
                                targetLink
                            );
                            callback();
                        }
                    })
                }, callback);
            },

            // Send final document
            function(callback) {
                var outputDocString = templateDom.serialize();
                res.send(outputDocString);
                callback();
            }

        ], function(err) {

            if (err) {
                console.error("handler.js: handle directory error");
                console.error(err);
                res.sendStatus(500);
            }

        });

    })

};

priv.createLinkElement = function(templateDom, tableBody, textContent, linkDestination) {
    var trElem = templateDom.window.document.createElement("tr");
    tableBody.appendChild(trElem);
    var tdElem = templateDom.window.document.createElement("td");
    trElem.appendChild(tdElem);
    var aElem = templateDom.window.document.createElement("a");
    aElem.classList.add("grey-text");
    aElem.classList.add("text-darken-4");
    aElem.href = linkDestination;
    aElem.textContent = textContent;
    tdElem.appendChild(aElem);
};

// Returns true if child is a child path of parent,
// or if child and parent are the same path
priv.isChildOf = (child, parent) => {
    var child = path.resolve(child);
    var parent = path.resolve(parent);

    if (child == parent) {
        return true;
    }

    if (parent.length <= child.length) {
        return parent == child.substring(0, parent.length);
    } else {
        return false;
    }
};