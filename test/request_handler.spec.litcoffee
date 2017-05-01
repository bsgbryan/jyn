# RequestHandler

## Overview

## Requires

This is our class under test:

    RequestHandler = require './request_handler'

This loads our assertion framework:

    chai   = require 'chai'
    expect = chai.expect

These tests use [Chai](http://chaijs.com/)'s
[expect](http://chaijs.com/guide/styles/#expect) assertion format. _Please see links
for details._


# Tests

    describe 'The RequestHandler module', ->

      it 'uses decorators to wrap its calls', (done) ->
        class TestHandler extends RequestHandler
          wrap: get: [ 'pageable' ]

          get: (input) =>
            expect(input.page).to.equal 1
            expect(input.size).to.equal 10
            done()

        new TestHandler()
          .initialize()
          .then (mod) -> mod.get example: 'input'

        null
