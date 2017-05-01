# Validator

## Overview

## Requires

This is our class under test:

    Validator = require './validator'

This loads our assertion framework:

    chai   = require 'chai'
    expect = chai.expect

These tests use [Chai](http://chaijs.com/)'s
[expect](http://chaijs.com/guide/styles/#expect) assertion format. _Please see links
for details._


# Tests

    describe 'The Validator module', ->

      it 'adds a single validate method to the pub array', (done) ->

        class TestValidator extends Validator
          validate: -> # Nothing to see here

        new TestValidator()
          .initialize()
          .then (mod) ->
            expect(mod.pub).to.be.an 'array'
            expect(mod.pub.length).to.equal 1
            expect(mod.pub[0]).to.equal 'validate'
            done()

        null

      it 'ensures the validate method is wrapped in promise behavior like normal', (done) ->

        class TestValidator extends Validator
          validate: -> # Nothing to see here

        new TestValidator()
          .initialize()
          .then (mod) ->
            expect(mod.validate).to.be.a 'function'
            expect(mod.validate().then).to.be.a 'function'
            expect(mod.validate().fail).to.be.a 'function'
            expect(mod.validate().progress).to.be.a 'function'
            done()

        null
