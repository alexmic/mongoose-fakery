/*=============================================
=            MONGOOSE FAKERY TESTS            =
=============================================*/

'use strict';

var assert = require('chai').assert
  , fakery = require('../lib/fakery')
  , mongoose = require('mongoose')
  , Schema = mongoose.Schema;

describe('tests fakery.js', function() {
    describe('g', function() {
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

    describe('generator()', function() {
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

    describe('fake()', function() {
        before(function() {
            var PersonSchema = new Schema({
                name: String
            });
            mongoose.model('Person', PersonSchema);
        });

        it('should store a new factory if model and attributes are present', function() {
            fakery.fake('test', mongoose.model('Person'), {
                name: 'alex'
            });
        });

        it('should return a factory if only name is present', function() {
            var factory = fakery.fake('test');
            assert.equal(factory.name, 'test');
            //assert.instanceOf(factory, fakery.Factory);
        });
    });

    describe('make()', function() {
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

    describe('makeAndSave()', function() {

        before(function() {
            // Mock the save() method on the Mongoose model
            var Test = mongoose.model('Test');
            Test.prototype.save = function(done) {
                this._called = true;
                done(null, this);
            };
        });

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
                assert.isTrue(test._called);
                done();
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
                assert.equal(test.str, 'str');
                assert.equal(test.num, 5);
                assert.equal(test.array[0], 1);
                assert.isTrue(test._called);
                done();
            });
        });
    });
});
