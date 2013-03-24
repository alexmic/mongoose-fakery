/*===========================================
=            DATA PROVIDER TESTS            =
===========================================*/

'use strict';

var assert = require('chai').assert
  , providers = require('../lib/data_providers')
  , fakeryData = require('../lib/data');

describe('tests packaged data providers', function() {
    it('str()', function() {
        assert.isString(providers.str());
        assert.match(providers.str(), /^[a-z0-9%&!,\.\[\]\{\}#*~]+$/);
        assert.equal(providers.str(15).length, 15);
        assert.isTrue(providers.str(0, 15).length >= 0);
        assert.isTrue(providers.str(0, 15).length <= 15);
        assert.isTrue(providers.str().length >= 0);
        assert.isTrue(providers.str().length <= 100);
    });

    it('hex()', function() {
        assert.isString(providers.hex());
        assert.equal(providers.hex(15).length, 15);
        assert.isTrue(providers.hex(13, 15).length >= 13);
        assert.isTrue(providers.hex(2, 15).length <= 15);
        assert.isTrue(providers.hex().length >= 0);
        assert.isTrue(providers.hex().length <= 100);
    });

    it('alphanum()', function() {
        assert.isString(providers.alphanum());
        assert.equal(providers.alphanum(15).length, 15);
        assert.isTrue(providers.alphanum(0, 15).length >= 0);
        assert.isTrue(providers.alphanum(0, 15).length <= 15);
        assert.isTrue(providers.alphanum().length >= 0);
        assert.isTrue(providers.alphanum().length <= 100);
    });

    it('pick()', function() {
        assert.include([1, 2, 3], providers.pick([1, 2, 3]));
        assert.isUndefined(providers.pick([]));
        assert.isUndefined(providers.pick());
    });

    it('gender()', function() {
        assert.isString(providers.gender());
        assert.include(['m', 'f'], providers.gender());
        assert.include(['m', 'f'], providers.gender('short'));
        assert.include(['male', 'female'], providers.gender('long'));
    });

    it('name()', function() {
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

    it('surname()', function() {
        assert.isString(providers.surname());
        assert.include(fakeryData.surnames, providers.surname());
    });

    it('rndint()', function() {
        assert.isNumber(providers.rndint());
        assert.isTrue(providers.rndint() >= 0);
        assert.isTrue(providers.rndint() <= 100);
        assert.isTrue(providers.rndint(10, 10) >= 10);
        assert.isTrue(providers.rndint(10, 10) <= 10);
        assert.isTrue(providers.rndint(10, 15) >= 10);
        assert.isTrue(providers.rndint(10, 15) <= 15);
    });

    it('rndbool()', function() {
        assert.isBoolean(providers.rndbool());
    });

    it('lorem()', function() {
        assert.equal(providers.lorem().length, 1);
        assert.equal(providers.lorem(0).length, 0);
        assert.equal(providers.lorem(1).length, 1);
        assert.equal(providers.lorem(5).length, 5);
    });
});