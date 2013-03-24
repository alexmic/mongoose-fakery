/*=======================================
=            MONGOOSE FAKERY            =
=======================================*/

var providers = require('./data_providers')
  , factories = {}
  , generatorStore = {}
  , helpers = require('./helpers');

/**
 * Helper Factory class. Mainly acts as a 'mark' that this is a Factory. For
 * now this does not play an active role in anything.
 */
function Factory(name, model, attributes) {
    this.name = name;
    this.model = model;
    this.attributes = attributes;
};

/**
 * Marks a function as a lazy attribute. Lazy attributes are resolved during
 * a second pass over the factory attributes.
 */
var lazy = function(fn) {
    // make sure we attach `lazy` only on functions
    if (helpers.isFunction(fn)) fn._lazy = true;
    return fn;
};

/**
 * Adds a factory object in `factories`. If a factory with the given name
 * is already defined, it will get overriden. If only `name` is provided
 * then it acts as a getter for the named factory.
 *
 * Params:
 *     - name: the name of the factory, as a string
 *     - model: the mongoose model class
 *     - attributes: hash with model attributes
 *
 * Examples:
 *     >>> fakery.fake('test', TestModel, {name: fakery.g.name()});
 *     // => undefined
 *     >>> fakery.fake('test');
 *     // => {name: 'test', model: TestModel, attributes: {name: ...}};
 */
var fake = function(name, model, attributes) {
    if (name != null && model == null && attributes == null) return factories[name];
    if (model == null) return;
    if (attributes == null) attributes = {};
    factories[name] = new Factory(name, model, attributes);
};

/**
 * Resolves an attribute to a value, depending on its type.
 *
 * `lazyContext` is passed to this method during the second pass where
 * lazy attributes are supposed to get resolved.
 *
 * This is a private method.
 *
 * Params
 *     - attr: the factory attribute to resolve
 *     - lazyContext: the context for lazy attributes, which is a hash of all
 *       resolved attributes during the first run
 *
 */
var resolve = function(attr, lazyContext) {
    var resolved;

    if (helpers.isArray(attr)) {
        resolved = helpers.map(attr, function(item) {
            return resolve(item, lazyContext);
        });
    } else if (helpers.isFunction(attr)) {
        if (attr._lazy === true) {
            if (lazyContext != null) resolved = attr(lazyContext);
        } else {
            resolved = attr();
        }
    } else if (helpers.isObject(attr)) {
        resolved = {};
        helpers.each(attr, function(value, key) {
            resolved[key] = resolve(value, lazyContext);
        });
    } else {
        resolved = attr;
    }

    return resolved;
};

/**
 * Makes a model from the factory with the given `name`.
 *
 * Params
 *     - name: the name of the factory, as a string
 *     - overrides: a hash of attributes to override factory attributes passed
 *       in `fake()` call.
 *
 * Examples:
 *     >>> fakery.make('test', {name: 'test'});
 *     // => {name: 'test', ...}
 */
var make = function(name, overrides) {
    var factory = factories[name], resolved;
    if (overrides == null) overrides = {};
    if (factory == null) return;
    // resolve "eager" properties first and leave lazy ones for a second pass
    var resolved = resolve(factory.attributes);
    // pass already resolved attributes as context to the second pass
    resolved = resolve(factory.attributes, resolved);
    // apply overrides
    helpers.each(overrides, function(value, key) {
        resolved[key] = value;
    });
    return new factory.model(resolved);
};

/**
 * Makes a model and persists it in the database.
 *
 * Params
 *     - name: the name of the factory, as a string
 *     - arg1: either a mongoose callback or an override hash
 *     - arg2: if arg1 is an override hash, then arg2 is the mongoose callback
 *
 * Examples:
 *     >>> fakery.makeAndSave('test', function(err, test) {
 *             console.log(test);
 *         })
 *     // => TestUser
 */
var makeAndSave = function(name, arg1, arg2) {
    var overrides, done, model;
    if (helpers.isObject(arg1)) {
        overrides = arg1;
        done = arg2;
    }
    if (helpers.isFunction(arg1)) {
        overrides = {};
        done = arg1;
    }
    model = make(name, overrides);
    if (model != null) model.save(done);
    return model;
};

/**
 * Creates and stores a new generator function from a data provider. A data
 * provider is basically a function that returns some data. Generators wrap
 * data providers and pass any parameters they receive.
 *
 * Params:
 *     - name: the name of the generator, as a string
 *     - fn: the provider function
 *
 * Examples:
 *     >>> fakery.generator('now', function() {
 *             return new Date();
 *         });
 *     // => undefined
 */
var generator = function(name, fn) {
    if (name == null || fn == null) return;
    generatorStore[name] = function() {
        var args = [].slice.call(arguments);
        return function() {
            return fn.apply(fn, args);
        };
    };
};

exports.lazy = lazy;
exports.fake = fake;
exports.make = make;
exports.makeAndSave = makeAndSave;
exports.generator = generator;
exports.Factory = Factory;

// export the generator store as `g`
exports.g = generatorStore;

// export all predefined data providers as generators on `g`
helpers.each(providers, function(provider, name) {
    generator(name, provider);
});
