/*=============================================
=            MONGOOSE FAKERY TESTS            =
=============================================*/

'use strict';

var assert = require('chai').assert
  , fakery = require('../mongoose-fakery')
  , providers = require('../lib/data_providers')
  , fakeryData = require('../lib/data')
  , mongoose = require('mongoose')
  , Schema = mongoose.Schema;

describe('lib/mongoose-fakery/data_providers.js', function() {
    it('providers.str()', function() {
        assert.isString(providers.str());
        assert.match(providers.str(), /^[a-z0-9%&!,\.\[\]\{\}#*~]+$/);
        assert.equal(providers.str(15).length, 15);
        assert.isTrue(providers.str(0, 15).length >= 0);
        assert.isTrue(providers.str(0, 15).length <= 15);
        assert.isTrue(providers.str().length >= 0);
        assert.isTrue(providers.str().length <= 100);
    });

    it('providers.hex()', function() {
        assert.isString(providers.hex());
        assert.equal(providers.hex(15).length, 15);
        assert.isTrue(providers.hex(13, 15).length >= 13);
        assert.isTrue(providers.hex(2, 15).length <= 15);
        assert.isTrue(providers.hex().length >= 0);
        assert.isTrue(providers.hex().length <= 100);
    });

    it('providers.alphanum()', function() {
        assert.isString(providers.alphanum());
        assert.equal(providers.alphanum(15).length, 15);
        assert.isTrue(providers.alphanum(0, 15).length >= 0);
        assert.isTrue(providers.alphanum(0, 15).length <= 15);
        assert.isTrue(providers.alphanum().length >= 0);
        assert.isTrue(providers.alphanum().length <= 100);
    });

    it('providers.pick()', function() {
        assert.include([1, 2, 3], providers.pick([1, 2, 3]));
        assert.isUndefined(providers.pick([]));
        assert.isUndefined(providers.pick());
    });

    it('providers.gender()', function() {
        assert.isString(providers.gender());
        assert.include(['m', 'f'], providers.gender());
        assert.include(['m', 'f'], providers.gender('short'));
        assert.include(['male', 'female'], providers.gender('long'));
    });

    it('providers.name()', function() {
        assert.isString(providers.name());
        assert.isString(providers.name('m'));
        assert.isString(providers.name('f'));
        assert.include(fakeryData.names.male, providers.name('m'));
        assert.include(fakeryData.names.female, providers.name('f'));
        assert.include(
            fakeryData.names.male.concat(fakeryData.names.female),
            providers.name()
        );
    });

    it('providers.surname()', function() {
        assert.isString(providers.surname());
        assert.include(fakeryData.surnames, providers.surname());
    });

    it('providers.rndint()', function() {
        assert.isNumber(providers.rndint());
        assert.isTrue(providers.rndint() >= 0);
        assert.isTrue(providers.rndint() <= 100);
        assert.isTrue(providers.rndint(10, 10) >= 10);
        assert.isTrue(providers.rndint(10, 10) <= 10);
        assert.isTrue(providers.rndint(10, 15) >= 10);
        assert.isTrue(providers.rndint(10, 15) <= 15);
    });

    it('providers.rndbool()', function() {
        assert.isBoolean(providers.rndbool());
    });

    it('providers.lorem()', function() {
        assert.equal(providers.lorem().length, 1);
        assert.equal(providers.lorem(0).length, 0);
        assert.equal(providers.lorem(1).length, 1);
        assert.equal(providers.lorem(5).length, 5);
    });
});

describe('lib/mongoose-fakery/fakery.js', function() {
    describe('fakery.g', function() {
        it('should expose the predefined data providers', function() {
            assert.isDefined(fakery.g);
            assert.isDefined(fakery.g.str);
            assert.isDefined(fakery.g.hex);
            assert.isDefined(fakery.g.alphanum);
            assert.isDefined(fakery.g.pick);
            assert.isDefined(fakery.g.surname);
            assert.isDefined(fakery.g.fullname);
            assert.isDefined(fakery.g.gender);
            assert.isDefined(fakery.g.rndint);
            assert.isDefined(fakery.g.rnd);
            assert.isDefined(fakery.g.rndbool);
            assert.isDefined(fakery.g.lorem);
        });
    });

    describe('fakery.generator()', function() {
        it('should add any new user-defined providers to fakery.g', function() {
            fakery.generator('custom', function() {
                return 'custom';
            });
            assert.isDefined(fakery.g.custom);
        });

        it('should create generators that return correct values', function() {
            fakery.generator('test', function() {
                return 'test';
            });
            var testGenerator = fakery.g.test();
            assert.isFunction(testGenerator);
            assert.equal(testGenerator(), 'test');
        });
    });

    describe('fakery.fake()', function() {
        before(function() {
            var PersonSchema = new Schema({
                name: String
            });
            mongoose.model('Person', TestSchema);
        });

        it('should store a new factory if model and attributes are present', function() {
            fakery.fake('test', mongoose.model('Person'), {
                name: 'alex'
            });
        });

        it('should return a factory if only name is present', function() {
            var factory = fakery.fake('test');
            assert.equal(factory.name, 'test');
            assert.instanceOf(factory, fakery.Factory);
        });
    });

    describe('fakery.make()', function() {
        before(function() {
            var TestSchema = new Schema({
                str: String,
                num: Number,
                array: [],
                bool: Boolean,
                boolgen: Boolean,
                nested: {
                    foo: String,
                    foogen: String
                }
            });
            mongoose.model('Test', TestSchema);
        });

        it('should make a model without generators', function() {
            var Test = mongoose.model('Test');
            fakery.fake('test', Test, {
                str: 'str',
                num: 5,
                array: [1],
                bool: false,
                boolgen: false,
                nested: {
                    foo: 'str',
                    foogen: 'str'
                }
            });

            var model = fakery.make('test');

            assert.isDefined(model.str);
            assert.isDefined(model.num);
            assert.isDefined(model.array);
            assert.isDefined(model.bool);
            assert.isDefined(model.boolgen);
            assert.isDefined(model.nested);

            assert.equal(model.str, 'str');
            assert.equal(model.num, 5);
            assert.equal(model.bool, false);
            assert.equal(model.boolgen, false);
            assert.equal(model.array[0], 1);
            assert.equal(model.nested.foo, 'str');
            assert.equal(model.nested.foogen, 'str');

            assert.instanceOf(model, Test);
        });

        it('should apply generators', function() {
            var Test = mongoose.model('Test');
            fakery.fake('test', Test, {
                str: fakery.g.str(10),
                num: 5,
                array: [1],
                bool: false,
                boolgen: fakery.g.rndbool(),
                nested: {
                    foo: 'str',
                    foogen: 'str'
                }
            });

            var model = fakery.make('test');

            assert.isDefined(model.str);
            assert.isDefined(model.num);
            assert.isDefined(model.array);
            assert.isDefined(model.bool);
            assert.isDefined(model.boolgen);
            assert.isDefined(model.nested);

            assert.lengthOf(model.str, 10);
            assert.equal(model.num, 5);
            assert.equal(model.bool, false);
            assert.equal(model.array[0], 1);
            assert.isTrue(model.boolgen === true || model.boolgen === false);
            assert.equal(model.nested.foo, 'str');
            assert.equal(model.nested.foogen, 'str');

            assert.instanceOf(model, Test);
        });

        it('should apply generators (one-level nesting)', function() {
            var Test = mongoose.model('Test');
            fakery.fake('test', Test, {
                str: fakery.g.str(10),
                num: 5,
                array: [1, 2, 3],
                bool: false,
                boolgen: fakery.g.rndbool(),
                nested: {
                    foo: 'str',
                    foogen: fakery.g.str(10)
                }
            });

            var model = fakery.make('test');

            assert.isDefined(model.str);
            assert.isDefined(model.num);
            assert.isDefined(model.array);
            assert.isDefined(model.bool);
            assert.isDefined(model.boolgen);
            assert.isDefined(model.nested);

            assert.lengthOf(model.str, 10);
            assert.equal(model.num, 5);
            assert.equal(model.bool, false);
            assert.isTrue(model.boolgen === true || model.boolgen === false);
            assert.lengthOf(model.nested.foogen, 10);

            assert.instanceOf(model, Test);
        });

        it('should apply generators (in arrays)', function() {
            var Test = mongoose.model('Test');
            fakery.fake('test', Test, {
                str: 'str',
                num: 5,
                array: [fakery.g.str(5), fakery.g.str(5)],
                bool: false,
                boolgen: false,
                nested: {
                    foo: 'str',
                    foogen: 'str'
                }
            });

            var model = fakery.make('test');

            assert.isDefined(model.str);
            assert.isDefined(model.num);
            assert.isDefined(model.array);
            assert.isDefined(model.bool);
            assert.isDefined(model.boolgen);
            assert.isDefined(model.nested);

            assert.equal(model.str, 'str');
            assert.equal(model.num, 5);
            assert.equal(model.bool, false);
            assert.equal(model.boolgen, false);
            assert.lengthOf(model.array, 2);
            assert.lengthOf(model.array[0], 5);
            assert.lengthOf(model.array[1], 5);

            assert.instanceOf(model, Test);
        });

        it('should apply lazy attributes', function() {
            var Test = mongoose.model('Test');
            fakery.fake('test', Test, {
                str: fakery.lazy(function(attrs) {
                    // check that all eager attributes are calculated
                    assert.equal(attrs.num, 5);
                    assert.equal(attrs.array[0], 1);
                    assert.equal(attrs.bool, false);
                    assert.equal(attrs.boolgen, false);
                    assert.equal(attrs.nested.foo, 'str');
                    assert.equal(attrs.nested.foogen, 'str');
                    return 'str' + attrs.num;
                }),
                num: 5,
                array: [1],
                bool: false,
                boolgen: false,
                nested: {
                    foo: 'str',
                    foogen: 'str'
                }
            });

            var model = fakery.make('test');

            assert.isDefined(model.str);
            assert.isDefined(model.num);
            assert.isDefined(model.array);
            assert.isDefined(model.bool);
            assert.isDefined(model.boolgen);
            assert.isDefined(model.nested);

            assert.equal(model.str, 'str5');
            assert.equal(model.num, 5);
            assert.equal(model.bool, false);
            assert.equal(model.boolgen, false);
            assert.equal(model.array[0], 1);
            assert.equal(model.nested.foo, 'str');
            assert.equal(model.nested.foogen, 'str');

            assert.instanceOf(model, Test);
        });

        it('should apply lazy attributes (one-level nesting)', function() {
            var Test = mongoose.model('Test');
            fakery.fake('test', Test, {
                str: 'str',
                num: 5,
                array: [1],
                bool: false,
                boolgen: false,
                nested: {
                    foo: fakery.lazy(function(attrs) {
                        assert.equal(attrs.str, 'str');
                        assert.equal(attrs.num, 5);
                        assert.equal(attrs.array[0], 1);
                        assert.equal(attrs.bool, false);
                        assert.equal(attrs.boolgen, false);
                        assert.equal(attrs.nested.foogen, 'str');
                        return 'str' + attrs.num;
                    }),
                    foogen: 'str'
                }
            });

            var model = fakery.make('test');

            assert.isDefined(model.str);
            assert.isDefined(model.num);
            assert.isDefined(model.array);
            assert.isDefined(model.bool);
            assert.isDefined(model.boolgen);
            assert.isDefined(model.nested);

            assert.equal(model.str, 'str');
            assert.equal(model.num, 5);
            assert.equal(model.bool, false);
            assert.equal(model.boolgen, false);
            assert.equal(model.array[0], 1);
            assert.equal(model.nested.foo, 'str5');
            assert.equal(model.nested.foogen, 'str');

            assert.instanceOf(model, Test);
        });

        it('should apply lazy attributes (in arrays)', function() {
            var Test = mongoose.model('Test')
              , strlazy = function(attrs) {
                    assert.equal(attrs.str, 'str');
                    assert.equal(attrs.num, 5);
                    assert.equal(attrs.bool, false);
                    assert.equal(attrs.boolgen, false);
                    assert.equal(attrs.nested.foo, 'str');
                    assert.equal(attrs.nested.foogen, 'str');
                    return attrs.str;
                }
              , numlazy = function(attrs) {
                    assert.equal(attrs.str, 'str');
                    assert.equal(attrs.num, 5);
                    assert.equal(attrs.bool, false);
                    assert.equal(attrs.boolgen, false);
                    assert.equal(attrs.nested.foo, 'str');
                    assert.equal(attrs.nested.foogen, 'str');
                    return attrs.num;
                };

            fakery.fake('test', Test, {
                str: 'str',
                num: 5,
                array: [fakery.lazy(strlazy), fakery.lazy(numlazy)],
                bool: false,
                boolgen: false,
                nested: {
                    foo: 'str',
                    foogen: 'str'
                },
                user
            });

            var model = fakery.make('test');

            assert.isDefined(model.str);
            assert.isDefined(model.num);
            assert.isDefined(model.array);
            assert.isDefined(model.bool);
            assert.isDefined(model.boolgen);
            assert.isDefined(model.nested);

            assert.equal(model.str, 'str');
            assert.equal(model.num, 5);
            assert.equal(model.bool, false);
            assert.equal(model.boolgen, false);
            assert.equal(model.array[0], 'str');
            assert.equal(model.array[1], 5);
            assert.equal(model.nested.foo, 'str');
            assert.equal(model.nested.foogen, 'str');

            assert.instanceOf(model, Test);
        });

        it('should not affect the model if any fake attributes do not exist on the model', function() {
            var Test = mongoose.model('Test');
            fakery.fake('test', Test, {
                str: fakery.g.name(),
                num: 5,
                array: [1, 2],
                bool: false,
                boolgen: false,
                nested: {
                    foo: 'str',
                    foogen: 'str'
                },
                nonexisting: fakery.g.str(15)
            });

            var model = fakery.make('test');

            assert.isDefined(model.str);
            assert.isDefined(model.num);
            assert.isDefined(model.array);
            assert.isDefined(model.bool);
            assert.isDefined(model.boolgen);
            assert.isDefined(model.nested);

            assert.isUndefined(model.nonexisting);

            assert.instanceOf(model, Test);
        });

        it('should apply overrides', function() {
            var Test = mongoose.model('Test');
            fakery.fake('test', Test, {
                str: fakery.g.name(),
                num: fakery.g.rndint(),
                array: [fakery.g.str(5), fakery.g.str(5)],
                bool: false,
                boolgen: fakery.g.rndbool(),
                nested: {
                    foo: 'str',
                    foogen: 'str'
                }
            });

            var model = fakery.make('test', {
                str: 'str',
                num: 5,
                array: [1, 2],
                boolgen: true
            });

            assert.isDefined(model.str);
            assert.isDefined(model.num);
            assert.isDefined(model.array);
            assert.isDefined(model.bool);
            assert.isDefined(model.boolgen);
            assert.isDefined(model.nested);

            assert.equal(model.str, 'str');
            assert.equal(model.num, 5);
            assert.equal(model.boolgen, true);
            assert.equal(model.array[0], 1);
            assert.equal(model.array[1], 2);

            assert.instanceOf(model, Test);
        });
    });

    describe('fakery.makeAndSave()', function() {
        it('should make and save a model without overrides', function(done) {
            var Test = mongoose.model('Test');
            var spec = {
                str: fakery.g.name(),
                num: fakery.g.rndint(),
                array: [fakery.g.str(5), fakery.g.str(5)],
                bool: false,
                boolgen: fakery.g.rndbool(),
                nested: {
                    foo: 'str',
                    foogen: 'str'
                }
            };

            fakery.fake('test', Test, spec);

            fakery.makeAndSave('test', function(err, test) {
                if (err) throw err;
                assert.instanceOf(test, Test);
                Test.findOne({_id: test._id}, function(err, test) {
                    if (err) throw err;
                    assert.isNotNull(test);
                    done();
                });
            });
        });

        it('should make and save a model with overrides', function(done) {
            var Test = mongoose.model('Test');
            var spec = {
                str: fakery.g.name(),
                num: fakery.g.rndint(),
                array: [fakery.g.str(5), fakery.g.str(5)],
                bool: false,
                boolgen: fakery.g.rndbool(),
                nested: {
                    foo: 'str',
                    foogen: 'str'
                }
            };
            var overrides = {
                str: 'str',
                num: 5,
                array: [1]
            };

            fakery.fake('test', Test, spec);

            fakery.makeAndSave('test', overrides, function(err, test) {
                if (err) throw err;
                assert.instanceOf(test, Test);
                Test.findOne({_id: test._id}, function(err, test) {
                    if (err) throw err;
                    assert.equal(test.str, 'str');
                    assert.equal(test.num, 5);
                    assert.equal(test.array[0], 1);
                    assert.isNotNull(test);
                    done();
                });
            });
        });
    });
});
