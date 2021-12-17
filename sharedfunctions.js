var _sharedFunctions = [];

module.exports.addSharedFunction = function addSharedFunction(name, f) {
    _sharedFunctions.push({ name: name, f: f });
}
module.exports.callFunction = function callFunction(name, args) {
    for(var i = 0; i < _sharedFunctions.length; i++) {
        if (_sharedFunctions[i].name == name) {
            if (Array.isArray(args)) {
                return _sharedFunctions[i].f.apply(null, args);
            }
            else {
                return _sharedFunctions[i].f(args);
            }
        }
    }
}

