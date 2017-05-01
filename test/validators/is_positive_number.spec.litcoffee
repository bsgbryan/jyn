# Pageable

## Overview

## Requires

This is our class under test:

    IsPositiveNumber = require './is_positive_number'

This loads our assertion framework:

    chai   = require 'chai'
    expect = chai.expect

These tests use [Chai](http://chaijs.com/)'s
[expect](http://chaijs.com/guide/styles/#expect) assertion format. _Please see links
for details._


# Tests

    describe 'The IsPositiveNumber validator', (done) ->

      it 'has a validate method', ->
        new IsPositiveNumber()
          .initialize()
          .then (mod) ->
            expect(mod.validate).to.be.a 'function'
            done()

        null

      it 'calls the then handler if a positive number is passed in', (done) ->
        new IsPositiveNumber()
          .initialize()
          .then (mod) -> mod.validate { test: 2 }, 'test'
          .then -> done()

        null

      it 'does not pass anything to the then handler', (done) ->
        new IsPositiveNumber()
          .initialize()
          .then (mod) -> mod.validate { test: 2 }, 'test'
          .then (args) ->
            expect(args).to.be.undefined
            done()

        null

      it 'calls the fail handler for any non-positive number passed in', (done) ->
        failures = 0

        new IsPositiveNumber()
          .initialize()
          .then (mod) ->
            mod.validate { test: '0' }, 'test'
          .fail ->
            ++failures
            mod.validate { test: 0 }, 'test'
          .fail ->
            ++failures
            mod.validate { test: -1 }, 'test'
          .fail ->
            ++failures
            mod.validate { test: 'foo' }, 'test'
          .fail ->
            ++failures
            expect(failures).to.equal 4
            done()

        null

      it 'passes the name of the property that failed validation to the fail handler', (done) ->
        new IsPositiveNumber()
          .initialize()
          .then (mod) -> mod.validate { test: 'not positive' }, 'test'
          .fail (property_name) ->
            expect(property_name).to.equal 'test'
            done()

        null
