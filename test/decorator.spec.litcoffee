# RequestHandler

## Overview

## Requires

This is our class under test:

    Decorator = require './decorator'

This loads our assertion framework:

    chai   = require 'chai'
    expect = chai.expect

These tests use [Chai](http://chaijs.com/)'s
[expect](http://chaijs.com/guide/styles/#expect) assertion format. _Please see links
for details._


# Tests

    describe 'The Decorator module', ->

      it 'adds before to pub if it exists in the decendant module', (done) ->
        class Decorated extends Decorator
          before: ->

        new Decorated()
          .initialize()
          .then (mod) ->
            expect(mod.pub[0]).to.equal 'before'
            done()

        null

      it 'adds after to pub if it exists in the decendant module', (done) ->
        class Decorated extends Decorator
          after: ->

        new Decorated()
          .initialize()
          .then (mod) ->
            expect(mod.pub[0]).to.equal 'after'
            done()

        null

      it "adds before and after in the following order:
          1. before
          2. after
          (even if they are not specified that way in the module declaration)
          to pub if they exist in the decendant module", (done) ->
        class Decorated extends Decorator
          after: ->
          before: ->

        new Decorated()
          .initialize()
          .then (mod) ->
            expect(mod.pub[0]).to.equal 'before'
            expect(mod.pub[1]).to.equal 'after'
            done()

        null
