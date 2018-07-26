function JstatikContext() {

    var self = this;
    var d = {};
    d.rootDir = null;

    self.setRootDirectory = function(rootDir) {
        d.rootDir = rootDir;
    };

    self.getRootDirectory = function() {
        return d.rootDir;
    };

}

module.exports.createNewContext = function() {

    return new JstatikContext();

};