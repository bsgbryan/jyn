# Pageable

## Overview

## Requires

This is our class under test:

    Pageable = require './pageable'

This loads our assertion framework:

    chai   = require 'chai'
    expect = chai.expect

These tests use [Chai](http://chaijs.com/)'s
[expect](http://chaijs.com/guide/styles/#expect) assertion format. _Please see links
for details._


# Tests

    describe 'The Pageable module', (done) ->

      it 'has both before and after methods', ->
        new Pageable()
          .initialize()
          .then (mod) ->
            expect(mod.before).to.be.a 'function'
            expect(mod.after).to.be.a 'function'
            done()

        null

      describe 'before method', ->

        it 'assigns page and size to default value if not provided', ->
          input = { }
          test = new Pageable()
            .initialize()
            .then (mod) -> mod.before input
            .then ->
              expect(input.page).to.equal 1
              expect(input.size).to.equal 10
              done()

          null

        it 'does not change valid input', ->
          input = page: 4, size: 20
          test = new Pageable()
            .initialize()
            .then (mod) -> mod.before input
            .then ->
              expect(input.page).to.equal 4
              expect(input.size).to.equal 20
              done()

          null

        it 'fails with an error if page is invalid', ->
          input = page: 'not valid'
          test = new Pageable()
            .initialize()
            .then (mod) -> mod.before input
            .fail (info) ->
              expect(info.page).to.equal 'INVALID'
              done()

          null

        it 'fails with an error if size is invalid', ->
          input = size: 'not valid'
          test = new Pageable()
            .initialize()
            .then (mod) -> mod.before input
            .fail (info) ->
              expect(info.size).to.equal 'INVALID'
              done()

          null

        it 'only reports the size error if both fields are invalid', ->
          input = size: 'not valid', page: 'also not valid'
          test = new Pageable()
            .initialize()
            .then (mod) -> mod.before input
            .fail (info) ->
              expect(info.size).to.equal 'INVALID'
              done()

          null

      describe 'after method', ->

        it 'adds offset and limit clauses to a query if a spage and size are specified', (done) ->
          input = page: 2, size: 10

          sql_stub =
            limit: (l) ->
              expect(l).to.equal 10
              offset: (o) ->
                expect(o).to.equal 1 * 10

          new Pageable()
            .initialize()
            .then (mod) -> mod.after input, sql_stub
            .then -> done()

          null

        it 'passes a query through if a page is not specified', (done) ->
          input = size: 10

          sql_stub = 'select * from base'

          new Pageable()
            .initialize()
            .then (mod) -> mod.after input, sql_stub
            .then (query) ->
              expect(query).to.equal sql_stub
              done()

          null

        it 'passes a query through if a size is not specified', (done) ->
          input = page: 10

          sql_stub = 'select * from base'

          new Pageable()
            .initialize()
            .then (mod) -> mod.after input, sql_stub
            .then (query) ->
              expect(query).to.equal sql_stub
              done()

          null

        it 'passes a query through if size is -1', (done) ->
          input = size: -1, page: 1

          sql_stub = 'select * from base'

          new Pageable()
            .initialize()
            .then (mod) -> mod.after input, sql_stub
            .then (query) ->
              expect(query).to.equal sql_stub
              done()

          null
