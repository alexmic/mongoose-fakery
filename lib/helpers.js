/*===============================================
=            MONGOOSE FAKERY HELPERS            =
===============================================*/

var each = function(obj, cb) {
    var p;
    for (p in obj) {
        if (obj.hasOwnProperty(p)) {
            cb(obj[p], p);
        }
    }
};

var map = function(obj, cb) {
    var ret = [];
    each(obj, function(v, k) {
        ret.push(cb(v, k));
    });
    return ret;
};

var typeChecks = {};

// credit for this technique goes to Jeremy Ashkenas and underscore.js
// http://underscorejs.org/underscore.js
// thanks!
each(['Function', 'Object', 'Array'], function(name) {
    typeChecks['is' + name] = function(obj) {
        return toString.call(obj) == '[object ' + name + ']';
    };
});

exports.each = each;
exports.map = map;
exports.isFunction = typeChecks.isFunction;
exports.isObject = typeChecks.isObject;
exports.isArray = typeChecks.isArray;
exports.isFactory = typeChecks.isFactory;
