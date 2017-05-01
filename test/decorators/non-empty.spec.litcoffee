# NonEmpty

## Overview

## Requires

This is our class under test:

    NonEmpty = require './non-empty'

This loads our assertion framework:

    chai   = require 'chai'
    expect = chai.expect

These tests use [Chai](http://chaijs.com/)'s
[expect](http://chaijs.com/guide/styles/#expect) assertion format. _Please see links
for details._


# Tests

    describe 'The NonEmpty module', (done) ->

      it 'requires @field to be initialized', (done) ->
        new NonEmpty()
          .initialize()
          .then (mod) -> mod.after null, null
          .fail (reason) ->
            expect(reason.field).to.be.null
            done()

        null

      it 'accepts null for input as it does not use it', (done) ->
        sql_stub =
          where: -> this
          and:   -> this

        sql_bricks_stub =
          notEq:     -> this
          isNotNull: -> this

        input = undefined

        new NonEmpty()
          .initialize()
          .then (mod) ->
            mod.field = 'not important'
            mod.after input, sql_stub, sql_bricks_stub
            console.log 'hmmm'
          .then -> done()

        null

      it 'adds clauses to a sql query to filter out null or blank string values', (done) ->

        sql_stub =
          where: (clause) -> this
          and:   (clause) -> this

        sql_bricks_stub =
          notEq: (field, value) ->
            expect(field).to.equal 'test'
            expect(value).to.equal ''
          isNotNull: (field) ->
            expect(field).to.equal 'test'

        new NonEmpty()
          .initialize()
          .then (mod) ->
            mod.field = 'test'
            mod.after undefined, sql_stub, sql_bricks_stub
          .then -> done()

        null
