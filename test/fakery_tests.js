/*=============================================
=            MONGOOSE FAKERY TESTS            =
=============================================*/

'use strict';

var assert = require('chai').assert
  , fakery = require('../lib/fakery')
  , mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , helpers = require('../lib/helpers');

describe('tests fakery.js', function() {

    before(function() {
        var ComplexSchema = new Schema({
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

        var UserSchema = new Schema({
            name: String
        });

        var ProjectSchema = new Schema({
            name: String,
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        });

        mongoose.model('Complex', ComplexSchema);
        mongoose.model('User', UserSchema);
        mongoose.model('Project', ProjectSchema);
    });

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

        it('should store a new factory if model and attributes are present', function() {
            fakery.fake('user', mongoose.model('User'), {
                name: 'alex'
            });
        });

        it('should return a factory if only name is present', function() {
            var factory = fakery.fake('user');
            assert.equal(factory.name, 'user');
        });
    });

    describe('make()', function() {

        it('should make a model without generators', function() {
            fakery.fake('complex', mongoose.model('Complex'), {
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

            var model = fakery.make('complex');

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
        });

        it('should apply generators', function() {
            fakery.fake('complex', mongoose.model('Complex'), {
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

            var model = fakery.make('complex');

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
        });

        it('should apply generators (one-level nesting)', function() {
            fakery.fake('complex', mongoose.model('Complex'), {
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

            var model = fakery.make('complex');

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
        });

        it('should apply generators (in arrays)', function() {
            fakery.fake('complex', mongoose.model('Complex'), {
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

            var model = fakery.make('complex');

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
        });

        it('should apply lazy attributes', function() {
            fakery.fake('complex', mongoose.model('Complex'), {
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

            var model = fakery.make('complex');

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
        });

        it('should apply lazy attributes (one-level nesting)', function() {
            fakery.fake('complex', mongoose.model('Complex'), {
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

            var model = fakery.make('complex');

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
        });

        it('should apply lazy attributes (in arrays)', function() {
            var strlazy = function(attrs) {
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

            fakery.fake('complex', mongoose.model('Complex'), {
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

            var model = fakery.make('complex');

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
        });

        it('should not affect the model if any fake attributes do not exist on the model', function() {
            fakery.fake('complex', mongoose.model('Complex'), {
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

            var model = fakery.make('complex');

            assert.isDefined(model.str);
            assert.isDefined(model.num);
            assert.isDefined(model.array);
            assert.isDefined(model.bool);
            assert.isDefined(model.boolgen);
            assert.isDefined(model.nested);
            assert.isUndefined(model.nonexisting);
        });

        it('should apply overrides', function() {
            fakery.fake('complex', mongoose.model('Complex'), {
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

            var model = fakery.make('complex', {
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
        });

        it('should apply overrides', function() {
            fakery.fake('complex', mongoose.model('Complex'), {
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

            var model = fakery.make('complex', {
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
        });

    });

    describe('makeAndSave()', function() {

        before(function() {
            // Mock the save() method on the Mongoose model
            var Complex = mongoose.model('Complex');
            Complex.prototype.save = function(done) {
                this._called = true;
                done(null, this);
            };
        });

        it('should make and save a model without overrides', function(done) {
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

            fakery.fake('complex', mongoose.model('Complex'), spec);

            fakery.makeAndSave('complex', function(err, complex) {
                assert.isTrue(complex._called);
                done();
            });
        });

        it('should make and save a model with overrides', function(done) {
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

            fakery.fake('complex', mongoose.model('Complex'), spec);

            fakery.makeAndSave('complex', overrides, function(err, complex) {
                assert.equal(complex.str, 'str');
                assert.equal(complex.num, 5);
                assert.equal(complex.array[0], 1);
                assert.isTrue(complex._called);
                done();
            });
        });

    });
});
