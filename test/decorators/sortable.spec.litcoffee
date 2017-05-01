# Sortable

## Overview

## Requires

This is our class under test:

    Sortable = require './sortable'

This loads our assertion framework:

    chai   = require 'chai'
    expect = chai.expect

These tests use [Chai](http://chaijs.com/)'s
[expect](http://chaijs.com/guide/styles/#expect) assertion format. _Please see links
for details._


# Tests

    describe 'The Sortable module', (done) ->

      it 'has both before and after methods', ->
        new Sortable()
          .initialize()
          .then (mod) ->
            expect(mod.before).to.be.a 'function'
            expect(mod.after).to.be.a 'function'
            done()

        null

      describe 'the before method', ->

        it 'defaults input.order to ASC', (done) ->
          input = { }
          new Sortable()
            .initialize()
            .then (mod) -> mod.before input
            .then ->
              expect(input.order).to.equal 'ASC'
              done()

          null

        it 'allows DESC as a valid value', (done) ->
          input = order: 'DESC'
          new Sortable()
            .initialize()
            .then (mod) -> mod.before input
            .then ->
              expect(input.order).to.equal 'DESC'
              done()

          null

        it 'does not allow any value outside ASC or DESC', (done) ->
          input = order: 'groovy'
          new Sortable()
            .initialize()
            .then (mod) -> mod.before input
            .fail (info) ->
              expect(info.order).to.equal 'INVALID'
              done()

          null

      describe 'the after method', ->

        it 'requires @field to be set', (done) ->
          input = order: 'DESC'
          new Sortable()
            .initialize()
            .then (mod) -> mod.after input
            .fail (info) ->
              expect(info.field).to.equal 'INVALID'
              done()

          null

        it "adds an order by clause to a query if:
            1. input.order is valid
            2. @field is set", (done) ->
          input = order: 'DESC'

          sql_stub = orderBy: (clause) -> expect(clause).to.equal 'name DESC'
          new Sortable()
            .initialize()
            .then (mod) ->
              mod.field = 'name'
              mod.after input, sql_stub
            .then -> done()

          null
